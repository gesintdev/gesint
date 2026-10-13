package br.com.gommo.modules.root.assistant.skill;

import br.com.gommo.core.llm.LlmTool;

public interface AssistantSkill {

    String name();

    LlmTool toolDefinition();

    AssistantSkillResult execute(String argumentsJson);
}
