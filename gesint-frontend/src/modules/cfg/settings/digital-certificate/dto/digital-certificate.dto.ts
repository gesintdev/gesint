export type DigitalCertificateType = "A1";
export type DigitalCertificatePurpose = "ESOCIAL" | "GENERAL";
export type DigitalCertificateEnvironment = "HOMOLOGATION" | "PRODUCTION";

export class DigitalCertificate {
    id!: string;
    code!: number;
    status!: string;
    alias!: string;
    certificateType!: DigitalCertificateType;
    purpose!: DigitalCertificatePurpose;
    environment!: DigitalCertificateEnvironment;
    ownerDocument?: string;
    subjectName?: string;
    issuerName?: string;
    serialNumber?: string;
    thumbprint?: string;
    validFrom?: string;
    validUntil?: string;
    isDefault!: boolean;
    expired!: boolean;
    certificateUploaded!: boolean;
}

export class DigitalCertificateCreateDto {
    alias!: string;
    certificateType!: DigitalCertificateType;
    purpose!: DigitalCertificatePurpose;
    environment!: DigitalCertificateEnvironment;
    ownerDocument?: string;
    isDefault?: boolean;
    pkcs12Base64?: string;
    password?: string;
}
