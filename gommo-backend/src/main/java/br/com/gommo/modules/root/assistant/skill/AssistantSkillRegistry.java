package br.com.gommo.modules.root.assistant.skill;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import br.com.gommo.core.llm.LlmTool;

@Component
public class AssistantSkillRegistry {

    private final Map<String, AssistantSkill> byName = new LinkedHashMap<>();

    public AssistantSkillRegistry(List<AssistantSkill> skills) {
        if (skills != null) {
            for (AssistantSkill skill : skills) {
                if (skill != null) {
                    byName.put(skill.name(), skill);
                }
            }
        }
    }

    public List<LlmTool> toolDefinitions() {
        List<LlmTool> tools = new ArrayList<>();
        for (AssistantSkill skill : byName.values()) {
            tools.add(skill.toolDefinition());
        }
        return tools;
    }

    public AssistantSkill get(String name) {
        return name == null ? null : byName.get(name);
    }
}
