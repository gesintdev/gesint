package br.com.gesint.modules.root.assistant.skill;

import br.com.gesint.core.llm.LlmTool;

public interface AssistantSkill {

    String name();

    LlmTool toolDefinition();

    AssistantSkillResult execute(String argumentsJson);
}
