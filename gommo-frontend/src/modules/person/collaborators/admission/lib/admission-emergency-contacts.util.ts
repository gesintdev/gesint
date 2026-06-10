import type { AdmissionEmergencyContact } from "@/modules/person/collaborators/admission/dto/admission-process.dto";

export function createEmptyEmergencyContact(): AdmissionEmergencyContact {
    return { name: "", phone: "", relationship: "" };
}

export function normalizeEmergencyContacts(contacts?: AdmissionEmergencyContact[] | null): AdmissionEmergencyContact[] {
    if (!contacts?.length) {
        return [createEmptyEmergencyContact()];
    }
    return contacts.map((contact) => ({
        name: contact.name ?? "",
        phone: contact.phone ?? "",
        relationship: contact.relationship ?? "",
    }));
}
