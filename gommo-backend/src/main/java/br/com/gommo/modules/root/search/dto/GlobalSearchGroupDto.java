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
public class GlobalSearchGroupDto {

    private String type;
    private String label;
    @Builder.Default
    private List<GlobalSearchItemDto> items = new ArrayList<>();
}
