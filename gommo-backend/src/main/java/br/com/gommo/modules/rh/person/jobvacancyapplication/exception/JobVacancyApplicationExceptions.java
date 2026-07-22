package br.com.gommo.modules.rh.person.jobvacancyapplication.exception;

public final class JobVacancyApplicationExceptions {
    private JobVacancyApplicationExceptions() {}

    public static final String NOT_FOUND_CODE = "JOB_VACANCY_APPLICATION_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Candidatura n\u00e3o encontrada";

    public static final String VACANCY_REQUIRED_CODE = "JOB_VACANCY_APPLICATION_VACANCY_REQUIRED";
    public static final String VACANCY_REQUIRED_MSG = "Informe a vaga da candidatura";

    public static final String CANDIDATE_REQUIRED_CODE = "JOB_VACANCY_APPLICATION_CANDIDATE_REQUIRED";
    public static final String CANDIDATE_REQUIRED_MSG = "Informe o candidato da candidatura";

    public static final String VACANCY_NOT_FOUND_CODE = "JOB_VACANCY_APPLICATION_VACANCY_NOT_FOUND";
    public static final String VACANCY_NOT_FOUND_MSG = "Vaga informada n\u00e3o encontrada";

    public static final String CANDIDATE_NOT_FOUND_CODE = "JOB_VACANCY_APPLICATION_CANDIDATE_NOT_FOUND";
    public static final String CANDIDATE_NOT_FOUND_MSG = "Candidato informado n\u00e3o encontrado";

    public static final String DUPLICATE_CODE = "JOB_VACANCY_APPLICATION_DUPLICATE";
    public static final String DUPLICATE_MSG = "Este candidato j\u00e1 est\u00e1 vinculado a esta vaga";

    public static final String KANBAN_COLUMN_REQUIRED_CODE = "JOB_VACANCY_APPLICATION_KANBAN_COLUMN_REQUIRED";
    public static final String KANBAN_COLUMN_REQUIRED_MSG =
            "Nenhuma coluna de kanban configurada para o processo de admissao";

    public static final String NO_CANDIDATES_CODE = "JOB_VACANCY_APPLICATION_NO_CANDIDATES";
    public static final String NO_CANDIDATES_MSG = "Esta vaga nao possui candidatos para iniciar o processo";

    public static final String STAGE_COMMENT_COLUMN_REQUIRED_CODE =
            "JOB_VACANCY_APPLICATION_STAGE_COMMENT_COLUMN_REQUIRED";
    public static final String STAGE_COMMENT_COLUMN_REQUIRED_MSG =
            "Informe a coluna do kanban do comentario";

    public static final String STAGE_COMMENT_COLUMN_NOT_FOUND_CODE =
            "JOB_VACANCY_APPLICATION_STAGE_COMMENT_COLUMN_NOT_FOUND";
    public static final String STAGE_COMMENT_COLUMN_NOT_FOUND_MSG =
            "Coluna de kanban informada nao encontrada";
}
