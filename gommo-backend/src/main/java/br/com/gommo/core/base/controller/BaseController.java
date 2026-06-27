package br.com.gommo.core.base.controller;

import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.IBaseService;

/**
 * CRUD REST padrão. RBAC por módulo fica no {@link IBaseService} (ex.: {@code PersonService}).
 */
public abstract class BaseController<RequestDto, ResponseDto> {

    private final IBaseService<RequestDto, ResponseDto> service;

    protected BaseController(IBaseService<RequestDto, ResponseDto> service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ResponseDto>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/page")
    public ResponseEntity<PageableResponseDto<ResponseDto>> findPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam MultiValueMap<String, String> params) {
        return ResponseEntity.ok(service.findPage(page, size, extractFilters(params)));
    }

    private static Map<String, List<String>> extractFilters(MultiValueMap<String, String> params) {
        return params.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith("filter."))
                .collect(Collectors.toMap(entry -> entry.getKey().substring("filter.".length()), Map.Entry::getValue));
    }

    private static final String UUID_PATH = "/{id:[0-9a-fA-F\\-]{36}}";

    @GetMapping(UUID_PATH)
    public ResponseEntity<ResponseDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<ResponseDto> create(@Valid @RequestBody RequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping(UUID_PATH)
    public ResponseEntity<ResponseDto> update(@PathVariable UUID id, @Valid @RequestBody RequestDto request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping(UUID_PATH)
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
