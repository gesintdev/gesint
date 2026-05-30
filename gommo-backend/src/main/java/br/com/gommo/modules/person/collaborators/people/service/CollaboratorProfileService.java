package br.com.gommo.modules.person.collaborators.people.service;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.collaborators.admission.dto.AdmissionProcessRequestDto;
import br.com.gommo.modules.person.collaborators.people.dto.CollaboratorRequestDto;
import br.com.gommo.modules.person.collaborators.people.entity.Collaborator;
import br.com.gommo.modules.person.collaborators.people.entity.CollaboratorAddress;
import br.com.gommo.modules.person.collaborators.people.entity.CollaboratorContact;
import br.com.gommo.modules.person.collaborators.people.exception.CollaboratorException;
import br.com.gommo.modules.person.collaborators.people.mapper.CollaboratorMapper;
import br.com.gommo.modules.person.collaborators.people.repository.CollaboratorAddressRepository;
import br.com.gommo.modules.person.collaborators.people.repository.CollaboratorContactRepository;
import br.com.gommo.modules.person.collaborators.people.repository.CollaboratorRepository;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CollaboratorProfileService {

    private final CollaboratorRepository collaboratorRepository;
    private final CollaboratorMapper collaboratorMapper;
    private final CollaboratorAddressRepository addressRepository;
    private final CollaboratorContactRepository contactRepository;

    public CollaboratorProfileService(
            CollaboratorRepository collaboratorRepository,
            CollaboratorMapper collaboratorMapper,
            CollaboratorAddressRepository addressRepository,
            CollaboratorContactRepository contactRepository) {
        this.collaboratorRepository = collaboratorRepository;
        this.collaboratorMapper = collaboratorMapper;
        this.addressRepository = addressRepository;
        this.contactRepository = contactRepository;
    }

    /**
     * Cria ou atualiza colaborador + endereço + contato a partir dos dados da admissão.
     *
     * @return id do colaborador
     */
    @Transactional
    public UUID syncFromAdmission(AdmissionProcessRequestDto request, UUID existingCollaboratorId) {
        UUID collaboratorId = existingCollaboratorId != null
                ? updateCollaborator(existingCollaboratorId, request)
                : createCollaborator(request);
        upsertPrimaryAddress(collaboratorId, request);
        upsertPrimaryContact(collaboratorId, request);
        return collaboratorId;
    }

    private UUID createCollaborator(AdmissionProcessRequestDto request) {
        collaboratorRepository
                .findByCpfAndStatusNot(request.getCpf(), StatusEnum.DELETED)
                .ifPresent(c -> {
                    throw CollaboratorException.cpfAlreadyExists();
                });

        Collaborator collaborator = collaboratorMapper.toEntity(toCollaboratorDto(request));
        collaborator.setStatus(StatusEnum.ACTIVE);
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
        collaborator.setBirthDate(dto.getBirthDate());
        collaborator.setGender(dto.getGender());
        collaborator.setMaritalStatus(dto.getMaritalStatus());
        collaborator.setMotherName(dto.getMotherName());
        collaborator.setFatherName(dto.getFatherName());
        collaborator.setNationality(dto.getNationality());
        collaborator.setPisPasep(dto.getPisPasep());
        collaboratorRepository.save(collaborator);
        return collaboratorId;
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
        address.setCity(request.getCity());
        address.setStateCode(request.getStateCode());
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
        contactRepository.save(contact);
    }

    private CollaboratorRequestDto toCollaboratorDto(AdmissionProcessRequestDto request) {
        return CollaboratorRequestDto.builder()
                .fullName(request.getFullName())
                .socialName(request.getSocialName())
                .cpf(request.getCpf())
                .rg(request.getRg())
                .birthDate(request.getBirthDate())
                .gender(request.getGender())
                .maritalStatus(request.getMaritalStatus())
                .motherName(request.getMotherName())
                .fatherName(request.getFatherName())
                .nationality(request.getNationality())
                .pisPasep(request.getPisPasep())
                .build();
    }
}
