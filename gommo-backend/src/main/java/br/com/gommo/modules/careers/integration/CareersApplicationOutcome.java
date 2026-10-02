package br.com.gommo.modules.careers.integration;

public enum CareersApplicationOutcome {
    CREATED,
    /** Mesmo e-mail ja candidatado a vaga: nada muda e o candidato recebe a mesma resposta neutra. */
    ALREADY_APPLIED
}
