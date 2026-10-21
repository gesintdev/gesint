import type { ErrorResponseDto } from "@/shared/exceptions/error-response.dto";

/**
 * Ponto único de saída server→API (Auth.js, proxies de login).
 *
 * Existiam três implementações diferentes: o proxy de login tentava três bases e desligava a
 * verificação de TLS; o refresh usava uma base só, sem fallback e sem TLS relaxado. Resultado em
 * produção: login funcionava e `/auth/refresh` falhava sempre com erro de rede, derrubando a
 * sessão minutos depois. Toda chamada server→API passa por aqui para não divergirem de novo.
 */

export type ServerApiAttempt = { baseUrl: string; detail: string };

export class ServerApiUnreachableError extends Error {
    readonly attempts: ServerApiAttempt[];

    constructor(path: string, attempts: ServerApiAttempt[]) {
        const detail = attempts.map((attempt) => `${attempt.baseUrl} → ${attempt.detail}`).join(" | ");
        super(`Nenhuma base da API respondeu ${path}: ${detail || "nenhuma base configurada"}`);
        this.name = "ServerApiUnreachableError";
        this.attempts = attempts;
    }
}

export type ServerApiResponse = {
    baseUrl: string;
    status: number;
    ok: boolean;
    text: string;
    /** Corpo já desserializado quando é JSON; `undefined` para HTML/vazio (ex.: erro do proxy). */
    json?: unknown;
};

/**
 * Bases candidatas, na ordem de preferência: URL interna do Docker primeiro (evita DNS/TLS
 * público), FQDN pública depois, localhost por último para desenvolvimento nativo.
 */
export function resolveServerApiBaseUrls(): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const raw of [
        process.env.API_INTERNAL_URL,
        process.env.GESINT_BACKEND_INTERNAL_URL,
        process.env.NEXT_PUBLIC_API_URL,
        "http://localhost:8081",
    ]) {
        const url = raw?.trim().replace(/\/$/, "");
        if (!url || seen.has(url)) continue;
        seen.add(url);
        out.push(url);
    }
    return out;
}

/** `fetch failed` do undici não diz nada; o motivo real (ECONNREFUSED, DNS, TLS) vive em `cause`. */
function describeFetchError(error: unknown): string {
    if (!(error instanceof Error)) {
        return String(error);
    }
    const cause = error.cause;
    const causeDetail =
        cause instanceof Error
            ? `${(cause as Error & { code?: string }).code ?? cause.name}: ${cause.message}`
            : cause
              ? String(cause)
              : "";
    return causeDetail ? `${error.message} (${causeDetail})` : error.message;
}

function parseJson(text: string): unknown | undefined {
    if (!text.trim()) {
        return undefined;
    }
    try {
        return JSON.parse(text) as unknown;
    } catch {
        return undefined;
    }
}

/** Payload de erro da API, ou `undefined` quando a resposta não veio do GlobalExceptionHandler. */
export function toErrorPayload(result: ServerApiResponse): ErrorResponseDto | undefined {
    const body = result.json;
    if (typeof body !== "object" || body === null) {
        return undefined;
    }
    const { code, message, correlationId, timestamp } = body as Partial<ErrorResponseDto>;
    if (typeof code !== "string" || !code) {
        return undefined;
    }
    return {
        code,
        message: typeof message === "string" ? message : code,
        correlationId: typeof correlationId === "string" ? correlationId : undefined,
        timestamp: typeof timestamp === "string" ? timestamp : undefined,
    };
}

/**
 * POST em cada base candidata até obter uma resposta conclusiva: 2xx, ou erro estruturado da
 * própria API (tem `code`). HTML/502 do proxy e falha de rede não são conclusivos — segue para a
 * base seguinte. Esgotadas as bases, lança {@link ServerApiUnreachableError} com o que cada uma
 * respondeu, para o motivo aparecer no log em vez de um `UNKNOWN` silencioso.
 */
export async function serverApiPost(
    path: string,
    body: unknown,
    headers: Record<string, string> = {},
): Promise<ServerApiResponse> {
    // Lab Coolify usa certificado self-signed em *.local; sem isso o fetch do server quebra.
    // TODO: remover quando o lab passar a usar certificado confiável.
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const attempts: ServerApiAttempt[] = [];
    for (const baseUrl of resolveServerApiBaseUrls()) {
        let response: Response;
        try {
            response = await fetch(`${baseUrl}${path}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    ...headers,
                },
                body: JSON.stringify(body),
                cache: "no-store",
            });
        } catch (error) {
            attempts.push({ baseUrl, detail: describeFetchError(error) });
            continue;
        }

        const text = await response.text().catch(() => "");
        const result: ServerApiResponse = {
            baseUrl,
            status: response.status,
            ok: response.ok,
            text,
            json: parseJson(text),
        };
        if (result.ok || toErrorPayload(result)) {
            return result;
        }
        attempts.push({ baseUrl, detail: `HTTP ${response.status}: ${text.slice(0, 200) || "(corpo vazio)"}` });
    }
    throw new ServerApiUnreachableError(path, attempts);
}
