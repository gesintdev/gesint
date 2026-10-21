package br.com.gesint.modules.careers.site.controller;

import java.time.Duration;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.gesint.modules.careers.page.service.CareersPublicAsset;
import br.com.gesint.modules.careers.site.dto.CareersApplicationRequestDto;
import br.com.gesint.modules.careers.site.dto.CareersApplicationResponseDto;
import br.com.gesint.modules.careers.site.dto.CareersSiteResponseDto;
import br.com.gesint.modules.careers.site.dto.CareersVacancyResponseDto;
import br.com.gesint.modules.careers.site.service.CareersSiteService;

@RestController
@RequestMapping("/api/v1/public/careers")
public class CareersSiteController {

    private final CareersSiteService siteService;

    public CareersSiteController(CareersSiteService siteService) {
        this.siteService = siteService;
    }

    @GetMapping
    public ResponseEntity<CareersSiteResponseDto> getSite() {
        return ResponseEntity.ok(siteService.getSite());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<CareersVacancyResponseDto> getVacancy(@PathVariable String slug) {
        return ResponseEntity.ok(siteService.getVacancy(slug));
    }

    @PostMapping(value = "/{slug}/applications", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CareersApplicationResponseDto> apply(
            @PathVariable String slug,
            @Valid @RequestPart("data") CareersApplicationRequestDto request,
            @RequestPart(value = "resume", required = false) MultipartFile resume) {
        return ResponseEntity.status(HttpStatus.CREATED).body(siteService.apply(slug, request, resume));
    }

    @GetMapping("/assets/{objectId}")
    public ResponseEntity<InputStreamResource> getAsset(@PathVariable UUID objectId) {
        CareersPublicAsset asset = siteService.openAsset(objectId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(asset.contentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(1)).cachePublic())
                .header("X-Content-Type-Options", "nosniff")
                .body(new InputStreamResource(asset.stream()));
    }
}
