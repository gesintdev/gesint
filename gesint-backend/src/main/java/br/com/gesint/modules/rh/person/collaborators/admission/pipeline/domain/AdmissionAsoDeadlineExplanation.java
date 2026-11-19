package br.com.gesint.modules.rh.person.collaborators.admission.pipeline.domain;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.EnumSet;
import java.util.Set;

import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamLifecycleStatusEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamResultEnum;

/**
 * Explica, em linguagem de negocio, por que a esteira marca ASO em atraso.
 *
 * <p>O prazo cobrado e a vespera do inicio previsto ({@link AdmissionPipelineRules#examDueDate}).
 * Datas do cadastro do exame (agendada, clinico, emissao, vencimento) nao movem esse prazo.
 * A etapa so deixa de estar em atraso quando o ASO esta apto e o ciclo esta encerrado.
 */
public final class AdmissionAsoDeadlineExplanation {

    private static final DateTimeFormatter DATE_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final Set<OccupationalExamLifecycleStatusEnum> CLOSED_LIFECYCLE = EnumSet.of(
            OccupationalExamLifecycleStatusEnum.REGISTRADO,
            OccupationalExamLifecycleStatusEnum.TRANSMITIDO,
            OccupationalExamLifecycleStatusEnum.ARQUIVADO);

    private AdmissionAsoDeadlineExplanation() {}

    public record Snapshot(
            String displayName,
            LocalDate expectedStartDate,
            LocalDate today,
            boolean manuallyApproved,
            boolean examStepSkipped,
            boolean hasAdmissionalExam,
            LocalDate scheduledDate,
            LocalDate clinicalExamDate,
            LocalDate asoIssueDate,
            LocalDate validityDate,
            OccupationalExamResultEnum result,
            OccupationalExamLifecycleStatusEnum lifecycleStatus) {}

    public static boolean closesAdmissionStep(
            OccupationalExamResultEnum result, OccupationalExamLifecycleStatusEnum lifecycleStatus) {
        return result == OccupationalExamResultEnum.FIT && CLOSED_LIFECYCLE.contains(lifecycleStatus);
    }

    public static String explain(Snapshot snapshot) {
        String name = display(snapshot.displayName());
        if (snapshot.manuallyApproved()) {
            return name
                    + " foi aprovada manualmente na esteira. O status deixa de ser prazo vencido, mesmo que ainda exista etapa pendente.";
        }
        if (snapshot.examStepSkipped()) {
            return "A etapa de ASO foi dispensada na esteira. Ela não entra como ASO em atraso. "
                    + "Se ainda aparece prazo vencido, a pendência é outra etapa, como registro em carteira ou integração.";
        }
        if (snapshot.expectedStartDate() == null) {
            return name
                    + " não tem início previsto. Sem essa data a esteira não cobra prazo de ASO. "
                    + "Datas preenchidas no exame não criam nem removem esse prazo.";
        }

        LocalDate legalDue = AdmissionPipelineRules.examDueDate(snapshot.expectedStartDate());
        boolean closed = closesAdmissionStep(snapshot.result(), snapshot.lifecycleStatus());
        boolean overdue = !closed && AdmissionPipelineRules.isOverdue(legalDue, snapshot.today());

        if (closed) {
            return name
                    + " já tem ASO admissional apto e com o ciclo encerrado ("
                    + lifecycleLabel(snapshot.lifecycleStatus())
                    + "). A etapa de ASO não fica em atraso. Se a esteira ainda mostra prazo vencido, "
                    + "outra etapa passou do prazo, como registro em carteira ou integração, e não as datas do exame.";
        }
        if (!snapshot.hasAdmissionalExam()) {
            String base = name
                    + " não tem exame admissional cadastrado. A esteira só olha o exame do tipo admissional; "
                    + "periódico ou outro tipo não fecha essa etapa. O prazo legal é a véspera do início previsto ("
                    + fmt(snapshot.expectedStartDate())
                    + "), ou seja, "
                    + fmt(legalDue)
                    + ".";
            if (overdue) {
                return base
                        + " Esse dia já passou em relação a hoje ("
                        + fmt(snapshot.today())
                        + "), por isso o ASO aparece em atraso.";
            }
            return base + " Esse prazo ainda não venceu.";
        }
        if (overdue) {
            return name
                    + " aparece com prazo vencido e ASO em atraso porque o prazo da esteira é a véspera do início das atividades, "
                    + "não a data digitada no exame. O início previsto é "
                    + fmt(snapshot.expectedStartDate())
                    + ", então o ASO precisava estar apto até "
                    + fmt(legalDue)
                    + ". Hoje é "
                    + fmt(snapshot.today())
                    + " e esse prazo já passou. "
                    + examDatesSentence(snapshot)
                    + " Mudar agendamento, exame clínico, emissão ou vencimento para uma data futura não tira o atraso. "
                    + resultSentence(snapshot)
                    + " A etapa sai de atraso quando o resultado fica Apto e o ciclo fica Registrado, Transmitido ou Arquivado, "
                    + "ou quando o início previsto é adiado para que a véspera ainda não tenha passado.";
        }
        return "O prazo legal do ASO de "
                + name
                + " ainda não venceu: a véspera do início previsto é "
                + fmt(legalDue)
                + ". "
                + examDatesSentence(snapshot)
                + " Essas datas do cadastro de Exames não são o relógio da esteira. "
                + resultSentence(snapshot)
                + " A etapa só fecha quando o resultado fica Apto e o ciclo fica Registrado, Transmitido ou Arquivado.";
    }

    private static String examDatesSentence(Snapshot snapshot) {
        return "No exame admissional, a data agendada é "
                + fmt(snapshot.scheduledDate())
                + ", o exame clínico é "
                + fmt(snapshot.clinicalExamDate())
                + ", a emissão do ASO é "
                + fmt(snapshot.asoIssueDate())
                + " e o vencimento é "
                + fmt(snapshot.validityDate())
                + ".";
    }

    private static String resultSentence(Snapshot snapshot) {
        return "O resultado está "
                + resultLabel(snapshot.result())
                + " e o status do ciclo está "
                + lifecycleLabel(snapshot.lifecycleStatus())
                + ".";
    }

    private static String display(String name) {
        if (name == null || name.isBlank()) {
            return "Esta admissão";
        }
        return name.trim();
    }

    private static String fmt(LocalDate date) {
        return date == null ? "não informada" : DATE_BR.format(date);
    }

    private static String resultLabel(OccupationalExamResultEnum result) {
        if (result == null) {
            return "não informado";
        }
        return switch (result) {
            case FIT -> "Apto";
            case UNFIT -> "Inapto";
        };
    }

    private static String lifecycleLabel(OccupationalExamLifecycleStatusEnum lifecycle) {
        if (lifecycle == null) {
            return "não informado";
        }
        return switch (lifecycle) {
            case PREVISTO -> "Previsto";
            case CONVOCADO -> "Convocado";
            case REALIZADO -> "Realizado";
            case REGISTRADO -> "Registrado";
            case TRANSMITIDO -> "Transmitido";
            case ARQUIVADO -> "Arquivado";
            case VENCIDO_INADIMPLENTE -> "Vencido / inadimplente";
        };
    }
}
