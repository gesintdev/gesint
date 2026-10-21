export class StorageObject {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    bucket!: string;
    objectKey!: string;
    versionId?: string;
    isLatest?: boolean;
    contentType?: string;
    contentLength?: number;
    etag?: string;
    storageClass?: string;
    sha256Hex?: string;
    metadata?: Record<string, unknown>;
    createdAt?: string;
    updatedAt?: string;
}

export class StorageObjectLink {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    storageObjectId!: string;
    entityType!: string;
    entityId!: string;
    linkRole?: string;
    displayName?: string;
    documentType?: string;
    storageObject?: StorageObject;
    createdAt?: string;
    updatedAt?: string;
}

export class StorageLinkRequest {
    objectId!: string;
    entityType!: string;
    entityId!: string;
    linkRole?: string;
    displayName?: string;
    documentType?: string;
}
