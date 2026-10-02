package br.com.gommo.modules.careers.integration;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareersExperience {
    @Size(max = 200)
    private String companyName;

    @Size(max = 200)
    private String jobTitle;

    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean currentJob;
    private String description;

    public boolean isComplete() {
        return companyName != null
                && !companyName.isBlank()
                && jobTitle != null
                && !jobTitle.isBlank()
                && startDate != null;
    }
}
