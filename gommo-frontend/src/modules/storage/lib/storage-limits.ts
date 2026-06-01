/** Limite alinhado ao backend (`gommo.storage.max-file-size`). */
export const STORAGE_MAX_FILE_BYTES = 25 * 1024 * 1024;

export function formatStorageMaxFileSize(): string {
    return "25 MB";
}

export function isStorageFileTooLarge(bytes: number): boolean {
    return bytes > STORAGE_MAX_FILE_BYTES;
}
