package br.com.gommo.modules.rh.person.attendance.publicapi.controller;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.gommo.modules.rh.person.attendance.publicapi.dto.PublicPontoClockRequestDto;
import br.com.gommo.modules.rh.person.attendance.publicapi.dto.PublicPontoClockResponseDto;
import br.com.gommo.modules.rh.person.attendance.publicapi.service.PublicPontoService;

@RestController
@RequestMapping("/api/v1/public/ponto")
public class PublicPontoController {

    private final PublicPontoService publicPontoService;

    public PublicPontoController(PublicPontoService publicPontoService) {
        this.publicPontoService = publicPontoService;
    }

    @PostMapping(value = "/clock", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PublicPontoClockResponseDto> clock(
            @Valid @RequestPart("data") PublicPontoClockRequestDto request,
            @RequestPart("photo") MultipartFile photo) {
        return ResponseEntity.ok(publicPontoService.clock(request, photo));
    }
}
