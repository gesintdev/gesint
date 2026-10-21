package br.com.gesint.modules.rh.person.collaborators.people.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gesint.core.branch.BranchContextHolder;
import br.com.gesint.core.branch.BranchScopedEntity;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.collaborators.address.service.AddressReferenceResolver;
import br.com.gesint.modules.rh.person.collaborators.admission.dto.AdmissionProcessRequestDto;
import br.com.gesint.modules.rh.person.collaborators.people.dto.CollaboratorRequestDto;
import br.com.gesint.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gesint.modules.rh.person.collaborators.people.entity.CollaboratorAddress;
import br.com.gesint.modules.rh.person.collaborators.people.entity.CollaboratorContact;
import br.com.gesint.modules.rh.person.collaborators.people.exception.CollaboratorException;
import br.com.gesint.modules.rh.person.collaborators.people.mapper.CollaboratorMapper;
import br.com.gesint.modules.rh.person.collaborators.people.repository.CollaboratorAddressRepository;
import br.com.gesint.modules.rh.person.collaborators.people.repository.CollaboratorContactRepository;
import br.com.gesint.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gesint.modules.root.search.document.SearchDocumentType;
import br.com.gesint.modules.root.search.document.service.ISearchDocumentIndexer;
import br.com.gesint.modules.root.search.service.provider.CollaboratorGlobalSearchProvider;

@Service
public class CollaboratorProfileService {

    private final CollaboratorRepository collaboratorRepository;
    private final CollaboratorMapper collaboratorMapper;
    private final CollaboratorAddressRepository addressRepository;
    private final CollaboratorContactRepository contactRepository;
    private final AddressReferenceResolver addressReferenceResolver;
    private final ISearchDocumentIndexer searchDocumentIndexer;
    private final CollaboratorAccessCodeGenerator accessCodeGenerator;

    public CollaboratorProfileService(
            CollaboratorRepository collaboratorRepository,
            CollaboratorMapper collaboratorMapper,
            CollaboratorAddressRepository addressRepository,
            CollaboratorContactRepository contactRepository,
            AddressReferenceResolver addressReferenceResolver,
            ISearchDocumentIndexer searchDocumentIndexer,
            CollaboratorAccessCodeGenerator accessCodeGenerator) {
        this.collaboratorRepository = collaboratorRepository;
        this.collaboratorMapper = collaboratorMapper;
        this.addressRepository = addressRepository;
        this.contactRepository = contactRepository;
        this.addressReferenceResolver = addressReferenceResolver;
        this.searchDocumentIndexer = searchDocumentIndexer;
        this.accessCodeGenerator = accessCodeGenerator;
    }

    /**
     * Cria ou atualiza colaborador + endereço + contato a partir dos dados da admissão.
     *
     * @return id do colaborador
     */
    @Transactional
    public UUID syncFromAdmission(AdmissionProcessRequestDto request, UUID existingCollaboratorId) {
        UUID collaboratorId;
        if (existingCollaboratorId != null) {
            collaboratorId = updateCollaborator(existingCollaboratorId, request);
        } else if (StringUtils.hasText(request.getCpf())) {
            // Admissões legadas/sem vínculo: reaproveita colaborador existente pelo CPF em vez de falhar.
            collaboratorId = collaboratorRepository
                    .findByCpfAndStatusNot(request.getCpf(), StatusEnum.DELETED)
                    .map(existing -> updateCollaborator(existing.getId(), request))
                    .orElseGet(() -> createCollaborator(request));
        } else {
            collaboratorId = createCollaborator(request);
        }
        upsertPrimaryAddress(collaboratorId, request);
        upsertPrimaryContact(collaboratorId, request);
        collaboratorRepository.findById(collaboratorId).ifPresent(this::indexCollaborator);
        return collaboratorId;
    }

    private void indexCollaborator(Collaborator collaborator) {
        String displayName = collaborator.getSocialName() != null && !collaborator.getSocialName().isBlank()
                ? collaborator.getSocialName()
                : collaborator.getFullName();
        String searchText = collaborator.getFullName()
                + (collaborator.getSocialName() != null ? " " + collaborator.getSocialName() : "")
                + (collaborator.getCpf() != null ? " " + collaborator.getCpf() : "");
        searchDocumentIndexer.upsert(
                SearchDocumentType.PERSON,
                collaborator.getId(),
                collaborator.getCompanyId(),
                displayName,
                CollaboratorGlobalSearchProvider.formatCpfLabel(collaborator.getCpf()),
                searchText,
                CollaboratorGlobalSearchProvider.HREF);
    }

    private UUID createCollaborator(AdmissionProcessRequestDto request) {
        collaboratorRepository
                .findByCpfAndStatusNot(request.getCpf(), StatusEnum.DELETED)
                .ifPresent(c -> {
                    throw CollaboratorException.cpfAlreadyExists();
                });

        Collaborator collaborator = collaboratorMapper.toEntity(toCollaboratorDto(request));
        collaborator.setStatus(StatusEnum.ACTIVE);
        collaborator.setAccessCode(allocateAccessCode());
        applyBranchScope(collaborator, request.getCompanyId());
        return collaboratorRepository.save(collaborator).getId();
    }

    private UUID updateCollaborator(UUID collaboratorId, AdmissionProcessRequestDto request) {
        Collaborator collaborator = collaboratorRepository
                .findById(collaboratorId)
                .filter(c -> c.getStatus() != StatusEnum.DELETED)
                .orElseThrow(CollaboratorException::notFound);

        collaboratorRepository
                .findByCpfAndStatusNot(request.getCpf(), StatusEnum.DELETED)
                .filter(c -> !c.getId().equals(collaboratorId))
                .ifPresent(c -> {
                    throw CollaboratorException.cpfAlreadyExists();
                });

        CollaboratorRequestDto dto = toCollaboratorDto(request);
        collaborator.setFullName(dto.getFullName());
        collaborator.setSocialName(dto.getSocialName());
        collaborator.setCpf(dto.getCpf());
        collaborator.setRg(dto.getRg());
        collaborator.setRgIssuer(dto.getRgIssuer());
        collaborator.setRgStateCode(dto.getRgStateCode());
        collaborator.setBirthDate(dto.getBirthDate());
        collaborator.setGender(dto.getGender());
        collaborator.setMaritalStatus(dto.getMaritalStatus());
        collaborator.setMotherName(dto.getMotherName());
        collaborator.setFatherName(dto.getFatherName());
        collaborator.setNationality(dto.getNationality());
        collaborator.setPisPasep(dto.getPisPasep());
        collaborator.setPhotoObjectId(dto.getPhotoObjectId());
        if (collaborator.getAccessCode() == null || collaborator.getAccessCode().isBlank()) {
            collaborator.setAccessCode(allocateAccessCode());
        }
        applyBranchScope(collaborator, request.getCompanyId());
        collaboratorRepository.save(collaborator);
        return collaboratorId;
    }

    private String allocateAccessCode() {
        for (int attempt = 0; attempt < 40; attempt++) {
            String code = accessCodeGenerator.generate();
            if (!collaboratorRepository.existsByAccessCodeAndStatusNot(code, StatusEnum.DELETED)) {
                return code;
            }
        }
        throw CollaboratorException.accessCodeGenerationFailed();
    }

    private void upsertPrimaryAddress(UUID collaboratorId, AdmissionProcessRequestDto request) {
        CollaboratorAddress address = addressRepository
                .findFirstByCollaboratorIdAndPrimaryAddressTrueAndStatusNot(collaboratorId, StatusEnum.DELETED)
                .orElseGet(() -> CollaboratorAddress.builder()
                        .collaboratorId(collaboratorId)
                        .primaryAddress(true)
                        .status(StatusEnum.ACTIVE)
                        .build());

        address.setZipCode(request.getZipCode());
        address.setStreet(request.getStreet());
        address.setNumber(request.getNumber());
        address.setComplement(request.getComplement());
        address.setDistrict(request.getDistrict());
        var reference = addressReferenceResolver.resolve(request.getStateId(), request.getCityId());
        address.setCity(reference.city());
        address.setState(reference.state());
        applyBranchScope(address, request.getCompanyId());
        addressRepository.save(address);
    }

    private void upsertPrimaryContact(UUID collaboratorId, AdmissionProcessRequestDto request) {
        CollaboratorContact contact = contactRepository
                .findFirstByCollaboratorIdAndPrimaryContactTrueAndStatusNot(collaboratorId, StatusEnum.DELETED)
                .orElseGet(() -> CollaboratorContact.builder()
                        .collaboratorId(collaboratorId)
                        .primaryContact(true)
                        .status(StatusEnum.ACTIVE)
                        .build());

        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        applyBranchScope(contact, request.getCompanyId());
        contactRepository.save(contact);
    }

    private static void applyBranchScope(BranchScopedEntity entity, UUID admissionCompanyId) {
        if (admissionCompanyId != null) {
            entity.setCompanyId(admissionCompanyId);
            return;
        }
        if (entity.getCompanyId() == null) {
            BranchContextHolder.getOptional().ifPresent(entity::setCompanyId);
        }
    }

    private CollaboratorRequestDto toCollaboratorDto(AdmissionProcessRequestDto request) {
        return CollaboratorRequestDto.builder()
                .fullName(request.getFullName())
                .socialName(request.getSocialName())
                .cpf(request.getCpf())
                .rg(request.getRg())
                .rgIssuer(request.getRgIssuer())
                .rgStateCode(request.getRgStateCode())
                .birthDate(request.getBirthDate())
                .gender(request.getGender())
                .maritalStatus(request.getMaritalStatus())
                .motherName(request.getMotherName())
                .fatherName(request.getFatherName())
                .nationality(request.getNationality())
                .pisPasep(request.getPisPasep())
                .photoObjectId(request.getPhotoObjectId())
                .build();
    }
}
