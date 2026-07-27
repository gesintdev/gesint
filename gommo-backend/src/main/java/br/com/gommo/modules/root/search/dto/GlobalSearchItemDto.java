package br.com.gommo.modules.root.search.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSearchItemDto {

    private UUID id;
    private String title;
    private String subtitle;
    /** Caminho da rota de lista (ex.: /collaborator/people). */
    private String href;
}
