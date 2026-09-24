package br.com.gommo.modules.storage.access;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import br.com.gommo.core.branch.BranchContextHolder;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.core.security.AuthorityWildcards;
import br.com.gommo.modules.cfg.settings.documenttype.entity.DocumentDataClassEnum;
import br.com.gommo.modules.cfg.settings.documenttype.entity.DocumentType;
import br.com.gommo.modules.cfg.settings.documenttype.repository.DocumentTypeRepository;
import br.com.gommo.modules.storage.access.StorageOwnerAccess.OwnerAuthorities;
import br.com.gommo.modules.storage.entity.StorageObjectLink;
import br.com.gommo.modules.storage.exception.StorageException;
import br.com.gommo.modules.storage.repository.StorageObjectLinkRepository;

/**
 * SEG-01 · D5: anexo herda a permissão da entidade dona e a classe do tipo de documento.
 */
@Component
public class StorageAttachmentAccessGuard {

    private final StorageObjectLinkRepository linkRepository;
    private final DocumentTypeRepository documentTypeRepository;

    public StorageAttachmentAccessGuard(
            StorageObjectLinkRepository linkRepository, DocumentTypeRepository documentTypeRepository) {
        this.linkRepository = linkRepository;
        this.documentTypeRepository = documentTypeRepository;
    }

    /** Lista anexos de uma entidade: exige {@code :read} do módulo dono. */
    public void assertCanList(String entityType) {
        requireActiveBranch();
        OwnerAuthorities owner = StorageOwnerAccess.resolve(entityType)
                .orElseThrow(StorageException::accessDenied);
        requireAuthority(owner.read());
    }

    /**
     * Download / metadados de um objeto: exige {@code :read} e, conforme a classe do tipo,
     * {@code :sensitive}/clinical ou {@code :financial}.
     */
    public void assertCanDownload(UUID storageObjectId) {
        requireActiveBranch();
        List<StorageObjectLink> links =
                linkRepository.findAllByStorageObjectIdAndStatusNot(storageObjectId, StatusEnum.DELETED);
        if (links.isEmpty()) {
            // Objeto órfão (upload sem vínculo): só storage:read do PreAuthorize.
            return;
        }
        for (StorageObjectLink link : links) {
            assertCanDownloadLink(link);
        }
    }

    private void assertCanDownloadLink(StorageObjectLink link) {
        OwnerAuthorities owner = StorageOwnerAccess.resolve(link.getEntityType())
                .orElseThrow(StorageException::accessDenied);
        requireAuthority(owner.read());

        DocumentDataClassEnum dataClass = resolveDataClass(link.getDocumentType());
        switch (dataClass) {
            case SENSIVEL -> {
                if (owner.sensitive() == null || owner.sensitive().isBlank()) {
                    throw StorageException.accessDenied();
                }
                requireAuthority(owner.sensitive());
            }
            case FINANCEIRO -> {
                if (owner.financial() == null || owner.financial().isBlank()) {
                    throw StorageException.accessDenied();
                }
                requireAuthority(owner.financial());
            }
            case COMUM, PESSOAL -> {
                // read já conferido
            }
        }
    }

    private DocumentDataClassEnum resolveDataClass(String documentTypeCode) {
        if (documentTypeCode == null || documentTypeCode.isBlank()) {
            return DocumentDataClassEnum.COMUM;
        }
        return documentTypeRepository
                .findByTypeCodeIgnoreCaseAndStatusNot(documentTypeCode.trim(), StatusEnum.DELETED)
                .map(DocumentType::getDataClass)
                .orElse(DocumentDataClassEnum.COMUM);
    }

    private static void requireActiveBranch() {
        if (BranchContextHolder.getOptional().isEmpty()) {
            throw StorageException.branchRequired();
        }
    }

    private static void requireAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !AuthorityWildcards.allows(authentication.getAuthorities(), authority)) {
            throw StorageException.accessDenied();
        }
    }
}
