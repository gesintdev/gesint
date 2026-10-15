package br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.entity;

public enum InterviewRecommendationEnum {
    ADVANCE("Seguir no processo"),
    HOLD("Manter em observação"),
    REJECT("Não recomendar");

    private final String label;

    InterviewRecommendationEnum(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
