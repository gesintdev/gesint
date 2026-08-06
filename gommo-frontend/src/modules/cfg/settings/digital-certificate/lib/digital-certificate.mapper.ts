import type {
    DigitalCertificate,
    DigitalCertificateCreateDto,
} from "@/modules/cfg/settings/digital-certificate/dto/digital-certificate.dto";

export function emptyDigitalCertificateForm(): DigitalCertificateCreateDto {
    return {
        alias: "",
        certificateType: "A1",
        purpose: "ESOCIAL",
        environment: "HOMOLOGATION",
        ownerDocument: "",
        isDefault: true,
        pkcs12Base64: undefined,
        password: "",
    };
}

export function digitalCertificateToFormDto(entity: DigitalCertificate): DigitalCertificateCreateDto {
    return {
        alias: entity.alias,
        certificateType: entity.certificateType ?? "A1",
        purpose: entity.purpose ?? "ESOCIAL",
        environment: entity.environment ?? "HOMOLOGATION",
        ownerDocument: entity.ownerDocument ?? "",
        isDefault: Boolean(entity.isDefault),
        pkcs12Base64: undefined,
        password: "",
    };
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === "string" ? reader.result : "";
            resolve(result.includes(",") ? result.split(",")[1] ?? "" : result);
        };
        reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler o arquivo."));
        reader.readAsDataURL(file);
    });
}
