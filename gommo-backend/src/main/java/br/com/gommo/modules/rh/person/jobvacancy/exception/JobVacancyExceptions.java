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

    public static final String SLUG_DUPLICATE_CODE = "JOB_VACANCY_SLUG_DUPLICATE";
    public static final String SLUG_DUPLICATE_MSG = "J\u00e1 existe uma vaga com este link p\u00fablico";

    public static final String SLUG_INVALID_CODE = "JOB_VACANCY_SLUG_INVALID";
    public static final String SLUG_INVALID_MSG = "Informe um slug v\u00e1lido para a p\u00e1gina p\u00fablica";

    public static final String PUBLIC_NOT_FOUND_CODE = "JOB_VACANCY_PUBLIC_NOT_FOUND";
    public static final String PUBLIC_NOT_FOUND_MSG = "Vaga n\u00e3o encontrada ou n\u00e3o est\u00e1 publicada";
}
