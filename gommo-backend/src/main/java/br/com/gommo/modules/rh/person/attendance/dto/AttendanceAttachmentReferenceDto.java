package br.com.gommo.modules.rh.person.attendance.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class AttendanceAttachmentReferenceDto {
    @NotNull private UUID objectId;

    @Size(max = 255) private String fileName;

    @Size(max = 64) private String documentType;
}
