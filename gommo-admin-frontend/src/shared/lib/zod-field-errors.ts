import type { ZodError } from "zod";
/** Primeira mensagem por campo (path[0]) para exibir nos inputs. */
export function mapZodFieldErrors<TField extends string>(error: ZodError): Partial<Record<TField, string>> {
    const out: Partial<Record<TField, string>> = {};
    for (const issue of error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !(key in out)) {
            out[key as TField] = issue.message;
        }
    }
    return out;
}
