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

    public static final String REJECTION_REASON_REQUIRED_CODE = "JOB_VACANCY_APPLICATION_REJECTION_REASON_REQUIRED";
    public static final String REJECTION_REASON_REQUIRED_MSG =
            "Para mover para Reprovados, informe o motivo da reprova\u00e7\u00e3o";

    public static final String REJECTION_REQUIREMENT_REQUIRED_CODE =
            "JOB_VACANCY_APPLICATION_REJECTION_REQUIREMENT_REQUIRED";
    public static final String REJECTION_REQUIREMENT_REQUIRED_MSG =
            "Informe qual requisito da vaga n\u00e3o foi atendido";

    public static final String ALREADY_REJECTED_CODE = "JOB_VACANCY_APPLICATION_ALREADY_REJECTED";
    public static final String ALREADY_REJECTED_MSG = "Esta candidatura j\u00e1 est\u00e1 reprovada";

    public static final String REJECTED_COLUMN_MISSING_CODE = "JOB_VACANCY_APPLICATION_REJECTED_COLUMN_MISSING";
    public static final String REJECTED_COLUMN_MISSING_MSG =
            "A coluna Reprovados n\u00e3o est\u00e1 configurada neste ambiente";
}
