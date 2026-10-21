package br.com.gesint.modules.careers.page.controller;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.gesint.modules.careers.page.dto.CareersAssetResponseDto;
import br.com.gesint.modules.careers.page.dto.CareersPageRequestDto;
import br.com.gesint.modules.careers.page.dto.CareersPageResponseDto;
import br.com.gesint.modules.careers.page.service.CareersPageService;

@RestController
@RequestMapping("/api/v1/careers-page")
public class CareersPageController {

    private final CareersPageService service;

    public CareersPageController(CareersPageService service) {
        this.service = service;
    }

    @GetMapping
    public CareersPageResponseDto getDraft() {
        return service.getDraft();
    }

    @PutMapping
    public CareersPageResponseDto saveDraft(@Valid @RequestBody CareersPageRequestDto request) {
        return service.saveDraft(request);
    }

    @PostMapping("/publish")
    public CareersPageResponseDto publish() {
        return service.publish();
    }

    @PostMapping("/discard")
    public CareersPageResponseDto discard() {
        return service.discard();
    }

    @PostMapping("/unpublish")
    public CareersPageResponseDto unpublish() {
        return service.unpublish();
    }

    @PostMapping(value = "/assets", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CareersAssetResponseDto uploadAsset(@RequestPart("file") MultipartFile file) {
        return service.uploadAsset(file);
    }
}
