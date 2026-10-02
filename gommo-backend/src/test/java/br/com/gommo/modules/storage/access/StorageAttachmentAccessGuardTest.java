package br.com.gommo.modules.storage.access;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import br.com.gommo.core.branch.BranchContextHolder;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.exception.BusinessException;
import br.com.gommo.modules.cfg.settings.documenttype.entity.DocumentDataClassEnum;
import br.com.gommo.modules.cfg.settings.documenttype.entity.DocumentType;
import br.com.gommo.modules.cfg.settings.documenttype.repository.DocumentTypeRepository;
import br.com.gommo.modules.storage.entity.StorageObjectLink;
import br.com.gommo.modules.storage.exception.StorageExceptions;
import br.com.gommo.modules.storage.repository.StorageObjectLinkRepository;

@ExtendWith(MockitoExtension.class)
class StorageAttachmentAccessGuardTest {

    @Mock
    private StorageObjectLinkRepository linkRepository;

    @Mock
    private DocumentTypeRepository documentTypeRepository;

    @InjectMocks
    private StorageAttachmentAccessGuard guard;

    private final UUID objectId = UUID.fromString("11111111-1111-4111-8111-111111111111");
    private final UUID branchId = UUID.fromString("aaaaaaaa-0001-4000-8000-000000000001");

    @BeforeEach
    void setBranch() {
        BranchContextHolder.set(branchId);
    }

    @AfterEach
    void clearContext() {
        BranchContextHolder.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    void downloadAtestadoWithoutLeaveSensitiveIsDenied() {
        authenticate("storage:read", "leave:read");
        when(linkRepository.findAllByStorageObjectIdAndStatusNot(objectId, StatusEnum.DELETED))
                .thenReturn(List.of(leaveLink("ATESTADO")));
        when(documentTypeRepository.findByTypeCodeIgnoreCaseAndStatusNot("ATESTADO", StatusEnum.DELETED))
                .thenReturn(Optional.of(documentType("ATESTADO", DocumentDataClassEnum.SENSIVEL)));

        assertThatThrownBy(() -> guard.assertCanDownload(objectId))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).getCode())
                .isEqualTo(StorageExceptions.ACCESS_DENIED_CODE);
    }

    @Test
    void downloadAtestadoWithLeaveSensitiveIsAllowed() {
        authenticate("storage:read", "leave:read", "leave:sensitive");
        when(linkRepository.findAllByStorageObjectIdAndStatusNot(objectId, StatusEnum.DELETED))
                .thenReturn(List.of(leaveLink("ATESTADO")));
        when(documentTypeRepository.findByTypeCodeIgnoreCaseAndStatusNot("ATESTADO", StatusEnum.DELETED))
                .thenReturn(Optional.of(documentType("ATESTADO", DocumentDataClassEnum.SENSIVEL)));

        assertThat(guard.assertCanDownload(objectId))
                .hasValueSatisfying(restricted -> {
                    assertThat(restricted.dataClass()).isEqualTo(DocumentDataClassEnum.SENSIVEL);
                    assertThat(restricted.ownerLabel()).isEqualTo("Afastamento");
                });
    }

    @Test
    void downloadCommonFormWithLeaveReadIsAllowed() {
        authenticate("storage:read", "leave:read");
        when(linkRepository.findAllByStorageObjectIdAndStatusNot(objectId, StatusEnum.DELETED))
                .thenReturn(List.of(leaveLink("FORMULARIO")));
        when(documentTypeRepository.findByTypeCodeIgnoreCaseAndStatusNot("FORMULARIO", StatusEnum.DELETED))
                .thenReturn(Optional.of(documentType("FORMULARIO", DocumentDataClassEnum.COMUM)));

        assertThat(guard.assertCanDownload(objectId)).isEmpty();
    }

    @Test
    void downloadWithoutBranchIsDenied() {
        BranchContextHolder.clear();
        authenticate("storage:read", "leave:read", "leave:sensitive");

        assertThatThrownBy(() -> guard.assertCanDownload(objectId))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).getCode())
                .isEqualTo(StorageExceptions.BRANCH_REQUIRED_CODE);
    }

    @Test
    void listRequiresOwnerRead() {
        authenticate("storage:read");
        assertThatThrownBy(() -> guard.assertCanList("leave_request"))
                .isInstanceOf(BusinessException.class)
                .extracting(ex -> ((BusinessException) ex).getCode())
                .isEqualTo(StorageExceptions.ACCESS_DENIED_CODE);

        authenticate("storage:read", "leave:read");
        guard.assertCanList("leave_request");
    }

    @Test
    void ownerCatalogResolvesKnownEntityTypes() {
        assertThat(StorageOwnerAccess.resolve("LEAVE_REQUEST")).isPresent();
        assertThat(StorageOwnerAccess.resolve("OCCUPATIONAL_EXAM")).isPresent();
        assertThat(StorageOwnerAccess.resolve("unknown")).isEmpty();
    }

    private void authenticate(String... authorities) {
        List<SimpleGrantedAuthority> granted =
                java.util.Arrays.stream(authorities).map(SimpleGrantedAuthority::new).toList();
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("user", "n/a", granted));
    }

    private static StorageObjectLink leaveLink(String documentType) {
        return StorageObjectLink.builder()
                .entityType("leave_request")
                .entityId(UUID.randomUUID())
                .storageObjectId(UUID.fromString("11111111-1111-4111-8111-111111111111"))
                .linkRole("DOCUMENT")
                .documentType(documentType)
                .status(StatusEnum.ACTIVE)
                .build();
    }

    private static DocumentType documentType(String typeCode, DocumentDataClassEnum dataClass) {
        return DocumentType.builder()
                .typeCode(typeCode)
                .name(typeCode)
                .dataClass(dataClass)
                .status(StatusEnum.ACTIVE)
                .build();
    }
}
