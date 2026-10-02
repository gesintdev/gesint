package br.com.gommo.modules.careers.page.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.gommo.core.audit.CurrentAuditor;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.careers.integration.CareersPlatformGateway;
import br.com.gommo.modules.careers.page.dto.CareersAssetResponseDto;
import br.com.gommo.modules.careers.page.dto.CareersBlockDto;
import br.com.gommo.modules.careers.page.dto.CareersPageRequestDto;
import br.com.gommo.modules.careers.page.dto.CareersPageResponseDto;
import br.com.gommo.modules.careers.page.dto.CareersPageSnapshotDto;
import br.com.gommo.modules.careers.page.dto.CareersThemeDto;
import br.com.gommo.modules.careers.page.entity.CareersBlockTypeEnum;
import br.com.gommo.modules.careers.page.entity.CareersPage;
import br.com.gommo.modules.careers.page.entity.CareersPageBlock;
import br.com.gommo.modules.careers.page.exception.CareersPageException;
import br.com.gommo.modules.careers.page.lib.CareersAssets;
import br.com.gommo.modules.careers.page.lib.CareersDefaultBlocks;
import br.com.gommo.modules.careers.page.lib.CareersPrivacyNotice;
import br.com.gommo.modules.careers.page.mapper.CareersPageMapper;
import br.com.gommo.modules.careers.page.repository.CareersPageBlockRepository;
import br.com.gommo.modules.careers.page.repository.CareersPageRepository;
import br.com.gommo.modules.storage.dto.StorageObjectLinkResponseDto;
import br.com.gommo.modules.storage.dto.StorageObjectResponseDto;
import br.com.gommo.modules.storage.service.IStorageService;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

/**
 * Pagina de carreiras do tenant (RN-32). Singleton por tenant: as colunas/blocos sao o rascunho do
 * editor e {@code published_snapshot} e o que o site publico mostra.
 */
@Service
public class CareersPageService {

    public static final int MAX_BLOCKS = 30;
    private static final int MAX_BLOCK_CONTENT_CHARS = 50_000;
    private static final int MAX_SOCIAL_URL_LENGTH = 300;
    private static final Set<String> SOCIAL_NETWORKS =
            Set.of("website", "linkedin", "instagram", "facebook", "youtube", "tiktok", "x", "glassdoor");

    private final CareersPageRepository pageRepository;
    private final CareersPageBlockRepository blockRepository;
    private final CareersPageMapper mapper;
    private final CareersPlatformGateway platformGateway;
    private final IStorageService storageService;
    private final ObjectMapper objectMapper;

    public CareersPageService(
            CareersPageRepository pageRepository,
            CareersPageBlockRepository blockRepository,
            CareersPageMapper mapper,
            CareersPlatformGateway platformGateway,
            IStorageService storageService,
            ObjectProvider<JsonMapper> jsonMapperProvider) {
        this.pageRepository = pageRepository;
        this.blockRepository = blockRepository;
        this.mapper = mapper;
        this.platformGateway = platformGateway;
        this.storageService = storageService;
        this.objectMapper = jsonMapperProvider.getIfAvailable(() -> JsonMapper.builder().build());
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('careerspage:read')")
    public CareersPageResponseDto getDraft() {
        return findPage().map(this::toResponse).orElseGet(this::defaultResponse);
    }

    @Transactional
    @PreAuthorize("hasAuthority('careerspage:write')")
    public CareersPageResponseDto saveDraft(CareersPageRequestDto request) {
        validateTheme(request.getTheme());
        List<CareersBlockDto> incoming = request.getBlocks() == null ? List.of() : request.getBlocks();
        validateBlocks(incoming);

        CareersPage page = findPage().orElseGet(this::newPage);
        UUID logoObjectId = request.getTheme().getLogoObjectId();
        if (logoObjectId != null) {
            if (page.getId() == null) {
                throw CareersPageException.assetNotFound();
            }
            requireAsset(page.getId(), logoObjectId);
        }
        mapper.applyTheme(page, request.getTheme());
        page.setDraftRevision(page.getId() == null ? 1 : page.getDraftRevision() + 1);
        page = pageRepository.save(page);

        syncBlocks(page.getId(), incoming);
        return toResponse(page);
    }

    @Transactional
    @PreAuthorize("hasAuthority('careerspage:write')")
    public CareersPageResponseDto publish() {
        CareersPage page = findPage().orElseThrow(CareersPageException::notSaved);
        List<CareersBlockDto> blocks = mapper.toBlocks(activeBlocks(page.getId()));
        validateImageConsent(blocks);

        CareersPageSnapshotDto previous = readSnapshot(page).orElse(null);
        boolean everCustom = previous != null && Boolean.TRUE.equals(previous.getCustomNoticeEverPublished());
        String previousNotice = previous == null || previous.getTheme() == null
                ? null
                : previous.getTheme().getPrivacyNotice();
        String notice = page.getPrivacyNotice();
        if (notice != null && everCustom && !notice.equals(previousNotice)) {
            page.setPrivacyNoticeVersion(page.getPrivacyNoticeVersion() + 1);
        }

        OffsetDateTime now = OffsetDateTime.now();
        CareersPageSnapshotDto snapshot = CareersPageSnapshotDto.builder()
                .revision(page.getDraftRevision())
                .privacyNoticeVersion(page.getPrivacyNoticeVersion())
                .customNoticeEverPublished(everCustom || notice != null)
                .publishedAt(now)
                .theme(mapper.toTheme(page))
                .blocks(blocks)
                .build();
        @SuppressWarnings("unchecked")
        Map<String, Object> json = objectMapper.convertValue(snapshot, Map.class);
        page.setPublishedSnapshot(json);
        page.setPublishedRevision(page.getDraftRevision());
        page.setPublishedAt(now);
        page.setPublishedBy(CurrentAuditor.userId().orElse(null));
        return toResponse(pageRepository.save(page));
    }

    /** Descarta o rascunho e volta ao que esta publicado. */
    @Transactional
    @PreAuthorize("hasAuthority('careerspage:write')")
    public CareersPageResponseDto discard() {
        CareersPage page = findPage().orElseThrow(CareersPageException::nothingPublished);
        CareersPageSnapshotDto snapshot = readSnapshot(page).orElseThrow(CareersPageException::nothingPublished);

        mapper.applyTheme(page, snapshot.getTheme() == null ? mapper.defaultTheme() : snapshot.getTheme());
        page.setDraftRevision(page.getPublishedRevision() == null ? page.getDraftRevision() : page.getPublishedRevision());
        page = pageRepository.save(page);
        restoreBlocks(page.getId(), snapshot.getBlocks());
        return toResponse(page);
    }

    /** Tira a pagina personalizada do ar: /careers volta ao layout padrao do Gesint. */
    @Transactional
    @PreAuthorize("hasAuthority('careerspage:write')")
    public CareersPageResponseDto unpublish() {
        CareersPage page = findPage().orElseThrow(CareersPageException::nothingPublished);
        if (page.getPublishedSnapshot() == null) {
            throw CareersPageException.nothingPublished();
        }
        CareersPageSnapshotDto previous = readSnapshot(page).orElse(null);
        page.setPublishedSnapshot(null);
        page.setPublishedRevision(null);
        page.setPublishedAt(null);
        page.setPublishedBy(null);
        if (previous != null && Boolean.TRUE.equals(previous.getCustomNoticeEverPublished())) {
            page.setPrivacyNoticeVersion(page.getPrivacyNoticeVersion() + 1);
        }
        return toResponse(pageRepository.save(page));
    }

    @Transactional
    @PreAuthorize("hasAuthority('careerspage:write')")
    public CareersAssetResponseDto uploadAsset(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw CareersPageException.assetInvalidType();
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!CareersAssets.ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw CareersPageException.assetInvalidType();
        }
        if (file.getSize() > CareersAssets.MAX_BYTES) {
            throw CareersPageException.assetTooLarge();
        }
        CareersPage page = findPage().orElseGet(this::createDefaultPage);
        StorageObjectResponseDto object = storageService.uploadInternal(file);
        storageService.linkToEntityInternal(
                CareersAssets.ENTITY_TYPE,
                page.getId(),
                object.getId(),
                CareersAssets.LINK_ROLE,
                file.getOriginalFilename(),
                CareersAssets.LINK_ROLE);
        return CareersAssetResponseDto.builder()
                .objectId(object.getId())
                .fileName(file.getOriginalFilename())
                .contentType(contentType)
                .build();
    }

    /** Leitura publica (sem login) da versao publicada. */
    @Transactional(readOnly = true)
    public Optional<CareersPageSnapshotDto> findPublished() {
        return findPage().flatMap(this::readSnapshot);
    }

    /** Imagem publica: so objetos anexados a pagina de carreiras do tenant. */
    @Transactional(readOnly = true)
    public CareersPublicAsset openPublicAsset(UUID objectId) {
        CareersPage page = findPage().orElseThrow(CareersPageException::assetNotFound);
        StorageObjectLinkResponseDto link = requireAsset(page.getId(), objectId);
        String contentType = link.getStorageObject() == null ? null : link.getStorageObject().getContentType();
        if (contentType == null || !CareersAssets.ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw CareersPageException.assetNotFound();
        }
        return new CareersPublicAsset(contentType, storageService.downloadInternal(objectId));
    }

    private StorageObjectLinkResponseDto requireAsset(UUID pageId, UUID objectId) {
        return storageService.listByEntityInternal(CareersAssets.ENTITY_TYPE, pageId).stream()
                .filter(link -> CareersAssets.LINK_ROLE.equalsIgnoreCase(link.getLinkRole()))
                .filter(link -> objectId.equals(link.getStorageObjectId()))
                .findFirst()
                .orElseThrow(CareersPageException::assetNotFound);
    }

    private Optional<CareersPage> findPage() {
        return pageRepository.findFirstByStatusNotOrderByCreatedAtAsc(StatusEnum.DELETED);
    }

    private CareersPage newPage() {
        CareersPage page = CareersPage.builder().status(StatusEnum.ACTIVE).build();
        mapper.applyTheme(page, mapper.defaultTheme());
        return page;
    }

    private CareersPage createDefaultPage() {
        CareersPage page = pageRepository.save(newPage());
        syncBlocks(page.getId(), CareersDefaultBlocks.create(platformGateway.organizationName()));
        return page;
    }

    private void syncBlocks(UUID pageId, List<CareersBlockDto> incoming) {
        List<CareersPageBlock> active = activeBlocks(pageId);
        Map<UUID, CareersPageBlock> byId = new HashMap<>();
        Map<CareersBlockTypeEnum, CareersPageBlock> systemByType = new HashMap<>();
        for (CareersPageBlock block : active) {
            byId.put(block.getId(), block);
            if (block.getBlockType().isSystemBlock()) {
                systemByType.putIfAbsent(block.getBlockType(), block);
            }
        }

        Set<UUID> kept = new HashSet<>();
        int order = 0;
        for (CareersBlockDto dto : incoming) {
            CareersPageBlock entity = dto.getId() == null ? null : byId.get(dto.getId());
            if (entity != null && entity.getBlockType() != dto.getType()) {
                entity = null;
            }
            if (entity == null && dto.getType().isSystemBlock()) {
                entity = systemByType.get(dto.getType());
            }
            if (entity == null || kept.contains(entity.getId())) {
                entity = CareersPageBlock.builder()
                        .status(StatusEnum.ACTIVE)
                        .pageId(pageId)
                        .blockType(dto.getType())
                        .systemBlock(dto.getType().isSystemBlock())
                        .build();
            }
            mapper.applyBlock(entity, dto, order++);
            entity = blockRepository.save(entity);
            kept.add(entity.getId());
        }

        for (CareersPageBlock block : active) {
            if (!kept.contains(block.getId())) {
                block.setStatus(StatusEnum.DELETED);
                blockRepository.save(block);
            }
        }
    }

    private void restoreBlocks(UUID pageId, List<CareersBlockDto> published) {
        Map<UUID, CareersPageBlock> all = new HashMap<>();
        for (CareersPageBlock block : blockRepository.findAllByPageId(pageId)) {
            all.put(block.getId(), block);
        }
        Set<UUID> kept = new HashSet<>();
        int order = 0;
        for (CareersBlockDto dto : published == null ? List.<CareersBlockDto>of() : published) {
            CareersPageBlock entity = dto.getId() == null ? null : all.get(dto.getId());
            if (entity == null) {
                entity = CareersPageBlock.builder()
                        .pageId(pageId)
                        .blockType(dto.getType())
                        .systemBlock(dto.getType().isSystemBlock())
                        .build();
            }
            entity.setStatus(StatusEnum.ACTIVE);
            mapper.applyBlock(entity, dto, order++);
            entity = blockRepository.save(entity);
            kept.add(entity.getId());
        }
        for (CareersPageBlock block : all.values()) {
            if (block.getStatus() != StatusEnum.DELETED && !kept.contains(block.getId())) {
                block.setStatus(StatusEnum.DELETED);
                blockRepository.save(block);
            }
        }
    }

    private List<CareersPageBlock> activeBlocks(UUID pageId) {
        return blockRepository.findAllByPageIdAndStatusNotOrderByDisplayOrderAsc(pageId, StatusEnum.DELETED);
    }

    private void validateTheme(CareersThemeDto theme) {
        Map<String, String> links = theme.getSocialLinks();
        if (links == null) {
            theme.setSocialLinks(new LinkedHashMap<>());
            return;
        }
        Map<String, String> clean = new LinkedHashMap<>();
        for (Map.Entry<String, String> entry : links.entrySet()) {
            String value = entry.getValue() == null ? "" : entry.getValue().trim();
            if (value.isEmpty()) {
                continue;
            }
            String key = entry.getKey() == null ? "" : entry.getKey().trim().toLowerCase();
            String lower = value.toLowerCase();
            if (!SOCIAL_NETWORKS.contains(key)
                    || value.length() > MAX_SOCIAL_URL_LENGTH
                    || !(lower.startsWith("https://") || lower.startsWith("http://"))) {
                throw CareersPageException.invalidSocialLink();
            }
            clean.put(key, value);
        }
        theme.setSocialLinks(clean);
    }

    private void validateBlocks(List<CareersBlockDto> blocks) {
        if (blocks.size() > MAX_BLOCKS) {
            throw CareersPageException.tooManyBlocks(MAX_BLOCKS);
        }
        Set<CareersBlockTypeEnum> seen = EnumSet.noneOf(CareersBlockTypeEnum.class);
        for (CareersBlockDto block : blocks) {
            CareersBlockTypeEnum type = Objects.requireNonNull(block.getType());
            if (type.isSystemBlock() && !seen.add(type)) {
                throw CareersPageException.duplicateSystemBlock();
            }
            if (type == CareersBlockTypeEnum.OPEN_VACANCIES && Boolean.FALSE.equals(block.getVisible())) {
                throw CareersPageException.vacanciesBlockHidden();
            }
            if (block.getContent() != null
                    && objectMapper.writeValueAsString(block.getContent()).length() > MAX_BLOCK_CONTENT_CHARS) {
                throw CareersPageException.blockTooLarge();
            }
        }
        for (CareersBlockTypeEnum type : CareersBlockTypeEnum.values()) {
            if (type.isSystemBlock() && !seen.contains(type)) {
                throw CareersPageException.systemBlockRequired();
            }
        }
    }

    /** RN-32: fotos/depoimentos de colaboradores so vao ao ar com autorizacao de uso de imagem. */
    private static void validateImageConsent(List<CareersBlockDto> blocks) {
        for (CareersBlockDto block : blocks) {
            if (block.getType() != CareersBlockTypeEnum.DAY_IN_LIFE || Boolean.FALSE.equals(block.getVisible())) {
                continue;
            }
            Map<String, Object> content = block.getContent() == null ? Map.of() : block.getContent();
            boolean hasPeople = isNonEmptyList(content.get("photos")) || isNonEmptyList(content.get("testimonials"));
            if (hasPeople && !Boolean.TRUE.equals(content.get("imageUseAuthorized"))) {
                throw CareersPageException.imageConsentRequired();
            }
        }
    }

    private static boolean isNonEmptyList(Object value) {
        return value instanceof List<?> list && !list.isEmpty();
    }

    private Optional<CareersPageSnapshotDto> readSnapshot(CareersPage page) {
        if (page.getPublishedSnapshot() == null || page.getPublishedSnapshot().isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(objectMapper.convertValue(page.getPublishedSnapshot(), CareersPageSnapshotDto.class));
    }

    private CareersPageResponseDto toResponse(CareersPage page) {
        String organizationName = platformGateway.organizationName();
        List<CareersBlockDto> blocks = new ArrayList<>(mapper.toBlocks(activeBlocks(page.getId())));
        appendMissingSystemBlocks(blocks, organizationName);
        boolean published = page.getPublishedSnapshot() != null;
        return CareersPageResponseDto.builder()
                .id(page.getId())
                .persisted(true)
                .published(published)
                .hasUnpublishedChanges(!published || !Objects.equals(page.getDraftRevision(), page.getPublishedRevision()))
                .publishedAt(page.getPublishedAt())
                .privacyNoticeVersion(page.getPrivacyNoticeVersion())
                .organizationName(organizationName)
                .defaultPrivacyNotice(CareersPrivacyNotice.defaultText(organizationName))
                .theme(mapper.toTheme(page))
                .blocks(blocks)
                .build();
    }

    private CareersPageResponseDto defaultResponse() {
        String organizationName = platformGateway.organizationName();
        return CareersPageResponseDto.builder()
                .persisted(false)
                .published(false)
                .hasUnpublishedChanges(false)
                .privacyNoticeVersion(1)
                .organizationName(organizationName)
                .defaultPrivacyNotice(CareersPrivacyNotice.defaultText(organizationName))
                .theme(mapper.defaultTheme())
                .blocks(CareersDefaultBlocks.create(organizationName))
                .build();
    }

    /** Blocos padrao criados depois que a pagina foi salva entram ocultos no fim do rascunho. */
    private static void appendMissingSystemBlocks(List<CareersBlockDto> blocks, String organizationName) {
        Set<CareersBlockTypeEnum> present = EnumSet.noneOf(CareersBlockTypeEnum.class);
        blocks.forEach(block -> present.add(block.getType()));
        for (CareersBlockDto block : CareersDefaultBlocks.create(organizationName)) {
            if (!present.contains(block.getType())) {
                block.setVisible(block.getType() == CareersBlockTypeEnum.OPEN_VACANCIES);
                blocks.add(block);
            }
        }
    }
}
