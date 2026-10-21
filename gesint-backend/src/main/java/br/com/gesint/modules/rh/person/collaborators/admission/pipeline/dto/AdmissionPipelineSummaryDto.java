package br.com.gesint.modules.rh.person.collaborators.admission.pipeline.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/** Cabecalho da aba: os cinco tiles, o painel de prazos e o de bloqueios ativos. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionPipelineSummaryDto {

    private AdmissionPipelineKpisDto kpis;
    private List<AdmissionPipelineDeadlineDto> deadlines;
    private List<AdmissionPipelineBlockDto> blocks;
    private int totalInPipeline;
}
