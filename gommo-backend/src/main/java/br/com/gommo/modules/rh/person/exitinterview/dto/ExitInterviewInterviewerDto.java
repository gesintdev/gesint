package br.com.gommo.modules.rh.person.exitinterview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExitInterviewInterviewerDto {
    private UUID id;
    private String label;
    private String username;
    private String email;
}
