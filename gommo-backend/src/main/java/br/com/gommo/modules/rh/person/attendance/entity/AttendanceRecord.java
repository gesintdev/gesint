package br.com.gommo.modules.rh.person.attendance.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "attendance_record")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecord extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "clock_in")
    private LocalTime clockIn;

    @Column(name = "clock_out")
    private LocalTime clockOut;

    @Column(name = "break_minutes")
    private Integer breakMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "occurrence_type", nullable = false, length = 40)
    private AttendanceOccurrenceTypeEnum occurrenceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "occurrence_origin", nullable = false, length = 40)
    private AttendanceOccurrenceOriginEnum occurrenceOrigin;

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "expected_hours", precision = 5, scale = 2)
    private BigDecimal expectedHours;

    @Column(name = "worked_hours", precision = 5, scale = 2)
    private BigDecimal workedHours;

    @Column(name = "impacts_hour_bank", nullable = false)
    private Boolean impactsHourBank;

    @Column(name = "impacts_payroll", nullable = false)
    private Boolean impactsPayroll;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
