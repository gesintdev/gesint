package br.com.gommo.core.base.service;

import java.util.List;
import java.util.UUID;

import br.com.gommo.core.base.dto.PageableResponseDto;

public interface IBaseService<RequestDto, ResponseDto> {

    List<ResponseDto> findAll();

    ResponseDto findById(UUID id);

    ResponseDto create(RequestDto request);

    ResponseDto update(UUID id, RequestDto request);

    void delete(UUID id);

    PageableResponseDto<ResponseDto> findPage(int page, int size);
}
