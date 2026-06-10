import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import type { AdmissionEmergencyContact } from "@/modules/person/collaborators/admission/dto/admission-process.dto";
import { Button } from "@/shared/components/ui/Button";
import { InputPhone, InputSelect, InputString } from "@/shared/components/ui/input/index";
import { createEmptyEmergencyContact } from "@/modules/person/collaborators/admission/lib/admission-emergency-contacts.util";
import { EMERGENCY_CONTACT_RELATIONSHIP_ITEMS } from "@/modules/person/collaborators/admission/lib/admission-form.constants";

type AdmissionEmergencyContactsFieldProps = {
    contacts: AdmissionEmergencyContact[];
    onChange: (contacts: AdmissionEmergencyContact[]) => void;
};

export function AdmissionEmergencyContactsField({ contacts, onChange }: AdmissionEmergencyContactsFieldProps) {
    const relationshipItems = useMemo(() => {
        const extras = contacts
            .map((contact) => contact.relationship?.trim())
            .filter((value): value is string => Boolean(value))
            .filter((value) => !EMERGENCY_CONTACT_RELATIONSHIP_ITEMS.some((item) => item.value === value))
            .map((value) => ({ value, label: value }));
        return [...EMERGENCY_CONTACT_RELATIONSHIP_ITEMS, ...extras];
    }, [contacts]);
    const updateContact = (index: number, field: keyof AdmissionEmergencyContact, value: string) => {
        onChange(
            contacts.map((contact, contactIndex) =>
                contactIndex === index ? { ...contact, [field]: value } : contact,
            ),
        );
    };
    const addContact = () => {
        onChange([...contacts, createEmptyEmergencyContact()]);
    };
    const removeContact = (index: number) => {
        if (contacts.length <= 1) return;
        onChange(contacts.filter((_, contactIndex) => contactIndex !== index));
    };

    return (
        <div className="grid gap-3 sm:col-span-2">
            {contacts.map((contact, index) => {
                const showLabels = index === 0;
                const isLastRow = index === contacts.length - 1;
                return (
                    <div key={`emergency-contact-${index}`} className="flex flex-col gap-2 lg:flex-row lg:items-end">
                        <InputString
                            label={showLabels ? "Nome do contato" : undefined}
                            placeholder={showLabels ? undefined : "Nome do contato"}
                            value={contact.name}
                            onValueChange={(value) => updateContact(index, "name", value)}
                            required={index === 0}
                            wrapperClassName="min-w-0 flex-1"
                        />
                        <InputSelect
                            label={showLabels ? "Parentesco" : undefined}
                            items={relationshipItems}
                            value={contact.relationship ?? ""}
                            onValueChange={(value) => updateContact(index, "relationship", value)}
                            placeholder="Selecione"
                            clearable
                            wrapperClassName="w-full lg:w-[11rem] lg:shrink-0"
                        />
                        <InputPhone
                            label={showLabels ? "Telefone" : undefined}
                            placeholder={showLabels ? undefined : "(00) 00000-0000"}
                            value={contact.phone}
                            onValueChange={(value) => updateContact(index, "phone", value)}
                            required={index === 0}
                            wrapperClassName="w-full lg:w-[12.5rem] lg:shrink-0"
                        />
                        <div className="flex shrink-0 items-end pb-0.5 lg:w-10 lg:justify-center">
                            {isLastRow ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    aria-label="Adicionar contato de emergência"
                                    className="w-full lg:w-10 lg:px-0"
                                    leftIcon={<Plus className="size-4" />}
                                    onClick={addContact}
                                />
                            ) : (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    aria-label={`Remover contato ${index + 1}`}
                                    className="w-full lg:w-10 lg:px-0"
                                    leftIcon={<Trash2 className="size-4" />}
                                    onClick={() => removeContact(index)}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
