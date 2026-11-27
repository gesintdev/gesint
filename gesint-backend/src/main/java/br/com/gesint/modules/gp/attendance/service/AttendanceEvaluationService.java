package br.com.gesint.modules.gp.attendance.service;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.core.util.BrazilianBusinessCalendar;
import br.com.gesint.modules.dp.offboarding.repository.OffboardingRepository;
import br.com.gesint.modules.dp.organization.company.entity.Company;
import br.com.gesint.modules.dp.organization.company.repository.CompanyRepository;
import br.com.gesint.modules.gp.timesheet.pdf.TimesheetCompanyInfo;
import br.com.gesint.modules.dp.organization.department.entity.Department;
import br.com.gesint.modules.dp.organization.department.repository.DepartmentRepository;
import br.com.gesint.modules.dp.organization.jobposition.entity.JobPosition;
import br.com.gesint.modules.dp.organization.jobposition.repository.JobPositionRepository;
import br.com.gesint.modules.dp.organization.workschedule.entity.WeekDayEnum;
import br.com.gesint.modules.dp.organization.workschedule.entity.WorkSchedule;
import br.com.gesint.modules.dp.organization.workschedule.entity.WorkScheduleDay;
import br.com.gesint.modules.dp.organization.workschedule.repository.WorkScheduleRepository;
import br.com.gesint.modules.gp.attendance.domain.AttendanceDayEvaluation;
import br.com.gesint.modules.gp.attendance.domain.AttendanceDayEvaluator;
import br.com.gesint.modules.gp.attendance.domain.AttendanceDayInput;
import br.com.gesint.modules.gp.attendance.domain.CollaboratorPeriodEvaluation;
import br.com.gesint.modules.gp.attendance.entity.AttendanceRecord;
import br.com.gesint.modules.gp.attendance.entity.AttendanceRequest;
import br.com.gesint.modules.gp.attendance.repository.AttendanceRecordRepository;
import br.com.gesint.modules.gp.attendance.repository.AttendanceRequestRepository;
import br.com.gesint.modules.gp.settings.dto.TimeTrackingSettings;
import br.com.gesint.modules.gp.settings.service.TimeTrackingSettingsService;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionProcess;
import br.com.gesint.modules.rh.person.collaborators.admission.entity.AdmissionStatusEnum;
import br.com.gesint.modules.rh.person.collaborators.admission.repository.AdmissionProcessRepository;
import br.com.gesint.modules.rh.person.collaborators.people.entity.Collaborator;
import br.com.gesint.modules.rh.person.collaborators.people.repository.CollaboratorRepository;
import br.com.gesint.modules.rh.person.leave.entity.LeaveRequest;
import br.com.gesint.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gesint.modules.rh.person.leave.repository.LeaveRequestRepository;
import br.com.gesint.modules.root.repository.AppUserRepository;

/**
 * Carrega o que a apuracao precisa (quadro de colaboradores, escala do CFG, admissao, ferias,
 * afastamentos, feriados e solicitacoes pendentes) e apura cada dia. Fonte unica dos numeros do
 * painel, da grid, do banco de horas, do espelho e dos alertas.
 *
 * Sem @PreAuthorize: e servico interno; quem expoe na API autoriza.
 */
@Service
public class AttendanceEvaluationService {

    public static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Sao_Paulo");
    private static final String REQUEST_PENDING = "PENDING";

    private final CollaboratorRepository collaboratorRepository;
    private final AdmissionProcessRepository admissionProcessRepository;
    private final OffboardingRepository offboardingRepository;
    private final AppUserRepository appUserRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final JobPositionRepository jobPositionRepository;
    private final DepartmentRepository departmentRepository;
    private final AttendanceRecordRepository recordRepository;
    private final AttendanceRequestRepository requestRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final TimeTrackingSettingsService settingsService;
    private final CompanyRepository companyRepository;

    public AttendanceEvaluationService(
            CollaboratorRepository collaboratorRepository,
            AdmissionProcessRepository admissionProcessRepository,
            OffboardingRepository offboardingRepository,
            AppUserRepository appUserRepository,
            WorkScheduleRepository workScheduleRepository,
            JobPositionRepository jobPositionRepository,
            DepartmentRepository departmentRepository,
            AttendanceRecordRepository recordRepository,
            AttendanceRequestRepository requestRepository,
            LeaveRequestRepository leaveRequestRepository,
            TimeTrackingSettingsService settingsService,
            CompanyRepository companyRepository) {
        this.collaboratorRepository = collaboratorRepository;
        this.admissionProcessRepository = admissionProcessRepository;
        this.offboardingRepository = offboardingRepository;
        this.appUserRepository = appUserRepository;
        this.workScheduleRepository = workScheduleRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.departmentRepository = departmentRepository;
        this.recordRepository = recordRepository;
        this.requestRepository = requestRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.settingsService = settingsService;
        this.companyRepository = companyRepository;
    }

    public TimeTrackingSettings settings() {
        return settingsService.current();
    }

    public LocalDate today() {
        return LocalDate.now(BUSINESS_ZONE);
    }

    /**
     * Apura o periodo para o quadro ativo (admitidos, nao desligados), ou so para os
     * colaboradores informados.
     */
    @Transactional(readOnly = true)
    public List<CollaboratorPeriodEvaluation> evaluate(LocalDate from, LocalDate to, Collection<UUID> onlyCollaborators) {
        return evaluate(from, to, onlyCollaborators, settingsService.current());
    }

    @Transactional(readOnly = true)
    public List<CollaboratorPeriodEvaluation> evaluate(
            LocalDate from, LocalDate to, Collection<UUID> onlyCollaborators, TimeTrackingSettings settings) {
        LocalDate start = from.isAfter(to) ? to : from;
        LocalDate end = from.isAfter(to) ? from : to;
        List<Collaborator> roster = roster(onlyCollaborators);
        if (roster.isEmpty()) {
            return List.of();
        }
        List<UUID> ids = roster.stream().map(Collaborator::getId).toList();

        Map<UUID, AdmissionProcess> admissions = latestCompletedAdmissions(new HashSet<>(ids));
        Map<UUID, WorkSchedule> schedules = workScheduleRepository
                .findAllByIdWithDays(
                        admissions.values().stream()
                                .map(AdmissionProcess::getWorkScheduleId)
                                .filter(id -> id != null)
                                .collect(Collectors.toSet()),
                        StatusEnum.DELETED)
                .stream()
                .collect(Collectors.toMap(WorkSchedule::getId, Function.identity(), (a, b) -> a));
        Map<UUID, String> jobTitles = jobPositionRepository
                .findAllById(admissions.values().stream()
                        .map(AdmissionProcess::getJobPositionId)
                        .filter(id -> id != null)
                        .collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(JobPosition::getId, JobPosition::getTitle, (a, b) -> a));
        Map<UUID, String> departments = departmentRepository
                .findAllById(admissions.values().stream()
                        .map(AdmissionProcess::getDepartmentId)
                        .filter(id -> id != null)
                        .collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(Department::getId, Department::getName, (a, b) -> a));

        Set<UUID> idSet = new HashSet<>(ids);
        Map<UUID, Map<LocalDate, AttendanceRecord>> records = new HashMap<>();
        for (AttendanceRecord record : recordRepository.findByWorkDateBetweenAndStatusNot(
                start.minusDays(1), end, StatusEnum.DELETED)) {
            if (record.getCollaboratorId() == null || !idSet.contains(record.getCollaboratorId())) {
                continue;
            }
            records.computeIfAbsent(record.getCollaboratorId(), key -> new HashMap<>())
                    .put(record.getWorkDate(), record);
        }

        Map<UUID, Set<LocalDate>> pendingRequestDays = new HashMap<>();
        for (AttendanceRequest request : requestRepository.findByRequestStatusAndPeriod(
                REQUEST_PENDING, start, end, StatusEnum.DELETED)) {
            pendingRequestDays.computeIfAbsent(request.getCollaboratorId(), key -> new HashSet<>())
                    .add(request.getWorkDate());
        }

        Map<UUID, List<LeaveRequest>> vacations = leaveRequestRepository
                .findApprovedByCollaboratorInAndTypeOverlapping(ids, LeaveTypeEnum.VACATION, start, end, StatusEnum.DELETED)
                .stream()
                .collect(Collectors.groupingBy(LeaveRequest::getCollaboratorId));
        Map<UUID, List<LeaveRequest>> absences = leaveRequestRepository
                .findApprovedAbsencesByCollaboratorInOverlapping(ids, LeaveTypeEnum.VACATION, start, end, StatusEnum.DELETED)
                .stream()
                .collect(Collectors.groupingBy(LeaveRequest::getCollaboratorId));

        Set<LocalDate> holidays = new HashSet<>();
        for (int year = start.getYear(); year <= end.getYear(); year++) {
            holidays.addAll(BrazilianBusinessCalendar.nationalHolidays(year));
        }

        LocalDate today = today();
        LocalTime now = LocalTime.now(BUSINESS_ZONE).withSecond(0).withNano(0);
        List<CollaboratorPeriodEvaluation> result = new ArrayList<>(roster.size());
        for (Collaborator collaborator : roster) {
            UUID id = collaborator.getId();
            AdmissionProcess admission = admissions.get(id);
            WorkSchedule schedule = admission != null && admission.getWorkScheduleId() != null
                    ? schedules.get(admission.getWorkScheduleId())
                    : null;
            LocalDate admissionDate = admissionDate(admission);
            int fallbackDaily = fallbackDailyMinutes(admission);
            Map<LocalDate, AttendanceRecord> byDay = records.getOrDefault(id, Map.of());
            Set<LocalDate> pendingDays = pendingRequestDays.getOrDefault(id, Set.of());
            List<LeaveRequest> collaboratorVacations = vacations.getOrDefault(id, List.of());
            List<LeaveRequest> collaboratorAbsences = absences.getOrDefault(id, List.of());

            List<AttendanceDayEvaluation> days = new ArrayList<>();
            for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
                WorkScheduleDay scheduleDay = scheduleDay(schedule, date);
                int expected = schedule != null
                        ? scheduleMinutes(scheduleDay)
                        : (isWeekend(date) ? 0 : fallbackDaily);
                LeaveRequest absence = coveringLeave(collaboratorAbsences, date);
                days.add(AttendanceDayEvaluator.evaluate(AttendanceDayInput.builder()
                        .collaboratorId(id)
                        .date(date)
                        .today(today)
                        .now(now)
                        .expectedMinutes(expected)
                        .scheduledStart(scheduleDay != null ? scheduleDay.getPeriod1Start() : null)
                        .scheduledEnd(scheduleDay != null ? scheduledEnd(scheduleDay) : null)
                        .holiday(holidays.contains(date))
                        .vacation(coveringLeave(collaboratorVacations, date) != null)
                        .justifiedLeave(absence != null && absence.getLeaveType() != LeaveTypeEnum.UNJUSTIFIED_ABSENCE)
                        .unjustifiedAbsence(absence != null && absence.getLeaveType() == LeaveTypeEnum.UNJUSTIFIED_ABSENCE)
                        .beforeAdmission(admissionDate != null && date.isBefore(admissionDate))
                        .pendingRequest(pendingDays.contains(date))
                        .record(byDay.get(date))
                        .previousRecord(byDay.get(date.minusDays(1)))
                        .toleranceMinutes(settings.getToleranceMinutes())
                        .hourBankEnabled(settings.isHourBankEnabled())
                        .overtimeEnabled(settings.isOvertimeEnabled())
                        .build()));
            }

            result.add(CollaboratorPeriodEvaluation.builder()
                    .collaboratorId(id)
                    .collaboratorCode(collaborator.getCode())
                    .collaboratorName(displayName(collaborator))
                    .photoObjectId(collaborator.getPhotoObjectId())
                    .companyId(collaborator.getCompanyId())
                    .jobTitle(admission != null ? jobTitles.get(admission.getJobPositionId()) : null)
                    .departmentName(admission != null ? departments.get(admission.getDepartmentId()) : null)
                    .workScheduleId(schedule != null ? schedule.getId() : null)
                    .workScheduleName(schedule != null ? schedule.getName() : null)
                    .admissionDate(admissionDate)
                    .days(days)
                    .build());
        }
        return result;
    }

    /**
     * Saldo do banco de horas acumulado do inicio da apuracao ate {@code until} (inclusive).
     * Antes do inicio configurado o saldo e zero.
     */
    @Transactional(readOnly = true)
    public Map<UUID, Integer> hourBankBalanceUntil(LocalDate until, Collection<UUID> onlyCollaborators) {
        TimeTrackingSettings settings = settingsService.current();
        LocalDate start = settings.getHourBankStartDate();
        if (!settings.isHourBankEnabled() || start == null || until.isBefore(start)) {
            return Map.of();
        }
        Map<UUID, Integer> balances = new HashMap<>();
        for (CollaboratorPeriodEvaluation evaluation : evaluate(start, until, onlyCollaborators, settings)) {
            balances.put(evaluation.getCollaboratorId(), evaluation.sumHourBank());
        }
        return balances;
    }

    /** Empregador (filial do colaborador) e CPF para o cabecalho do espelho. */
    @Transactional(readOnly = true)
    public TimesheetCompanyInfo companyFor(UUID collaboratorId) {
        Collaborator collaborator = collaboratorRepository.findById(collaboratorId).orElse(null);
        if (collaborator == null) {
            return TimesheetCompanyInfo.empty();
        }
        Company company = collaborator.getCompanyId() != null
                ? companyRepository.findById(collaborator.getCompanyId()).orElse(null)
                : null;
        String name = company == null ? null
                : (company.getLegalName() != null && !company.getLegalName().isBlank() ? company.getLegalName() : company.getTradeName());
        return new TimesheetCompanyInfo(name, company != null ? company.getCnpj() : null, collaborator.getCpf());
    }

    /** Quadro ativo: admissao concluida, colaborador ativo, nao desligado, sem o vinculo do ADMIN. */
    @Transactional(readOnly = true)
    public List<Collaborator> roster(Collection<UUID> onlyCollaborators) {
        Set<UUID> admitted = new HashSet<>(admissionProcessRepository.findCollaboratorIdsFromCompletedAdmissions(
                AdmissionStatusEnum.COMPLETED, StatusEnum.DELETED));
        if (onlyCollaborators != null) {
            admitted.retainAll(new HashSet<>(onlyCollaborators));
        }
        admitted.removeAll(offboardingRepository.findOffboardedCollaboratorIds(StatusEnum.DELETED));
        admitted.removeAll(appUserRepository.findCollaboratorIdsLinkedToSystemAdmin(StatusEnum.DELETED));
        if (admitted.isEmpty()) {
            return List.of();
        }
        return collaboratorRepository.findAllById(admitted).stream()
                .filter(collaborator -> collaborator.getStatus() == StatusEnum.ACTIVE)
                .sorted(Comparator.comparing(AttendanceEvaluationService::displayName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    public static String displayName(Collaborator collaborator) {
        return collaborator.getSocialName() != null && !collaborator.getSocialName().isBlank()
                ? collaborator.getSocialName()
                : collaborator.getFullName();
    }

    private Map<UUID, AdmissionProcess> latestCompletedAdmissions(Set<UUID> ids) {
        Map<UUID, AdmissionProcess> latest = new HashMap<>();
        for (AdmissionProcess admission : admissionProcessRepository
                .findByAdmissionStatusAndCollaboratorIdIsNotNullAndStatusNot(AdmissionStatusEnum.COMPLETED, StatusEnum.DELETED)) {
            if (!ids.contains(admission.getCollaboratorId())) {
                continue;
            }
            AdmissionProcess current = latest.get(admission.getCollaboratorId());
            if (current == null || orMin(admissionDate(admission)).isAfter(orMin(admissionDate(current)))) {
                latest.put(admission.getCollaboratorId(), admission);
            }
        }
        return latest;
    }

    private static LocalDate orMin(LocalDate date) {
        return date == null ? LocalDate.MIN : date;
    }

    private static LocalDate admissionDate(AdmissionProcess admission) {
        if (admission == null) {
            return null;
        }
        return admission.getContractStartDate() != null ? admission.getContractStartDate() : admission.getExpectedStartDate();
    }

    private static boolean isWeekend(LocalDate date) {
        return date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;
    }

    private static LeaveRequest coveringLeave(List<LeaveRequest> leaves, LocalDate date) {
        for (LeaveRequest leave : leaves) {
            if (leave.getStartDate() != null && leave.getEndDate() != null
                    && !date.isBefore(leave.getStartDate()) && !date.isAfter(leave.getEndDate())) {
                return leave;
            }
        }
        return null;
    }

    static WorkScheduleDay scheduleDay(WorkSchedule schedule, LocalDate date) {
        if (schedule == null || schedule.getDays() == null) {
            return null;
        }
        WeekDayEnum weekDay = WeekDayEnum.valueOf(date.getDayOfWeek().name());
        return schedule.getDays().stream()
                .filter(day -> day.getDayOfWeek() == weekDay)
                .findFirst()
                .orElse(null);
    }

    static int scheduleMinutes(WorkScheduleDay day) {
        if (day == null) {
            return 0;
        }
        return minutes(day.getPeriod1Start(), day.getPeriod1End()) + minutes(day.getPeriod2Start(), day.getPeriod2End());
    }

    private static LocalTime scheduledEnd(WorkScheduleDay day) {
        return day.getPeriod2End() != null ? day.getPeriod2End() : day.getPeriod1End();
    }

    private static int minutes(LocalTime start, LocalTime end) {
        if (start == null || end == null) {
            return 0;
        }
        int value = (int) Duration.between(start, end).toMinutes();
        return value < 0 ? value + 24 * 60 : value;
    }

    /**
     * Sem escala vinculada: usa a carga textual da admissao em dias uteis (40h = 8h, 44h = 8h48).
     * Nao inventa jornada no fim de semana.
     */
    private static int fallbackDailyMinutes(AdmissionProcess admission) {
        if (admission == null || admission.getWorkloadSchedule() == null || admission.getWorkloadSchedule().isBlank()) {
            return 8 * 60;
        }
        String text = admission.getWorkloadSchedule().toLowerCase(Locale.ROOT).replace(" ", "");
        if (text.contains("12x36")) {
            return 12 * 60;
        }
        Matcher matcher = Pattern.compile("(\\d+)").matcher(text);
        if (!matcher.find()) {
            return 8 * 60;
        }
        int hours = Integer.parseInt(matcher.group(1));
        if (hours >= 20 && hours <= 44) {
            return hours * 60 / 5;
        }
        return hours > 0 && hours <= 12 ? hours * 60 : 8 * 60;
    }
}
