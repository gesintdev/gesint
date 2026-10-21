package br.com.gesint.modules.cfg.settings.documenttype.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.core.base.controller.BaseController;
import br.com.gesint.modules.cfg.settings.documenttype.dto.DocumentTypeRequestDto;
import br.com.gesint.modules.cfg.settings.documenttype.dto.DocumentTypeResponseDto;
import br.com.gesint.modules.cfg.settings.documenttype.service.IDocumentTypeService;

@RestController
@RequestMapping("/api/v1/document-types")
public class DocumentTypeController extends BaseController<DocumentTypeRequestDto, DocumentTypeResponseDto> {

    private final IDocumentTypeService documentTypeService;

    public DocumentTypeController(IDocumentTypeService service) {
        super(service);
        this.documentTypeService = service;
    }

    @GetMapping("/by-context/{context}")
    public ResponseEntity<List<DocumentTypeResponseDto>> findByContext(@PathVariable String context) {
        return ResponseEntity.ok(documentTypeService.findActiveByContext(context));
    }
}
