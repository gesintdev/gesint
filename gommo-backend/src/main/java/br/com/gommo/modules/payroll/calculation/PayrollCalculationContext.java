package br.com.gommo.modules.payroll.calculation;

import br.com.gommo.modules.payroll.event.entity.PayrollEvent;
import br.com.gommo.modules.payroll.event.entity.PayrollEventTypeEnum;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

public class PayrollCalculationContext {

    private final UUID payrollRunId;
    private final UUID collaboratorId;
    private final UUID companyId;
    private final int referenceYear;
    private final int referenceMonth;
    private final LocalDate periodStart;
    private final LocalDate periodEnd;
    private final Map<String, PayrollEvent> eventsByCode;
    private final List<CalculatedPayrollLine> lines = new ArrayList<>();
    private final Set<String> appliedEventCodes = new HashSet<>();

    private BigDecimal baseSalary = BigDecimal.ZERO;
    private BigDecimal adjustedBaseSalary = BigDecimal.ZERO;
    private BigDecimal weeklyWorkloadHours = new BigDecimal("44.00");
    private BigDecimal workedHours = BigDecimal.ZERO;
    private BigDecimal overtimeHours = BigDecimal.ZERO;
    private BigDecimal hourlyRate = BigDecimal.ZERO;
    private BigDecimal overtimePay = BigDecimal.ZERO;
    private BigDecimal nightShiftHours = BigDecimal.ZERO;
    private BigDecimal nightShiftPay = BigDecimal.ZERO;
    private int unpaidLeaveDays;

    public PayrollCalculationContext(
            UUID payrollRunId,
            UUID collaboratorId,
            UUID companyId,
            int referenceYear,
            int referenceMonth,
            LocalDate periodStart,
            LocalDate periodEnd,
            Map<String, PayrollEvent> eventsByCode) {
        this.payrollRunId = payrollRunId;
        this.collaboratorId = collaboratorId;
        this.companyId = companyId;
        this.referenceYear = referenceYear;
        this.referenceMonth = referenceMonth;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.eventsByCode = eventsByCode;
    }

    public UUID getPayrollRunId() {
        return payrollRunId;
    }

    public UUID getCollaboratorId() {
        return collaboratorId;
    }

    public UUID getCompanyId() {
        return companyId;
    }

    public int getReferenceYear() {
        return referenceYear;
    }

    public int getReferenceMonth() {
        return referenceMonth;
    }

    public LocalDate getPeriodStart() {
        return periodStart;
    }

    public LocalDate getPeriodEnd() {
        return periodEnd;
    }

    public Map<String, PayrollEvent> getEventsByCode() {
        return eventsByCode;
    }

    public BigDecimal getBaseSalary() {
        return baseSalary;
    }

    public void setBaseSalary(BigDecimal baseSalary) {
        this.baseSalary = baseSalary != null ? baseSalary : BigDecimal.ZERO;
    }

    public BigDecimal getAdjustedBaseSalary() {
        return adjustedBaseSalary;
    }

    public void setAdjustedBaseSalary(BigDecimal adjustedBaseSalary) {
        this.adjustedBaseSalary = adjustedBaseSalary != null ? adjustedBaseSalary : BigDecimal.ZERO;
    }

    public BigDecimal getWeeklyWorkloadHours() {
        return weeklyWorkloadHours;
    }

    public void setWeeklyWorkloadHours(BigDecimal weeklyWorkloadHours) {
        this.weeklyWorkloadHours = weeklyWorkloadHours != null ? weeklyWorkloadHours : new BigDecimal("44.00");
    }

    public BigDecimal getWorkedHours() {
        return workedHours;
    }

    public void setWorkedHours(BigDecimal workedHours) {
        this.workedHours = workedHours != null ? workedHours : BigDecimal.ZERO;
    }

    public BigDecimal getOvertimeHours() {
        return overtimeHours;
    }

    public void setOvertimeHours(BigDecimal overtimeHours) {
        this.overtimeHours = overtimeHours != null ? overtimeHours : BigDecimal.ZERO;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate != null ? hourlyRate : BigDecimal.ZERO;
    }

    public BigDecimal getOvertimePay() {
        return overtimePay;
    }

    public void setOvertimePay(BigDecimal overtimePay) {
        this.overtimePay = overtimePay != null ? overtimePay : BigDecimal.ZERO;
    }

    public BigDecimal getNightShiftHours() {
        return nightShiftHours;
    }

    public void setNightShiftHours(BigDecimal nightShiftHours) {
        this.nightShiftHours = nightShiftHours != null ? nightShiftHours : BigDecimal.ZERO;
    }

    public BigDecimal getNightShiftPay() {
        return nightShiftPay;
    }

    public void setNightShiftPay(BigDecimal nightShiftPay) {
        this.nightShiftPay = nightShiftPay != null ? nightShiftPay : BigDecimal.ZERO;
    }

    public int getUnpaidLeaveDays() {
        return unpaidLeaveDays;
    }

    public void setUnpaidLeaveDays(int unpaidLeaveDays) {
        this.unpaidLeaveDays = Math.max(0, unpaidLeaveDays);
    }

    public List<CalculatedPayrollLine> getLines() {
        return lines;
    }

    public Set<String> getAppliedEventCodes() {
        return appliedEventCodes;
    }

    public void addLine(String eventCode, BigDecimal quantity, BigDecimal unitValue, BigDecimal totalValue) {
        PayrollEvent event = eventsByCode.get(eventCode);
        if (event == null || totalValue == null || totalValue.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }
        lines.add(new CalculatedPayrollLine(
                event.getId(),
                eventCode,
                event.getEventType(),
                quantity != null ? quantity : BigDecimal.ONE,
                unitValue != null ? unitValue : totalValue,
                totalValue));
        appliedEventCodes.add(eventCode);
    }

    public BigDecimal sumByType(PayrollEventTypeEnum type) {
        return lines.stream()
                .filter(line -> line.eventType() == type)
                .map(CalculatedPayrollLine::totalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getInssBase() {
        return lines.stream()
                .filter(line -> line.eventType() == PayrollEventTypeEnum.EARNING)
                .filter(line -> {
                    PayrollEvent event = eventsByCode.get(line.eventCode());
                    return event != null && Boolean.TRUE.equals(event.getIncidesInss());
                })
                .map(CalculatedPayrollLine::totalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getFgtsBase() {
        return lines.stream()
                .filter(line -> line.eventType() == PayrollEventTypeEnum.EARNING)
                .filter(line -> {
                    PayrollEvent event = eventsByCode.get(line.eventCode());
                    return event != null && Boolean.TRUE.equals(event.getIncidesFgts());
                })
                .map(CalculatedPayrollLine::totalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getIrrfBase() {
        BigDecimal earnings = lines.stream()
                .filter(line -> line.eventType() == PayrollEventTypeEnum.EARNING)
                .filter(line -> {
                    PayrollEvent event = eventsByCode.get(line.eventCode());
                    return event != null && Boolean.TRUE.equals(event.getIncidesIrrf());
                })
                .map(CalculatedPayrollLine::totalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal inss = lines.stream()
                .filter(line -> "INSS".equals(line.eventCode()))
                .map(CalculatedPayrollLine::totalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return earnings.subtract(inss).max(BigDecimal.ZERO);
    }

    public Map<String, BigDecimal> formulaVariables() {
        Map<String, BigDecimal> vars = new HashMap<>();
        vars.put("baseSalary", baseSalary);
        vars.put("adjustedBaseSalary", adjustedBaseSalary);
        vars.put("weeklyWorkloadHours", weeklyWorkloadHours);
        vars.put("workedHours", workedHours);
        vars.put("overtimeHours", overtimeHours);
        vars.put("hourlyRate", hourlyRate);
        vars.put("overtimePay", overtimePay);
        vars.put("nightShiftHours", nightShiftHours);
        vars.put("nightShiftPay", nightShiftPay);
        vars.put("grossEarnings", sumByType(PayrollEventTypeEnum.EARNING));
        vars.put("inssBase", getInssBase());
        vars.put("fgtsBase", getFgtsBase());
        vars.put("irrfBase", getIrrfBase());
        vars.put("unpaidLeaveDays", BigDecimal.valueOf(unpaidLeaveDays));
        return vars;
    }

    public PayrollCalculationResult toResult() {
        BigDecimal gross = sumByType(PayrollEventTypeEnum.EARNING);
        BigDecimal deductions = sumByType(PayrollEventTypeEnum.DEDUCTION);
        BigDecimal net = gross.subtract(deductions);
        return new PayrollCalculationResult(
                collaboratorId,
                adjustedBaseSalary,
                gross,
                deductions,
                net.max(BigDecimal.ZERO),
                List.copyOf(lines));
    }
}
