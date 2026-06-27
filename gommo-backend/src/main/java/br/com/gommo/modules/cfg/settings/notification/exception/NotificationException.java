package br.com.gommo.modules.cfg.settings.notification.exception;

import org.springframework.http.HttpStatus;

import br.com.gommo.core.exception.BusinessException;

public final class NotificationException {

    private NotificationException() {}

    public static BusinessException notFound() {
        return new BusinessException(
                NotificationExceptions.NOTIFICATION_NOT_FOUND,
                NotificationExceptions.NOTIFICATION_NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }
}
