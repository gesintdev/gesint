package br.com.gommo.modules.person.collaborators.admission.exception;
public final class AdmissionProcessExceptions {
    private AdmissionProcessExceptions() {}
    public static final String NOT_FOUND_CODE = "ADMISSION_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Processo de admissão não encontrado";
    public static final String CPF_ALREADY_EXISTS_CODE = "ADMISSION_CPF_ALREADY_EXISTS";
    public static final String CPF_ALREADY_EXISTS_MSG = "Já existe admissão ou colaborador com este CPF";
}
