package br.com.gommo.modules.rh.person.jobvacancy.publicapi.controller;

import jakarta.validation.Valid;

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

import br.com.gommo.modules.rh.person.jobvacancy.publicapi.dto.PublicJobApplicationRequestDto;
import br.com.gommo.modules.rh.person.jobvacancy.publicapi.dto.PublicJobApplicationResponseDto;
import br.com.gommo.modules.rh.person.jobvacancy.publicapi.dto.PublicJobVacancyResponseDto;
import br.com.gommo.modules.rh.person.jobvacancy.publicapi.service.PublicCareersService;

@RestController
@RequestMapping("/api/v1/public/careers")
public class PublicCareersController {

    private final PublicCareersService publicCareersService;

    public PublicCareersController(PublicCareersService publicCareersService) {
        this.publicCareersService = publicCareersService;
    }

    @GetMapping("/{slug}")
    public ResponseEntity<PublicJobVacancyResponseDto> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(publicCareersService.getPublishedBySlug(slug));
    }

    @PostMapping(value = "/{slug}/applications", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PublicJobApplicationResponseDto> apply(
            @PathVariable String slug,
            @Valid @RequestPart("data") PublicJobApplicationRequestDto request,
            @RequestPart(value = "resume", required = false) MultipartFile resume) {
        return ResponseEntity.status(HttpStatus.CREATED).body(publicCareersService.apply(slug, request, resume));
    }
}
