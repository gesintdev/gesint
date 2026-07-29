package br.com.gommo.core.base.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.entity.StatusEnum;

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

    default PageableResponseDto<ResponseDto> findPage(int page, int size, Map<String, List<String>> filters) {
        return findPage(page, size);
    }
}
