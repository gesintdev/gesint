package br.com.gesint.modules.careers.candidateportal.lib;

import java.util.ArrayList;
import java.util.List;

import br.com.gesint.modules.careers.candidateportal.dto.CandidatePortalTimelineStepDto;
import br.com.gesint.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplication;
import br.com.gesint.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplicationStatusEnum;

/**
 * Timeline segura para o candidato (Recebida / Triagem / Entrevista / Resultado).
 * Nao expoe colunas internas do kanban, notas de IA nem motivos internos de reprovacao.
 */
public final class CandidatePortalTimeline {

    private CandidatePortalTimeline() {}

    public static List<CandidatePortalTimelineStepDto> build(JobVacancyApplication application) {
        Stage current = resolveStage(application);
        List<CandidatePortalTimelineStepDto> steps = new ArrayList<>(4);
        for (Stage stage : Stage.values()) {
            String state;
            if (stage.ordinal() < current.ordinal()) {
                state = "done";
            } else if (stage == current) {
                state = "current";
            } else {
                state = "pending";
            }
            steps.add(CandidatePortalTimelineStepDto.builder()
                    .key(stage.key)
                    .label(stage.label)
                    .state(state)
                    .build());
        }
        return steps;
    }

    public static String stageKey(JobVacancyApplication application) {
        return resolveStage(application).key;
    }

    public static String stageLabel(JobVacancyApplication application) {
        return resolveStage(application).label;
    }

    public static String resultLabel(JobVacancyApplication application) {
        JobVacancyApplicationStatusEnum status = application.getApplicationStatus();
        if (status == null) {
            return null;
        }
        return switch (status) {
            case HIRED -> "Contratado(a)";
            case OFFER -> "Proposta enviada";
            case REJECTED -> "Nao seguiu no processo";
            case WITHDRAWN -> "Candidatura retirada";
            default -> null;
        };
    }

    public static boolean withdrawable(JobVacancyApplication application) {
        JobVacancyApplicationStatusEnum status = application.getApplicationStatus();
        if (status == null) {
            return false;
        }
        return switch (status) {
            case APPLIED, SCREENING, INTERVIEW -> !application.isRejected();
            default -> false;
        };
    }

    private static Stage resolveStage(JobVacancyApplication application) {
        if (application.isRejected()
                || application.getApplicationStatus() == JobVacancyApplicationStatusEnum.REJECTED
                || application.getApplicationStatus() == JobVacancyApplicationStatusEnum.HIRED
                || application.getApplicationStatus() == JobVacancyApplicationStatusEnum.OFFER
                || application.getApplicationStatus() == JobVacancyApplicationStatusEnum.WITHDRAWN) {
            return Stage.RESULT;
        }
        JobVacancyApplicationStatusEnum status = application.getApplicationStatus();
        if (status == JobVacancyApplicationStatusEnum.INTERVIEW) {
            return Stage.INTERVIEW;
        }
        if (status == JobVacancyApplicationStatusEnum.SCREENING) {
            return Stage.SCREENING;
        }
        return Stage.RECEIVED;
    }

    private enum Stage {
        RECEIVED("received", "Recebida"),
        SCREENING("screening", "Triagem"),
        INTERVIEW("interview", "Entrevista"),
        RESULT("result", "Resultado");

        private final String key;
        private final String label;

        Stage(String key, String label) {
            this.key = key;
            this.label = label;
        }
    }
}
