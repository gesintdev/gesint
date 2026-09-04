package br.com.gommo.admin.modules.address.service;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import br.com.gommo.admin.modules.address.dto.BrasilApiCepResponseDto;
import br.com.gommo.admin.modules.address.dto.PostalCodeAddressDto;
import br.com.gommo.admin.modules.address.dto.ViaCepResponseDto;
import br.com.gommo.admin.modules.address.exception.AddressException;

@Service
public class AddressLookupService {

    private final RestClient viaCepClient;
    private final RestClient brasilApiClient;

    public AddressLookupService() {
        this.viaCepClient = RestClient.builder().baseUrl("https://viacep.com.br/ws").build();
        this.brasilApiClient = RestClient.builder().baseUrl("https://brasilapi.com.br/api/cep/v2").build();
    }

    @PreAuthorize("hasAuthority('platform:admin')")
    public PostalCodeAddressDto findByPostalCode(String postalCode) {
        String normalized = postalCode == null ? "" : postalCode.replaceAll("\\D", "");
        if (normalized.length() != 8) {
            throw AddressException.invalidPostalCode();
        }

        PostalCodeAddressDto viaCep = lookupViaCep(normalized);
        if (viaCep != null) {
            return viaCep;
        }

        PostalCodeAddressDto brasilApi = lookupBrasilApi(normalized);
        if (brasilApi != null) {
            return brasilApi;
        }

        throw AddressException.postalCodeNotFound();
    }

    private PostalCodeAddressDto lookupViaCep(String normalized) {
        try {
            ViaCepResponseDto response = viaCepClient
                    .get()
                    .uri("/{postalCode}/json", normalized)
                    .retrieve()
                    .body(ViaCepResponseDto.class);
            if (response == null || response.hasError()) {
                return null;
            }
            return PostalCodeAddressDto.builder()
                    .zipCode(normalized)
                    .street(blankToNull(response.getLogradouro()))
                    .complement(blankToNull(response.getComplemento()))
                    .district(blankToNull(response.getBairro()))
                    .city(blankToNull(response.getLocalidade()))
                    .stateCode(normalizeUf(response.getUf()))
                    .build();
        } catch (RestClientException ex) {
            return null;
        }
    }

    private PostalCodeAddressDto lookupBrasilApi(String normalized) {
        try {
            BrasilApiCepResponseDto response = brasilApiClient
                    .get()
                    .uri("/{postalCode}", normalized)
                    .retrieve()
                    .body(BrasilApiCepResponseDto.class);
            if (response == null) {
                return null;
            }
            return PostalCodeAddressDto.builder()
                    .zipCode(normalized)
                    .street(blankToNull(response.getStreet()))
                    .district(blankToNull(response.getNeighborhood()))
                    .city(blankToNull(response.getCity()))
                    .stateCode(normalizeUf(response.getState()))
                    .build();
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().value() == 404) {
                return null;
            }
            throw AddressException.providerUnavailable();
        } catch (RestClientException ex) {
            throw AddressException.providerUnavailable();
        }
    }

    private String normalizeUf(String uf) {
        String trimmed = blankToNull(uf);
        return trimmed == null ? null : trimmed.toUpperCase();
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
