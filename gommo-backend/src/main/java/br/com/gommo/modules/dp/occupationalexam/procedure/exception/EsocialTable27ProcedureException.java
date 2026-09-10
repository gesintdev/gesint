package br.com.gommo.modules.dp.occupationalexam.procedure.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class EsocialTable27ProcedureException {

    private EsocialTable27ProcedureException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                EsocialTable27ProcedureExceptions.NOT_FOUND_CODE,
                EsocialTable27ProcedureExceptions.NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
