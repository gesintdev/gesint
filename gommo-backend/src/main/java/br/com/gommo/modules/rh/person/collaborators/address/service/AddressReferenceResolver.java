package br.com.gommo.modules.rh.person.collaborators.address.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import br.com.gommo.modules.rh.person.collaborators.address.entity.City;
import br.com.gommo.modules.rh.person.collaborators.address.entity.State;
import br.com.gommo.modules.rh.person.collaborators.address.exception.AddressException;
import br.com.gommo.modules.rh.person.collaborators.address.repository.CityRepository;
import br.com.gommo.modules.rh.person.collaborators.address.repository.StateRepository;

@Service
public class AddressReferenceResolver {

    private final StateRepository stateRepository;
    private final CityRepository cityRepository;

    public AddressReferenceResolver(StateRepository stateRepository, CityRepository cityRepository) {
        this.stateRepository = stateRepository;
        this.cityRepository = cityRepository;
    }

    public AddressReference resolve(UUID stateId, UUID cityId) {
        if (stateId == null && cityId == null) {
            return new AddressReference(null, null);
        }
        if (stateId == null) {
            throw AddressException.stateNotFound();
        }
        State state = stateRepository.findById(stateId).orElseThrow(AddressException::stateNotFound);
        City city = cityId == null ? null : cityRepository.findById(cityId).orElseThrow(AddressException::cityNotFound);
        if (city != null && !city.getState().getId().equals(state.getId())) {
            throw AddressException.cityNotFound();
        }
        return new AddressReference(state, city);
    }

    public record AddressReference(State state, City city) {}
}
