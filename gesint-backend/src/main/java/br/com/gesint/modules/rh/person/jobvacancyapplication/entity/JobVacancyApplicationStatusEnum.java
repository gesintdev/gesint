package br.com.gesint.modules.rh.person.jobvacancyapplication.entity;

public enum JobVacancyApplicationStatusEnum {
    APPLIED,
    SCREENING,
    INTERVIEW,
    OFFER,
    HIRED,
    REJECTED,
    /** Candidato retirou a candidatura pelo portal (RN-33 / D8). */
    WITHDRAWN
}
