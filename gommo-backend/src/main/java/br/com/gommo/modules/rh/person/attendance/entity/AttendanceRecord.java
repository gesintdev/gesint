package br.com.gommo.modules.rh.person.attendance.entity;

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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

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

    @Column(name = "break_start")
    private LocalTime breakStart;

    @Column(name = "break_end")
    private LocalTime breakEnd;

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

    @Column(name = "photo_object_id")
    private UUID photoObjectId;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "location_accuracy_meters", precision = 10, scale = 2)
    private BigDecimal locationAccuracyMeters;
}
