package br.com.gommo.modules.cfg.settings.digitalcertificate.service;

import java.util.Base64;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.core.base.service.BaseService;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.security.SecretEncryptionService;
import br.com.gommo.modules.cfg.settings.digitalcertificate.dto.DigitalCertificateRequestDto;
import br.com.gommo.modules.cfg.settings.digitalcertificate.dto.DigitalCertificateResponseDto;
import br.com.gommo.modules.cfg.settings.digitalcertificate.entity.DigitalCertificate;
import br.com.gommo.modules.cfg.settings.digitalcertificate.entity.DigitalCertificateTypeEnum;
import br.com.gommo.modules.cfg.settings.digitalcertificate.exception.DigitalCertificateException;
import br.com.gommo.modules.cfg.settings.digitalcertificate.lib.Pkcs12CertificateInspector;
import br.com.gommo.modules.cfg.settings.digitalcertificate.lib.Pkcs12CertificateInspector.InspectedCertificate;
import br.com.gommo.modules.cfg.settings.digitalcertificate.mapper.DigitalCertificateMapper;
import br.com.gommo.modules.cfg.settings.digitalcertificate.repository.DigitalCertificateRepository;

@Service
public class DigitalCertificateService
        extends BaseService<DigitalCertificate, DigitalCertificateRequestDto, DigitalCertificateResponseDto>
        implements IDigitalCertificateService {

    private final DigitalCertificateRepository repository;
    private final DigitalCertificateMapper mapper;
    private final SecretEncryptionService secretEncryptionService;

    public DigitalCertificateService(
            DigitalCertificateRepository repository,
            DigitalCertificateMapper mapper,
            SecretEncryptionService secretEncryptionService) {
        super(repository, mapper::toResponse, request -> DigitalCertificate.builder().build());
        this.repository = repository;
        this.mapper = mapper;
        this.secretEncryptionService = secretEncryptionService;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('digitalcertificate:read')")
    public List<DigitalCertificateResponseDto> findAll() {
        return super.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('digitalcertificate:read')")
    public List<DigitalCertificateResponseDto> findAll(StatusEnum status) {
        return super.findAll(status);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('digitalcertificate:read')")
    public DigitalCertificateResponseDto findById(UUID id) {
        return super.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('digitalcertificate:read')")
    public PageableResponseDto<DigitalCertificateResponseDto> findPage(int page, int size) {
        return super.findPage(page, size);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('digitalcertificate:write')")
    public DigitalCertificateResponseDto create(DigitalCertificateRequestDto request) {
        assertA1Only(request);
        if (isBlank(request.getPkcs12Base64()) || isBlank(request.getPassword())) {
            throw DigitalCertificateException.fileRequired();
        }
        DigitalCertificate entity = DigitalCertificate.builder().status(StatusEnum.ACTIVE).build();
        mapper.applyMetadata(entity, request);
        applyPkcs12(entity, request.getPkcs12Base64(), request.getPassword(), null);
        if (Boolean.TRUE.equals(entity.getIsDefault())) {
            repository.clearDefaultFlags(StatusEnum.DELETED, null);
        }
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('digitalcertificate:write')")
    public DigitalCertificateResponseDto update(UUID id, DigitalCertificateRequestDto request) {
        assertA1Only(request);
        DigitalCertificate entity = findEntity(id);
        mapper.applyMetadata(entity, request);
        boolean replacingFile = !isBlank(request.getPkcs12Base64());
        if (replacingFile) {
            if (isBlank(request.getPassword())) {
                throw DigitalCertificateException.fileRequired();
            }
            applyPkcs12(entity, request.getPkcs12Base64(), request.getPassword(), entity.getId());
        } else if (!isBlank(request.getOwnerDocument())) {
            entity.setOwnerDocument(request.getOwnerDocument().replaceAll("\\D", ""));
        }
        if (Boolean.TRUE.equals(entity.getIsDefault())) {
            repository.clearDefaultFlags(StatusEnum.DELETED, entity.getId());
        }
        return mapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('digitalcertificate:write')")
    public void activate(UUID id) {
        super.activate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('digitalcertificate:write')")
    public void deactivate(UUID id) {
        super.deactivate(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('digitalcertificate:delete')")
    public void delete(UUID id) {
        super.delete(id);
    }

    @Override
    protected DigitalCertificate findEntity(UUID id) {
        return repository
                .findByIdAndStatusNot(id, StatusEnum.DELETED)
                .orElseThrow(DigitalCertificateException::notFound);
    }

    @Override
    protected void updateEntity(DigitalCertificate entity, DigitalCertificateRequestDto request) {
        // Fluxo customizado em update(...).
    }

    private void applyPkcs12(DigitalCertificate entity, String pkcs12Base64, String password, UUID excludeId) {
        byte[] pkcs12Bytes = decodeBase64(pkcs12Base64);
        InspectedCertificate inspected =
                Pkcs12CertificateInspector.inspect(pkcs12Bytes, password.toCharArray());
        repository
                .findByThumbprintAndStatusNot(inspected.thumbprint(), StatusEnum.DELETED)
                .ifPresent(existing -> {
                    if (excludeId == null || !existing.getId().equals(excludeId)) {
                        throw DigitalCertificateException.duplicate();
                    }
                });
        entity.setSubjectName(inspected.subjectName());
        entity.setIssuerName(inspected.issuerName());
        entity.setSerialNumber(inspected.serialNumber());
        entity.setThumbprint(inspected.thumbprint());
        entity.setValidFrom(inspected.validFrom());
        entity.setValidUntil(inspected.validUntil());
        if (isBlank(entity.getOwnerDocument()) && inspected.ownerDocument() != null) {
            entity.setOwnerDocument(inspected.ownerDocument());
        }
        entity.setPkcs12Encrypted(secretEncryptionService.encrypt(pkcs12Bytes));
        entity.setPasswordEncrypted(secretEncryptionService.encryptString(password));
    }

    private static void assertA1Only(DigitalCertificateRequestDto request) {
        if (request.getCertificateType() != null && request.getCertificateType() != DigitalCertificateTypeEnum.A1) {
            throw DigitalCertificateException.a3Unsupported();
        }
    }

    private static byte[] decodeBase64(String value) {
        try {
            String cleaned = value.contains(",") ? value.substring(value.indexOf(',') + 1) : value;
            return Base64.getDecoder().decode(cleaned.trim());
        } catch (IllegalArgumentException ex) {
            throw DigitalCertificateException.invalidPkcs12();
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
