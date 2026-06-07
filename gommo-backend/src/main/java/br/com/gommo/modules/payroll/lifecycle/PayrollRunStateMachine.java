package br.com.gommo.modules.payroll.lifecycle;

import br.com.gommo.modules.payroll.entity.PayrollStatusEnum;
import br.com.gommo.modules.payroll.exception.PayrollRunException;

public final class PayrollRunStateMachine {

    private PayrollRunStateMachine() {}

    public static boolean isLocked(PayrollStatusEnum status) {
        return status == PayrollStatusEnum.CLOSED || status == PayrollStatusEnum.CANCELLED;
    }

    public static boolean canProcess(PayrollStatusEnum status) {
        return status == PayrollStatusEnum.OPEN || status == PayrollStatusEnum.PROCESSED;
    }

    public static boolean canReview(PayrollStatusEnum status) {
        return status == PayrollStatusEnum.PROCESSED;
    }

    public static boolean canClose(PayrollStatusEnum status) {
        return status == PayrollStatusEnum.REVIEWED;
    }

    public static boolean canReopen(PayrollStatusEnum status) {
        return status == PayrollStatusEnum.CLOSED;
    }

    public static boolean canEditMetadata(PayrollStatusEnum status) {
        return !isLocked(status) && status != PayrollStatusEnum.PROCESSING;
    }

    public static void assertWritable(PayrollStatusEnum status) {
        if (isLocked(status)) {
            throw PayrollRunException.locked();
        }
        if (status == PayrollStatusEnum.PROCESSING) {
            throw PayrollRunException.processing();
        }
    }

    public static void assertCanProcess(PayrollStatusEnum status) {
        if (!canProcess(status)) {
            throw PayrollRunException.invalidStatus();
        }
    }

    public static void assertCanReview(PayrollStatusEnum status) {
        if (!canReview(status)) {
            throw PayrollRunException.invalidTransition();
        }
    }

    public static void assertCanClose(PayrollStatusEnum status) {
        if (!canClose(status)) {
            throw PayrollRunException.invalidTransition();
        }
    }

    public static void assertCanReopen(PayrollStatusEnum status) {
        if (!canReopen(status)) {
            throw PayrollRunException.invalidTransition();
        }
    }
}
