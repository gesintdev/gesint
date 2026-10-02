package br.com.gommo.modules.careers.page.mapper;

import java.util.LinkedHashMap;
import java.util.List;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.careers.page.dto.CareersBlockDto;
import br.com.gommo.modules.careers.page.dto.CareersThemeDto;
import br.com.gommo.modules.careers.page.entity.CareersCornerStyleEnum;
import br.com.gommo.modules.careers.page.entity.CareersFontStyleEnum;
import br.com.gommo.modules.careers.page.entity.CareersPage;
import br.com.gommo.modules.careers.page.entity.CareersPageBlock;

@Component
public class CareersPageMapper {

    public CareersThemeDto toTheme(CareersPage page) {
        return CareersThemeDto.builder()
                .displayName(page.getDisplayName())
                .logoObjectId(page.getLogoObjectId())
                .primaryColor(page.getPrimaryColor())
                .accentColor(page.getAccentColor())
                .fontStyle(page.getFontStyle())
                .cornerStyle(page.getCornerStyle())
                .showSalary(page.getShowSalary())
                .seoTitle(page.getSeoTitle())
                .seoDescription(page.getSeoDescription())
                .socialLinks(page.getSocialLinks() == null ? new LinkedHashMap<>() : new LinkedHashMap<>(page.getSocialLinks()))
                .privacyNotice(page.getPrivacyNotice())
                .talentPoolMonths(page.getTalentPoolMonths())
                .build();
    }

    public CareersThemeDto defaultTheme() {
        return CareersThemeDto.builder()
                .fontStyle(CareersFontStyleEnum.MODERN)
                .cornerStyle(CareersCornerStyleEnum.ROUNDED)
                .showSalary(true)
                .socialLinks(new LinkedHashMap<>())
                .talentPoolMonths(12)
                .build();
    }

    public void applyTheme(CareersPage page, CareersThemeDto theme) {
        page.setDisplayName(trimToNull(theme.getDisplayName()));
        page.setLogoObjectId(theme.getLogoObjectId());
        page.setPrimaryColor(normalizeColor(theme.getPrimaryColor()));
        page.setAccentColor(normalizeColor(theme.getAccentColor()));
        page.setFontStyle(theme.getFontStyle() == null ? CareersFontStyleEnum.MODERN : theme.getFontStyle());
        page.setCornerStyle(theme.getCornerStyle() == null ? CareersCornerStyleEnum.ROUNDED : theme.getCornerStyle());
        page.setShowSalary(!Boolean.FALSE.equals(theme.getShowSalary()));
        page.setSeoTitle(trimToNull(theme.getSeoTitle()));
        page.setSeoDescription(trimToNull(theme.getSeoDescription()));
        page.setSocialLinks(theme.getSocialLinks() == null ? new LinkedHashMap<>() : new LinkedHashMap<>(theme.getSocialLinks()));
        page.setPrivacyNotice(trimToNull(theme.getPrivacyNotice()));
        page.setTalentPoolMonths(theme.getTalentPoolMonths() == null ? 12 : theme.getTalentPoolMonths());
    }

    public CareersBlockDto toBlock(CareersPageBlock block) {
        return CareersBlockDto.builder()
                .id(block.getId())
                .type(block.getBlockType())
                .title(block.getTitle())
                .subtitle(block.getSubtitle())
                .content(block.getContent() == null ? new LinkedHashMap<>() : new LinkedHashMap<>(block.getContent()))
                .visible(block.getVisible())
                .systemBlock(block.getSystemBlock())
                .build();
    }

    public List<CareersBlockDto> toBlocks(List<CareersPageBlock> blocks) {
        return blocks.stream().map(this::toBlock).toList();
    }

    public void applyBlock(CareersPageBlock entity, CareersBlockDto dto, int displayOrder) {
        entity.setTitle(trimToNull(dto.getTitle()));
        entity.setSubtitle(trimToNull(dto.getSubtitle()));
        entity.setContent(dto.getContent() == null ? new LinkedHashMap<>() : new LinkedHashMap<>(dto.getContent()));
        entity.setVisible(!Boolean.FALSE.equals(dto.getVisible()));
        entity.setDisplayOrder(displayOrder);
    }

    private static String normalizeColor(String value) {
        String trimmed = trimToNull(value);
        return trimmed == null ? null : trimmed.toUpperCase();
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
