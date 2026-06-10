package br.com.gommo.admin.core.exception;

import jakarta.servlet.http.HttpServletRequest;

import java.time.OffsetDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import br.com.gommo.admin.core.security.CorrelationIdFilter;
import br.com.gommo.admin.modules.root.exception.AuthException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponseDto> handleBusiness(BusinessException ex, HttpServletRequest request) {
        return ResponseEntity.status(ex.getStatus()).body(error(ex.getCode(), ex.getMessage(), request));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        FieldError fieldError = ex.getBindingResult().getFieldError();
        String detail = fieldError != null ? fieldError.getField() + ": " + fieldError.getDefaultMessage() : "";
        String message = CoreException.validation(detail).getMessage();
        return ResponseEntity.badRequest().body(error(CoreExceptions.VALIDATION_ERROR_CODE, message, request));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponseDto> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest request) {
        BusinessException mapped = AuthException.invalidCredentials();
        return ResponseEntity.status(mapped.getStatus()).body(error(mapped.getCode(), mapped.getMessage(), request));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDto> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(error(CoreExceptions.FORBIDDEN_CODE, CoreExceptions.FORBIDDEN_MSG, request));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGeneric(Exception ex, HttpServletRequest request) {
        log.error("Unhandled error path={}", request.getRequestURI(), ex);
        BusinessException mapped = CoreException.internal();
        return ResponseEntity.status(mapped.getStatus()).body(error(mapped.getCode(), mapped.getMessage(), request));
    }

    private ErrorResponseDto error(String code, String message, HttpServletRequest request) {
        return ErrorResponseDto.builder()
                .code(code)
                .message(message)
                .correlationId(CorrelationIdFilter.getCorrelationId(request))
                .timestamp(OffsetDateTime.now())
                .build();
    }
}
