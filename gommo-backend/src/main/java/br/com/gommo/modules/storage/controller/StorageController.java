package br.com.gommo.modules.storage.controller;

import jakarta.validation.Valid;

import java.io.InputStream;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.gommo.modules.storage.dto.StorageLinkRequestDto;
import br.com.gommo.modules.storage.dto.StorageLinkUpdateRequestDto;
import br.com.gommo.modules.storage.dto.StorageObjectLinkResponseDto;
import br.com.gommo.modules.storage.dto.StorageObjectResponseDto;
import br.com.gommo.modules.storage.service.IStorageService;

@RestController
@RequestMapping("/api/v1/storage")
public class StorageController {

    private final IStorageService storageService;

    public StorageController(IStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StorageObjectResponseDto> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(storageService.upload(file));
    }

    @PostMapping("/links")
    public ResponseEntity<StorageObjectLinkResponseDto> link(@Valid @RequestBody StorageLinkRequestDto request) {
        StorageObjectLinkResponseDto response = storageService.linkToEntity(
                request.getEntityType(),
                request.getEntityId(),
                request.getObjectId(),
                request.getLinkRole(),
                request.getDisplayName(),
                request.getDocumentType());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/links")
    public ResponseEntity<List<StorageObjectLinkResponseDto>> listLinks(
            @RequestParam String entityType, @RequestParam UUID entityId) {
        return ResponseEntity.ok(storageService.listByEntity(entityType, entityId));
    }

    @PatchMapping("/links/{linkId}")
    public ResponseEntity<StorageObjectLinkResponseDto> updateLink(
            @PathVariable UUID linkId, @Valid @RequestBody StorageLinkUpdateRequestDto request) {
        return ResponseEntity.ok(storageService.updateLinkDocumentType(linkId, request.getDocumentType()));
    }

    @GetMapping("/objects/{id}/download")
    public ResponseEntity<InputStreamResource> download(@PathVariable UUID id) {
        StorageObjectResponseDto meta = storageService.findObject(id);
        InputStream stream = storageService.download(id);
        String contentType =
                meta.getContentType() != null ? meta.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        String filename = Path.of(meta.getObjectKey()).getFileName().toString();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(new InputStreamResource(stream));
    }

    @DeleteMapping("/objects/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        storageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
