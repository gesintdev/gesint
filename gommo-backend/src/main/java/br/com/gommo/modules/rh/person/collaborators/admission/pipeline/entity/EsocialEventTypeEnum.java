package br.com.gommo.modules.rh.person.collaborators.admission.pipeline.entity;

/** Identificadores oficiais usam hifen (S-2200); o label do enum PG usa underscore. */
public enum EsocialEventTypeEnum {
    S_2200("S-2200"),
    S_2206("S-2206"),
    S_2230("S-2230"),
    S_2299("S-2299");

    private final String officialCode;

    EsocialEventTypeEnum(String officialCode) {
        this.officialCode = officialCode;
    }

    public String getOfficialCode() {
        return officialCode;
    }
}
