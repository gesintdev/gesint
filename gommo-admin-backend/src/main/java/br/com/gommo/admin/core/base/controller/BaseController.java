package br.com.gommo.admin.core.base.controller;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.core.base.service.IBaseService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

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
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.findPage(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<ResponseDto> create(@Valid @RequestBody RequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto> update(@PathVariable UUID id, @Valid @RequestBody RequestDto request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
