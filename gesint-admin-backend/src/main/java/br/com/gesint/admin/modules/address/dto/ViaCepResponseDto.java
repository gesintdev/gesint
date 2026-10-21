package br.com.gesint.admin.modules.address.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ViaCepResponseDto {

    private String cep;
    private String logradouro;
    private String complemento;
    private String bairro;
    private String localidade;
    private String uf;
    /** ViaCEP pode devolver boolean ou string ("true"). */
    private Object erro;

    public boolean hasError() {
        if (erro == null) {
            return false;
        }
        if (erro instanceof Boolean bool) {
            return bool;
        }
        return Boolean.parseBoolean(String.valueOf(erro).trim());
    }
}
