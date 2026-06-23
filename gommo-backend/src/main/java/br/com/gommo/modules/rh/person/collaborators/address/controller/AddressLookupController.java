package br.com.gommo.modules.rh.person.collaborators.address.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.modules.rh.person.collaborators.address.dto.LocationOptionDto;
import br.com.gommo.modules.rh.person.collaborators.address.dto.PostalCodeAddressDto;
import br.com.gommo.modules.rh.person.collaborators.address.service.AddressLookupService;

@RestController
@RequestMapping("/api/v1/addresses")
public class AddressLookupController {

    private final AddressLookupService service;

    public AddressLookupController(AddressLookupService service) {
        this.service = service;
    }

    @GetMapping("/postal-code/{postalCode}")
    public PostalCodeAddressDto findByPostalCode(@PathVariable String postalCode) {
        return service.findByPostalCode(postalCode);
    }

    @GetMapping("/states")
    public PageableResponseDto<LocationOptionDto> searchStates(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        return service.searchStates(query, page, size);
    }

    @GetMapping("/cities")
    public PageableResponseDto<LocationOptionDto> searchCities(
            @RequestParam UUID stateId,
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        return service.searchCities(stateId, query, page, size);
    }
}
