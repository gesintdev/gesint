package br.com.gesint.modules.cfg.settings.documenttype.service;

import java.util.List;

import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.cfg.settings.documenttype.dto.DocumentTypeRequestDto;
import br.com.gesint.modules.cfg.settings.documenttype.dto.DocumentTypeResponseDto;

public interface IDocumentTypeService extends IBaseService<DocumentTypeRequestDto, DocumentTypeResponseDto> {

    List<DocumentTypeResponseDto> findActiveByContext(String context);
}
