package br.com.gommo.modules.rh.person.candidate.exception;

public final class CandidateExceptions {
    private CandidateExceptions() {}

    public static final String NOT_FOUND_CODE = "CANDIDATE_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Candidato n\u00e3o encontrado";

    public static final String NAME_REQUIRED_CODE = "CANDIDATE_NAME_REQUIRED";
    public static final String NAME_REQUIRED_MSG = "Informe o nome do candidato";

    public static final String CPF_REQUIRED_CODE = "CANDIDATE_CPF_REQUIRED";
    public static final String CPF_REQUIRED_MSG = "Informe o CPF do candidato";

    public static final String CPF_DUPLICATE_CODE = "CANDIDATE_CPF_DUPLICATE";
    public static final String CPF_DUPLICATE_MSG = "J\u00e1 existe um candidato com este CPF";
}
