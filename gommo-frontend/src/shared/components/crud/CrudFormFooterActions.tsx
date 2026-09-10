"use client";

import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";

type CrudFormFooterActionsProps = {
    isSubmitting?: boolean;
    /** Texto do submit; default Salvar/Cadastrar conforme isEditing. */
    submitLabel?: string;
    /** Ex.: "Nova admissão". Default: "Novo cadastro". */
    newLabel?: string;
    /** Oculta o botão (ex.: cadastro edit-only sem create). */
    hideNew?: boolean;
    onCancel?: () => void | Promise<void>;
};

/**
 * Rodapé padrão dos formulários CRUD: Cancelar | Novo cadastro | Salvar/Cadastrar.
 * "Novo cadastro" limpa o formulário via startCreate (sempre visível quando há create).
 */
export function CrudFormFooterActions({
    isSubmitting = false,
    submitLabel,
    newLabel = "Novo cadastro",
    hideNew = false,
    onCancel,
}: CrudFormFooterActionsProps) {
    const { isEditing, goToList, startCreate } = useCrudScreen();

    return (
        <>
            <Button type="button" variant="ghost" onClick={() => void (onCancel ?? goToList)()}>
                Cancelar
            </Button>
            {hideNew ? null : (
                <Button type="button" variant="outline" onClick={() => void startCreate()}>
                    {newLabel}
                </Button>
            )}
            <Button type="submit" loading={isSubmitting}>
                {submitLabel ?? (isEditing ? "Salvar" : "Cadastrar")}
            </Button>
        </>
    );
}
