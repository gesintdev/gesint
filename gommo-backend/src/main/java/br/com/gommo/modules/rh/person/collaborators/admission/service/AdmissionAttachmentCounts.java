package br.com.gommo.modules.rh.person.collaborators.admission.service;

import java.util.UUID;

record AdmissionAttachmentCounts(long documentCount, long contractDocumentCount) {

    static final AdmissionAttachmentCounts ZERO = new AdmissionAttachmentCounts(0, 0);

    static AdmissionAttachmentCounts fromLinks(
            java.util.List<br.com.gommo.modules.storage.entity.StorageObjectLink> links, UUID entityId) {
        long documents = links.stream()
                .filter(link -> entityId.equals(link.getEntityId()))
                .filter(link -> "DOCUMENT".equalsIgnoreCase(link.getLinkRole()))
                .count();
        long contracts = links.stream()
                .filter(link -> entityId.equals(link.getEntityId()))
                .filter(link -> "CONTRACT".equalsIgnoreCase(link.getLinkRole()))
                .count();
        return new AdmissionAttachmentCounts(documents, contracts);
    }
}
