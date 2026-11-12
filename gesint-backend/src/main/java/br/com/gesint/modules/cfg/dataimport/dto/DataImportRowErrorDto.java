package br.com.gesint.modules.cfg.dataimport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataImportRowErrorDto {

    private Integer rowNumber;
    private String matchKey;
    private String message;
    private String rowSnapshot;
}
