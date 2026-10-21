package br.com.gesint.modules.rh.person.jobvacancyapplication.exception;

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
            "Para mover para Encerrados, informe o motivo do encerramento";

    public static final String REJECTION_REQUIREMENT_REQUIRED_CODE =
            "JOB_VACANCY_APPLICATION_REJECTION_REQUIREMENT_REQUIRED";
    public static final String REJECTION_REQUIREMENT_REQUIRED_MSG =
            "Informe qual requisito da vaga n\u00e3o foi atendido";

    public static final String ALREADY_REJECTED_CODE = "JOB_VACANCY_APPLICATION_ALREADY_REJECTED";
    public static final String ALREADY_REJECTED_MSG = "Esta candidatura j\u00e1 est\u00e1 reprovada";

    public static final String REJECTED_COLUMN_MISSING_CODE = "JOB_VACANCY_APPLICATION_REJECTED_COLUMN_MISSING";
    public static final String REJECTED_COLUMN_MISSING_MSG =
            "A coluna Encerrados n\u00e3o est\u00e1 configurada neste ambiente";

    public static final String REJECTION_REQUIREMENT_INVALID_CODE = "JOB_VACANCY_APPLICATION_REJECTION_REQUIREMENT_INVALID";
    public static final String REJECTION_REQUIREMENT_INVALID_MSG =
            "O requisito informado n\u00e3o consta nos requisitos ou compet\u00eancias da vaga";

    public static final String ASSESSMENT_BELOW_MINIMUM_NOT_APPLICABLE_CODE =
            "JOB_VACANCY_APPLICATION_ASSESSMENT_BELOW_MINIMUM_NOT_APPLICABLE";
    public static final String ASSESSMENT_BELOW_MINIMUM_NOT_APPLICABLE_MSG =
            "Este motivo s\u00f3 se aplica quando a compatibilidade da IA est\u00e1 abaixo de 80%";

    public static final String INTERVIEW_COLUMN_REQUIRED_CODE =
            "JOB_VACANCY_APPLICATION_INTERVIEW_COLUMN_REQUIRED";
    public static final String INTERVIEW_COLUMN_REQUIRED_MSG =
            "Informe a coluna do kanban da avalia\u00e7\u00e3o";

    public static final String INTERVIEW_COLUMN_NOT_ENABLED_CODE =
            "JOB_VACANCY_APPLICATION_INTERVIEW_COLUMN_NOT_ENABLED";
    public static final String INTERVIEW_COLUMN_NOT_ENABLED_MSG =
            "Esta coluna n\u00e3o est\u00e1 marcada como entrevista";

    public static final String INTERVIEW_COMPETENCIES_MISSING_CODE =
            "JOB_VACANCY_APPLICATION_INTERVIEW_COMPETENCIES_MISSING";
    public static final String INTERVIEW_COMPETENCIES_MISSING_MSG =
            "Configure as compet\u00eancias do cargo ou da vaga para usar o scorecard";

    public static final String INTERVIEW_SCORE_INCOMPLETE_CODE =
            "JOB_VACANCY_APPLICATION_INTERVIEW_SCORE_INCOMPLETE";
    public static final String INTERVIEW_SCORE_INCOMPLETE_MSG =
            "Informe nota para todas as compet\u00eancias antes de enviar";

    public static final String INTERVIEW_SCORE_INVALID_CODE =
            "JOB_VACANCY_APPLICATION_INTERVIEW_SCORE_INVALID";
    public static final String INTERVIEW_SCORE_INVALID_MSG =
            "A nota deve corresponder a um n\u00edvel de profici\u00eancia v\u00e1lido";

    public static final String INTERVIEW_JUSTIFICATION_REQUIRED_CODE =
            "JOB_VACANCY_APPLICATION_INTERVIEW_JUSTIFICATION_REQUIRED";
    public static final String INTERVIEW_JUSTIFICATION_REQUIRED_MSG =
            "Cada nota exige uma justificativa";

    public static final String INTERVIEW_COMPETENCY_NOT_IN_SCORECARD_CODE =
            "JOB_VACANCY_APPLICATION_INTERVIEW_COMPETENCY_NOT_IN_SCORECARD";
    public static final String INTERVIEW_COMPETENCY_NOT_IN_SCORECARD_MSG =
            "Compet\u00eancia n\u00e3o faz parte do scorecard desta vaga";

    public static final String INTERVIEW_ALREADY_SUBMITTED_CODE =
            "JOB_VACANCY_APPLICATION_INTERVIEW_ALREADY_SUBMITTED";
    public static final String INTERVIEW_ALREADY_SUBMITTED_MSG =
            "Sua avalia\u00e7\u00e3o j\u00e1 foi enviada e n\u00e3o pode ser alterada";

    public static final String INTERVIEW_EVALUATOR_REQUIRED_CODE =
            "JOB_VACANCY_APPLICATION_INTERVIEW_EVALUATOR_REQUIRED";
    public static final String INTERVIEW_EVALUATOR_REQUIRED_MSG =
            "N\u00e3o foi poss\u00edvel identificar o avaliador autenticado";

    public static final String INTERVIEW_RECOMMENDATION_REQUIRED_CODE =
            "JOB_VACANCY_APPLICATION_INTERVIEW_RECOMMENDATION_REQUIRED";
    public static final String INTERVIEW_RECOMMENDATION_REQUIRED_MSG =
            "Informe a recomenda\u00e7\u00e3o antes de enviar a avalia\u00e7\u00e3o";

    public static final String HIRE_COLUMN_REQUIRED_CODE = "JOB_VACANCY_APPLICATION_HIRE_COLUMN_REQUIRED";
    public static final String HIRE_COLUMN_REQUIRED_MSG =
            "A coluna informada n\u00e3o est\u00e1 configurada para proposta de contrata\u00e7\u00e3o";

    public static final String HIRE_ACCEPTANCE_REQUIRED_CODE =
            "JOB_VACANCY_APPLICATION_HIRE_ACCEPTANCE_REQUIRED";
    public static final String HIRE_ACCEPTANCE_REQUIRED_MSG =
            "Confirme o aceite do candidato antes de contratar";

    public static final String HIRE_CPF_REQUIRED_CODE = "JOB_VACANCY_APPLICATION_HIRE_CPF_REQUIRED";
    public static final String HIRE_CPF_REQUIRED_MSG =
            "Informe o CPF do candidato para criar a admiss\u00e3o";

    public static final String HIRE_ALREADY_DONE_CODE = "JOB_VACANCY_APPLICATION_HIRE_ALREADY_DONE";
    public static final String HIRE_ALREADY_DONE_MSG = "Esta candidatura j\u00e1 foi convertida em admiss\u00e3o";

    public static final String HIRE_CANDIDATE_REQUIRED_CODE =
            "JOB_VACANCY_APPLICATION_HIRE_CANDIDATE_REQUIRED";
    public static final String HIRE_CANDIDATE_REQUIRED_MSG =
            "Candidato da candidatura n\u00e3o encontrado";

    public static final String OFFER_ALREADY_SENT_CODE = "JOB_VACANCY_APPLICATION_OFFER_ALREADY_SENT";
    public static final String OFFER_ALREADY_SENT_MSG =
            "J\u00e1 existe uma proposta pendente de aceite no portal para esta candidatura";

    public static final String OFFER_NOT_PENDING_CODE = "JOB_VACANCY_APPLICATION_OFFER_NOT_PENDING";
    public static final String OFFER_NOT_PENDING_MSG =
            "N\u00e3o h\u00e1 proposta pendente de aceite no portal para esta candidatura";

    public static final String PORTAL_ACCEPTANCE_REQUIRED_CODE =
            "JOB_VACANCY_APPLICATION_PORTAL_ACCEPTANCE_REQUIRED";
    public static final String PORTAL_ACCEPTANCE_REQUIRED_MSG =
            "Aguarde o aceite do candidato no portal antes de confirmar a contrata\u00e7\u00e3o com canal PORTAL";
}
