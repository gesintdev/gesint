package br.com.gommo.modules.dp.occupationalexam.exam.domain;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.Objects;
import java.util.Set;

import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gommo.modules.dp.occupationalexam.exam.entity.OccupationalExamTypeEnum;

/**
 * Regras puras do motor de conformidade de exames ocupacionais (NR-7 / eSocial).
 */
public final class OccupationalExamComplianceRules {

    public static final int RETURN_EXAM_MIN_LEAVE_DAYS = 30;
    public static final int DISMISSAL_DEADLINE_DAYS = 10;
    public static final int WAIVER_DAYS_RISK_1_2 = 135;
    public static final int WAIVER_DAYS_RISK_3_4 = 90;

    private OccupationalExamComplianceRules() {}

    public static LocalDate calculateDueDate(LocalDate referenceDate, Integer periodicityMonths) {
        if (referenceDate == null || periodicityMonths == null || periodicityMonths <= 0) {
            return null;
        }
        return referenceDate.plusMonths(periodicityMonths);
    }

    public static boolean isReturnExamRequired(int durationDays, LeaveTypeEnum leaveType) {
        return durationDays >= RETURN_EXAM_MIN_LEAVE_DAYS && isMedicalOrAccidentLeave(leaveType);
    }

    public static boolean isMedicalOrAccidentLeave(LeaveTypeEnum leaveType) {
        if (leaveType == null) {
            return false;
        }
        return switch (leaveType) {
            case MEDICAL, MEDICAL_CERTIFICATE, SICK_LEAVE_INSS, OCCUPATIONAL_ACCIDENT -> true;
            default -> false;
        };
    }

    /**
     * Detecta se a mudanca de cargo exige exame (tipo 3) comparando codigos de
     * procedimentos complementares exigidos pela matriz vigente de destino que
     * nao estejam cobertos (ou estejam vencidos) na origem/colaborador.
     */
    public static boolean positionChangeRequiresExam(
            Collection<String> destinationProcedureCodes, Collection<String> coveredValidProcedureCodes) {
        if (destinationProcedureCodes == null || destinationProcedureCodes.isEmpty()) {
            // Mesmo sem complementares, a mudanca de risco ocupacional pode
            // exigir ASO clinico; se ha matriz de destino tipada, o gatilho
            // externo decide criar o exame. Aqui so comparamos complementares.
            return false;
        }
        Set<String> covered = coveredValidProcedureCodes == null
                ? Set.of()
                : coveredValidProcedureCodes.stream()
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .filter(code -> !code.isEmpty())
                        .collect(java.util.stream.Collectors.toSet());
        for (String required : destinationProcedureCodes) {
            if (required == null || required.isBlank()) {
                continue;
            }
            if (!covered.contains(required.trim())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Avalia dispensa do demissional conforme NR-7, item 7.4.3.5:
     * 135 dias (graus 1-2) ou 90 dias (graus 3-4), sem agente critico.
     */
    public static DismissalWaiverDecision evaluateDismissalWaiver(
            LocalDate lastClinicalExamDate, LocalDate dismissalDate, int riskGrade, boolean exposedToCriticalAgent) {
        if (exposedToCriticalAgent) {
            return DismissalWaiverDecision.required("Exposicao a agente critico impede dispensa (NR-7, item 7.4.3.5).");
        }
        if (lastClinicalExamDate == null || dismissalDate == null) {
            return DismissalWaiverDecision.required("Nao ha exame ocupacional recente para embasar dispensa.");
        }
        int waiverWindow = riskGrade >= 3 ? WAIVER_DAYS_RISK_3_4 : WAIVER_DAYS_RISK_1_2;
        long daysSinceLastExam = ChronoUnit.DAYS.between(lastClinicalExamDate, dismissalDate);
        if (daysSinceLastExam < 0) {
            daysSinceLastExam = 0;
        }
        if (daysSinceLastExam < waiverWindow) {
            return DismissalWaiverDecision.waived("Dispensa aplicada (NR-7, item 7.4.3.5): ultimo exame em "
                    + lastClinicalExamDate
                    + ", "
                    + daysSinceLastExam
                    + " dias corridos, grau de risco "
                    + riskGrade
                    + ", janela "
                    + waiverWindow
                    + " dias.");
        }
        return DismissalWaiverDecision.required("Exame demissional exigivel: ultimo exame ha "
                + daysSinceLastExam
                + " dias (janela "
                + waiverWindow
                + " para grau "
                + riskGrade
                + ").");
    }

    public static LocalDate dismissalExamDueDate(LocalDate dismissalDate) {
        if (dismissalDate == null) {
            return null;
        }
        return dismissalDate.plusDays(DISMISSAL_DEADLINE_DAYS);
    }

    public static boolean isAdmissionalFit(OccupationalExamTypeEnum examType, boolean hasFitResult) {
        return examType == OccupationalExamTypeEnum.ADMISSIONAL && hasFitResult;
    }

    public record DismissalWaiverDecision(boolean waived, String reason) {
        public static DismissalWaiverDecision waived(String reason) {
            return new DismissalWaiverDecision(true, reason);
        }

        public static DismissalWaiverDecision required(String reason) {
            return new DismissalWaiverDecision(false, reason);
        }
    }
}
