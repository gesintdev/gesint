package br.com.gommo.modules.rh.person.experience.exception;

public final class ExperienceExceptions {
    private ExperienceExceptions() {}

    public static final String NOT_FOUND_CODE = "EXPERIENCE_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Avaliação de experiência não encontrada.";

    public static final String NOT_EDITABLE_CODE = "EXPERIENCE_NOT_EDITABLE";
    public static final String NOT_EDITABLE_MSG =
            "Avaliações já decididas ou efetivadas não podem ser editadas.";

    public static final String ALREADY_SUBMITTED_CODE = "EXPERIENCE_ALREADY_SUBMITTED";
    public static final String ALREADY_SUBMITTED_MSG = "A avaliação de experiência já foi enviada.";

    public static final String SCORE_INVALID_CODE = "EXPERIENCE_SCORE_INVALID";
    public static final String SCORE_INVALID_MSG = "A nota deve ser um nível de 1 a 4.";

    public static final String JUSTIFICATION_REQUIRED_CODE = "EXPERIENCE_JUSTIFICATION_REQUIRED";
    public static final String JUSTIFICATION_REQUIRED_MSG =
            "Cada competência precisa de evidência escrita ao enviar a avaliação.";

    public static final String COMPETENCY_REQUIRED_CODE = "EXPERIENCE_COMPETENCY_REQUIRED";
    public static final String COMPETENCY_REQUIRED_MSG =
            "Informe nota para todas as competências do cargo usadas na experiência.";

    public static final String COMPETENCY_NOT_IN_SCORECARD_CODE = "EXPERIENCE_COMPETENCY_NOT_IN_SCORECARD";
    public static final String COMPETENCY_NOT_IN_SCORECARD_MSG =
            "Competência informada não faz parte do scorecard de experiência do cargo.";

    public static final String EXTENSION_USED_CODE = "EXPERIENCE_EXTENSION_USED";
    public static final String EXTENSION_USED_MSG =
            "A prorrogação do período de experiência só pode ocorrer uma vez.";

    public static final String EXTENSION_NOT_ALLOWED_CODE = "EXPERIENCE_EXTENSION_NOT_ALLOWED";
    public static final String EXTENSION_NOT_ALLOWED_MSG =
            "Este tipo de período de experiência não admite prorrogação.";

    public static final String DECISION_REASON_REQUIRED_CODE = "EXPERIENCE_DECISION_REASON_REQUIRED";
    public static final String DECISION_REASON_REQUIRED_MSG = "Informe o motivo padronizado da decisão.";

    public static final String INVALID_DECISION_CODE = "EXPERIENCE_INVALID_DECISION";
    public static final String INVALID_DECISION_MSG = "Decisão inválida para o status atual do período.";

    public static final String COLLABORATOR_REQUIRED_CODE = "EXPERIENCE_COLLABORATOR_REQUIRED";
    public static final String COLLABORATOR_REQUIRED_MSG =
            "A admissão precisa de colaborador para entrar no período de experiência.";
}
