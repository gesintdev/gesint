package br.com.gommo.admin.modules.address.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.admin.modules.address.dto.PostalCodeAddressDto;
import br.com.gommo.admin.modules.address.service.AddressLookupService;

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
}
