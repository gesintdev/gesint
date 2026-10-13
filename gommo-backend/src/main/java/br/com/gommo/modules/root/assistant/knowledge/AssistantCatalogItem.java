package br.com.gommo.modules.root.assistant.knowledge;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssistantCatalogItem {

    private String id;
    private String system;
    private String menu;
    private String topic;
    private String action;
    private String href;
    private String routeId;
    private String permission;
    private AssistantCatalogComplexity complexity;

    @Builder.Default
    private List<String> keywords = new ArrayList<>();

    @Builder.Default
    private List<String> steps = new ArrayList<>();
}
