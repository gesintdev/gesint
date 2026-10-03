package br.com.gommo.modules.rh.person.jobvacancycompetency.exception;

public final class JobVacancyCompetencyExceptions {
    private JobVacancyCompetencyExceptions() {}

    public static final String NOT_FOUND_CODE = "JOB_VACANCY_COMPETENCY_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Compet\u00eancia da vaga n\u00e3o encontrada";

    public static final String COMPETENCY_NOT_FOUND_CODE = "JOB_VACANCY_COMPETENCY_COMPETENCY_NOT_FOUND";
    public static final String COMPETENCY_NOT_FOUND_MSG = "Compet\u00eancia informada n\u00e3o encontrada";

    public static final String VACANCY_NOT_FOUND_CODE = "JOB_VACANCY_COMPETENCY_VACANCY_NOT_FOUND";
    public static final String VACANCY_NOT_FOUND_MSG = "Vaga informada n\u00e3o encontrada";

    public static final String DUPLICATE_CODE = "JOB_VACANCY_COMPETENCY_DUPLICATE";
    public static final String DUPLICATE_MSG = "Esta compet\u00eancia j\u00e1 est\u00e1 vinculada \u00e0 vaga";
}
