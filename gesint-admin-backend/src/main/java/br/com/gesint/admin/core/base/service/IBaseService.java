package br.com.gesint.admin.core.base.service;

import java.util.List;
import java.util.UUID;

import br.com.gesint.admin.core.base.dto.PageableResponseDto;
import br.com.gesint.admin.core.entity.StatusEnum;

public interface IBaseService<RequestDto, ResponseDto> {

    List<ResponseDto> findAll();

    List<ResponseDto> findAll(StatusEnum status);

    ResponseDto findById(UUID id);

    ResponseDto create(RequestDto request);

    ResponseDto update(UUID id, RequestDto request);

    void delete(UUID id);

    void activate(UUID id);

    void deactivate(UUID id);

    PageableResponseDto<ResponseDto> findPage(int page, int size);
}
