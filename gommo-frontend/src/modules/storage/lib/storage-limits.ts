/** Limite alinhado ao backend (`gommo.storage.max-file-size`). */
export const STORAGE_MAX_FILE_BYTES = 25 * 1024 * 1024;

export function formatStorageMaxFileSize(): string {
    return "25 MB";
}

export function isStorageFileTooLarge(bytes: number): boolean {
    return bytes > STORAGE_MAX_FILE_BYTES;
}

export function invalidUploadFileMessage(file: File | null | undefined): string | null {
    if (!file || file.size <= 0) {
        return "Arquivo vazio ou inválido. Selecione um arquivo com conteúdo.";
    }
    if (isStorageFileTooLarge(file.size)) {
        return `Arquivo excede o tamanho máximo de ${formatStorageMaxFileSize()}.`;
    }
    return null;
}
