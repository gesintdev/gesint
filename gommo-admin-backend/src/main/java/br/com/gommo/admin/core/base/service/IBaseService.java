package br.com.gommo.admin.core.base.service;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import java.util.List;
import java.util.UUID;

public interface IBaseService<RequestDto, ResponseDto> {

    List<ResponseDto> findAll();

    ResponseDto findById(UUID id);

    ResponseDto create(RequestDto request);

    ResponseDto update(UUID id, RequestDto request);

    void delete(UUID id);

    PageableResponseDto<ResponseDto> findPage(int page, int size);
}
