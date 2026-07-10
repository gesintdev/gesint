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
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "attendance_request")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequest extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "attendance_record_id")
    private UUID attendanceRecordId;

    @Column(name = "original_clock_in")
    private LocalTime originalClockIn;

    @Column(name = "original_clock_out")
    private LocalTime originalClockOut;

    @Column(name = "original_break_start")
    private LocalTime originalBreakStart;

    @Column(name = "original_break_end")
    private LocalTime originalBreakEnd;

    @Column(name = "original_break_minutes")
    private Integer originalBreakMinutes;

    @Column(name = "original_notes", columnDefinition = "TEXT")
    private String originalNotes;

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

    @Column(name = "expected_hours", precision = 5, scale = 2)
    private BigDecimal expectedHours;

    @Column(name = "worked_hours", precision = 5, scale = 2)
    private BigDecimal workedHours;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false, length = 40)
    private AttendanceRequestTypeEnum requestType;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", length = 40)
    private AttendanceSourceEnum source;

    @Column(name = "client_request_id", length = 80)
    private String clientRequestId;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "request_status", nullable = false, length = 40)
    private String requestStatus;

    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "review_reason", columnDefinition = "TEXT")
    private String reviewReason;
}
