package br.com.gommo.modules.rh.person.jobrequisition.entity;

public enum JobRequisitionStatusEnum {
    DRAFT,
    PENDING_MANAGER,
    PENDING_HR,
    PENDING_DIRECTOR,
    APPROVED,
    REJECTED,
    CANCELED;

    public boolean isPending() {
        return this == PENDING_MANAGER || this == PENDING_HR || this == PENDING_DIRECTOR;
    }
}
