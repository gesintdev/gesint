package br.com.gommo.modules.root.search.dto;

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
public class GlobalSearchResponseDto {

    private String query;
    @Builder.Default
    private List<GlobalSearchGroupDto> groups = new ArrayList<>();
}
