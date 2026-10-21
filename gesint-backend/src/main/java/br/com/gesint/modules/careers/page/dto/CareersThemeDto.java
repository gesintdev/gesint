package br.com.gesint.modules.careers.page.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import br.com.gesint.modules.careers.page.entity.CareersCornerStyleEnum;
import br.com.gesint.modules.careers.page.entity.CareersFontStyleEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareersThemeDto {
    private static final String HEX_COLOR = "^$|^#[0-9A-Fa-f]{6}$";

    @Size(max = 200)
    private String displayName;

    private UUID logoObjectId;

    @Pattern(regexp = HEX_COLOR)
    private String primaryColor;

    @Pattern(regexp = HEX_COLOR)
    private String accentColor;

    private CareersFontStyleEnum fontStyle;

    private CareersCornerStyleEnum cornerStyle;

    @Builder.Default
    private Boolean showSalary = true;

    @Size(max = 70)
    private String seoTitle;

    @Size(max = 160)
    private String seoDescription;

    @Builder.Default
    private Map<String, String> socialLinks = new LinkedHashMap<>();

    @Size(max = 20000)
    private String privacyNotice;

    @Min(1)
    @Max(24)
    @Builder.Default
    private Integer talentPoolMonths = 12;
}
