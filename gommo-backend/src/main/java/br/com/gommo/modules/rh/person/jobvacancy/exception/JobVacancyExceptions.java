package br.com.gommo.modules.rh.person.jobvacancy.exception;

public final class JobVacancyExceptions {
    private JobVacancyExceptions() {}

    public static final String NOT_FOUND_CODE = "JOB_VACANCY_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Vaga n\u00e3o encontrada";

    public static final String TITLE_REQUIRED_CODE = "JOB_VACANCY_TITLE_REQUIRED";
    public static final String TITLE_REQUIRED_MSG = "Informe o nome do cargo da vaga";

    public static final String POSITIONS_INVALID_CODE = "JOB_VACANCY_POSITIONS_INVALID";
    public static final String POSITIONS_INVALID_MSG = "A quantidade de posi\u00e7\u00f5es deve ser maior que zero";

    public static final String JOB_POSITION_NOT_FOUND_CODE = "JOB_VACANCY_JOB_POSITION_NOT_FOUND";
    public static final String JOB_POSITION_NOT_FOUND_MSG = "Cargo informado n\u00e3o encontrado";
}
