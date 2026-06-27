package br.com.gommo.modules.rh.person.collaborators.address.service;

import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.modules.rh.person.collaborators.address.dto.LocationOptionDto;
import br.com.gommo.modules.rh.person.collaborators.address.dto.PostalCodeAddressDto;
import br.com.gommo.modules.rh.person.collaborators.address.dto.ViaCepResponseDto;
import br.com.gommo.modules.rh.person.collaborators.address.entity.City;
import br.com.gommo.modules.rh.person.collaborators.address.entity.State;
import br.com.gommo.modules.rh.person.collaborators.address.exception.AddressException;
import br.com.gommo.modules.rh.person.collaborators.address.repository.CityRepository;
import br.com.gommo.modules.rh.person.collaborators.address.repository.StateRepository;

@Service
public class AddressLookupService {

    private static final int MAX_PAGE_SIZE = 50;
    private final StateRepository stateRepository;
    private final CityRepository cityRepository;
    private final RestClient viaCepClient;

    public AddressLookupService(
            StateRepository stateRepository, CityRepository cityRepository, RestClient.Builder restClientBuilder) {
        this.stateRepository = stateRepository;
        this.cityRepository = cityRepository;
        this.viaCepClient =
                restClientBuilder.baseUrl("https://viacep.com.br/ws").build();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('admission:read')")
    public PageableResponseDto<LocationOptionDto> searchStates(String query, int page, int size) {
        String term = likePattern(query);
        var pageable = PageRequest.of(
                Math.max(page, 0), normalizeSize(size), Sort.by("name").ascending());
        var result = stateRepository.searchByTerm(term, pageable);
        return PageableResponseDto.<LocationOptionDto>builder()
                .content(result.getContent().stream().map(this::toOption).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('admission:read')")
    public PageableResponseDto<LocationOptionDto> searchCities(UUID stateId, String query, int page, int size) {
        if (!stateRepository.existsById(stateId)) {
            throw AddressException.stateNotFound();
        }
        String term = likePattern(query);
        var pageable = PageRequest.of(
                Math.max(page, 0), normalizeSize(size), Sort.by("name").ascending());
        var result = cityRepository.searchByStateAndTerm(stateId, term, pageable);
        return PageableResponseDto.<LocationOptionDto>builder()
                .content(result.getContent().stream().map(this::toOption).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('admission:read')")
    public PostalCodeAddressDto findByPostalCode(String postalCode) {
        String normalized = postalCode == null ? "" : postalCode.replaceAll("\\D", "");
        if (normalized.length() != 8) {
            throw AddressException.invalidPostalCode();
        }

        ViaCepResponseDto response;
        try {
            response = viaCepClient
                    .get()
                    .uri("/{postalCode}/json", normalized)
                    .retrieve()
                    .body(ViaCepResponseDto.class);
        } catch (RestClientException ex) {
            throw AddressException.providerUnavailable();
        }
        if (response == null || response.isErro()) {
            throw AddressException.postalCodeNotFound();
        }

        Integer cityIbgeCode;
        try {
            cityIbgeCode = Integer.valueOf(response.getIbge());
        } catch (NumberFormatException ex) {
            throw AddressException.cityNotFound();
        }
        City city = cityRepository.findByIbgeCode(cityIbgeCode).orElseThrow(AddressException::cityNotFound);
        return PostalCodeAddressDto.builder()
                .zipCode(normalized)
                .street(response.getLogradouro())
                .complement(response.getComplemento())
                .district(response.getBairro())
                .cityId(city.getId())
                .cityName(city.getName())
                .cityIbgeCode(city.getIbgeCode())
                .stateId(city.getState().getId())
                .stateCode(city.getState().getAbbreviation())
                .stateName(city.getState().getName())
                .build();
    }

    private int normalizeSize(int size) {
        return Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
    }

    private String likePattern(String query) {
        String term = query == null ? "" : query.trim();
        return "%" + term + "%";
    }

    private LocationOptionDto toOption(State state) {
        return LocationOptionDto.builder()
                .id(state.getId())
                .name(state.getName())
                .code(state.getAbbreviation())
                .ibgeCode(state.getIbgeCode())
                .build();
    }

    private LocationOptionDto toOption(City city) {
        return LocationOptionDto.builder()
                .id(city.getId())
                .name(city.getName())
                .ibgeCode(city.getIbgeCode())
                .stateId(city.getState().getId())
                .stateCode(city.getState().getAbbreviation())
                .build();
    }
}
