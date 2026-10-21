package br.com.gesint.modules.dp.organization.jobpositionsalarytable.exception;

public final class JobPositionSalaryTableExceptions {

    private JobPositionSalaryTableExceptions() {}

    public static final String NOT_FOUND_CODE = "JOB_POSITION_SALARY_TABLE_NOT_FOUND";
    public static final String NOT_FOUND_MSG = "Tabela salarial do cargo nao encontrada.";

    public static final String INVALID_RANGE_CODE = "JOB_POSITION_SALARY_TABLE_INVALID_RANGE";
    public static final String INVALID_RANGE_MSG =
            "Cada faixa deve respeitar minimo <= referencia <= maximo.";

    public static final String INVALID_ITEMS_CODE = "JOB_POSITION_SALARY_TABLE_INVALID_ITEMS";
    public static final String INVALID_ITEMS_MSG =
            "Informe ao menos um nivel (I, II ou III), sem duplicar.";
}
