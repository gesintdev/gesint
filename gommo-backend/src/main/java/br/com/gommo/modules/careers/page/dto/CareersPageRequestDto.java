package br.com.gommo.modules.careers.page.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareersPageRequestDto {
    @Valid
    @NotNull
    private CareersThemeDto theme;

    @Valid
    @NotNull
    @Builder.Default
    private List<CareersBlockDto> blocks = new ArrayList<>();
}
