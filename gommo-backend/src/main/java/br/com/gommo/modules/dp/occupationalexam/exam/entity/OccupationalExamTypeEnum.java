package br.com.gommo.modules.dp.occupationalexam.exam.entity;

/**
 * Tipos de exame ocupacional alinhados ao eSocial S-2220 (codigos 0-4).
 */
public enum OccupationalExamTypeEnum {
    ADMISSIONAL(0),
    PERIODICO(1),
    RETORNO_AO_TRABALHO(2),
    MUDANCA_DE_RISCO_OCUPACIONAL(3),
    DEMISSIONAL(4);

    private final int esocialCode;

    OccupationalExamTypeEnum(int esocialCode) {
        this.esocialCode = esocialCode;
    }

    public int getEsocialCode() {
        return esocialCode;
    }

    public static OccupationalExamTypeEnum fromEsocialCode(int code) {
        for (OccupationalExamTypeEnum value : values()) {
            if (value.esocialCode == code) {
                return value;
            }
        }
        throw new IllegalArgumentException("Codigo eSocial S-2220 invalido: " + code);
    }
}
