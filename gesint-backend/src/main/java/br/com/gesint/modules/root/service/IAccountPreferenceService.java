package br.com.gesint.modules.root.service;

import br.com.gesint.modules.root.dto.AccountPreferencesDto;

public interface IAccountPreferenceService {
    AccountPreferencesDto getPreferences();

    AccountPreferencesDto updatePreferences(AccountPreferencesDto request);
}
