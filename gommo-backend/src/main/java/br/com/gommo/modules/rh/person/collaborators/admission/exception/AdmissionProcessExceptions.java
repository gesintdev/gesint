package br.com.gommo.modules.rh.person.collaborators.admission.exception;

public final class AdmissionProcessExceptions {
    private AdmissionProcessExceptions() {}

    public static final String NOT_FOUND_CODE = "ADMISSION_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Processo de admissão não encontrado";
    public static final String CPF_ALREADY_EXISTS_CODE = "ADMISSION_CPF_ALREADY_EXISTS";
    public static final String CPF_ALREADY_EXISTS_MSG = "Já existe admissão ou colaborador com este CPF";
    public static final String PJ_PROVIDER_REQUIRED_CODE = "ADMISSION_PJ_PROVIDER_REQUIRED";
    public static final String PJ_PROVIDER_REQUIRED_MSG = "Para contrato PJ informe CNPJ e razão social da prestadora";
    public static final String PJ_RECESS_INVALID_CODE = "ADMISSION_PJ_RECESS_INVALID";
    public static final String PJ_RECESS_INVALID_MSG = "Preencha corretamente a politica de recesso contratual PJ";
    public static final String ADMISSIONAL_EXAM_REQUIRED_CODE = "ADMISSION_ADMISSIONAL_EXAM_REQUIRED";
    public static final String ADMISSIONAL_EXAM_REQUIRED_MSG =
            "Conclusao da admissao bloqueada: e necessario exame admissional (ASO) com resultado APTA (FIT).";
}
