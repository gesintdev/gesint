package br.com.gommo.modules.rh.person.exitinterview.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewQuestionTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExitInterviewAnswerDto {
    @Size(max = 80) private String key;

    @Size(max = 240) private String question;

    private ExitInterviewQuestionTypeEnum type;

    private String answer;
}
