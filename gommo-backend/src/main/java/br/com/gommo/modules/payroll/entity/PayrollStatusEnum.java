package br.com.gommo.modules.payroll.entity;

public enum PayrollStatusEnum {
    OPEN,
    PROCESSING,
    PROCESSED,
    REVIEWED,
    CLOSED,
    CANCELLED,
    /** @deprecated migrado para {@link #OPEN} */
    @Deprecated
    DRAFT
}
