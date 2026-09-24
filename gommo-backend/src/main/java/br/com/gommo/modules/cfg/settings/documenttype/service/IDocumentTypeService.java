package br.com.gommo.modules.cfg.settings.documenttype.service;

import java.util.List;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.cfg.settings.documenttype.dto.DocumentTypeRequestDto;
import br.com.gommo.modules.cfg.settings.documenttype.dto.DocumentTypeResponseDto;

public interface IDocumentTypeService extends IBaseService<DocumentTypeRequestDto, DocumentTypeResponseDto> {

    List<DocumentTypeResponseDto> findActiveByContext(String context);
}
