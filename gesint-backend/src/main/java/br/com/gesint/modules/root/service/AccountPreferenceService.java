package br.com.gesint.modules.root.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.audit.CurrentAuditor;
import br.com.gesint.core.audit.trail.AuditActionEnum;
import br.com.gesint.core.audit.trail.AuditTrailEntry;
import br.com.gesint.core.audit.trail.AuditTrailRecorder;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.root.dto.AccountPreferencesDto;
import br.com.gesint.modules.root.entity.AppUser;
import br.com.gesint.modules.root.exception.AuthException;
import br.com.gesint.modules.root.repository.AppUserRepository;

@Service
public class AccountPreferenceService implements IAccountPreferenceService {

    private final AppUserRepository appUserRepository;
    private final AuditTrailRecorder auditTrail;

    public AccountPreferenceService(AppUserRepository appUserRepository, AuditTrailRecorder auditTrail) {
        this.appUserRepository = appUserRepository;
        this.auditTrail = auditTrail;
    }

    @Override
    @Transactional(readOnly = true)
    public AccountPreferencesDto getPreferences() {
        return toDto(currentUser());
    }

    @Override
    @Transactional
    public AccountPreferencesDto updatePreferences(AccountPreferencesDto request) {
        AppUser user = currentUser();
        user.setReportPdfDeliveryMode(request.getReportPdfDeliveryMode());
        AppUser saved = appUserRepository.save(user);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.UPDATE, saved)
                .detail("preferência de abertura de relatórios PDF"));
        return toDto(saved);
    }

    private AppUser currentUser() {
        var userId = CurrentAuditor.userId().orElseThrow(AuthException::invalidAccessToken);
        return appUserRepository
                .findByIdAndStatusNot(userId, StatusEnum.DELETED)
                .orElseThrow(AuthException::userNotFound);
    }

    private AccountPreferencesDto toDto(AppUser user) {
        return AccountPreferencesDto.builder()
                .reportPdfDeliveryMode(user.getReportPdfDeliveryMode())
                .build();
    }
}
