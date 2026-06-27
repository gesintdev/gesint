package br.com.gommo.modules.rh.person.exitinterview.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewReasonEnum;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewRehireAnswerEnum;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewRelationshipTypeEnum;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewStatusEnum;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewTerminationTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExitInterviewRequestDto {
    @NotNull(message = "Selecione o colaborador.") private UUID collaboratorId;

    @NotNull(message = "Informe a data da entrevista.") private LocalDate interviewDate;

    @Size(max = 255, message = "Motivo resumido deve ter no máximo 255 caracteres.") private String departureReason;

    private String feedback;
    private Boolean wouldRecommend;

    private ExitInterviewStatusEnum interviewStatus;

    @NotNull(message = "Selecione o tipo de vínculo.") private ExitInterviewRelationshipTypeEnum relationshipType;

    @Size(max = 200, message = "Nome do colaborador deve ter no máximo 200 caracteres.") private String collaboratorName;

    @Size(max = 60, message = "Matrícula deve ter no máximo 60 caracteres.") private String registrationNumber;

    @Size(max = 160, message = "Cargo deve ter no máximo 160 caracteres.") private String jobPositionName;

    private UUID jobPositionId;

    @Size(max = 160, message = "Departamento deve ter no máximo 160 caracteres.") private String departmentName;

    private UUID departmentId;

    @Size(max = 200, message = "Empresa/unidade deve ter no máximo 200 caracteres.") private String companyName;

    @Size(max = 200, message = "Gestor/responsável deve ter no máximo 200 caracteres.") private String managerName;

    private LocalDate admissionOrContractStartDate;
    private LocalDate terminationOrContractEndDate;
    private Integer tenureDays;
    private ExitInterviewTerminationTypeEnum terminationType;

    @Size(max = 200, message = "Responsável pela entrevista deve ter no máximo 200 caracteres.") private String interviewerName;

    private ExitInterviewReasonEnum mainReason;

    @Builder.Default
    private List<ExitInterviewReasonEnum> secondaryReasons = new ArrayList<>();

    private String detailedReason;

    @Valid @Builder.Default
    private List<ExitInterviewRatingDto> ratings = new ArrayList<>();

    @Valid @Builder.Default
    private List<ExitInterviewAnswerDto> openAnswers = new ArrayList<>();

    private ExitInterviewRehireAnswerEnum wouldReturn;
    private ExitInterviewRehireAnswerEnum companyWouldRehire;
    private String rehireNotes;

    @Valid @Builder.Default
    private List<ExitInterviewReturnChecklistItemDto> returnChecklist = new ArrayList<>();

    @Size(max = 100, message = "Modelo da entrevista deve ter no máximo 100 caracteres.") private String templateKey;

    private Integer templateVersion;

    @Builder.Default
    private Map<String, Object> templatePayload = Map.of();
}
