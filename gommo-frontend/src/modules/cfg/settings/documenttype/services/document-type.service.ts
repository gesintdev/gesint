import type {
    DocumentType,
    DocumentTypeRequestDto,
} from "@/modules/cfg/settings/documenttype/dto/document-type.dto";
import {BaseService} from "@/modules/root/services/base.service";
import {apiFetch} from "@/shared/lib/api.client";

class DocumentTypeService extends BaseService<DocumentType, DocumentTypeRequestDto, DocumentTypeRequestDto> {
    constructor() {
        super("/api/v1/document-types");
    }

    listByContext(context: string) {
        return apiFetch<DocumentType[]>(`${this.basePath}/by-context/${encodeURIComponent(context)}`);
    }
}

export const documentTypeService = new DocumentTypeService();
