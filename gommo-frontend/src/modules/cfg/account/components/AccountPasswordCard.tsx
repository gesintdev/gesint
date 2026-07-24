"use client";

import {useMutation} from "@tanstack/react-query";
import {type SubmitEvent, useState} from "react";
import {toast} from "sonner";

import {accountService} from "@/modules/cfg/account/services/account.service";
import {Button} from "@/shared/components/ui/Button";
import {Card} from "@/shared/components/ui/Card";
import {InputPassword} from "@/shared/components/ui/input";
import {ExceptionCapture} from "@/shared/exceptions";

export function AccountPasswordCard() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
    const [error, setError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: () =>
            accountService.changePassword({
                currentPassword,
                newPassword,
                newPasswordConfirmation,
            }),
        onSuccess: () => {
            setCurrentPassword("");
            setNewPassword("");
            setNewPasswordConfirmation("");
            setError(null);
            toast.success("Senha atualizada");
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível alterar a senha.",
            });
            setError(ex.displayMessage);
        },
    });

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        if (newPassword.length < 8) {
            setError("A senha deve ter no mínimo 8 caracteres");
            return;
        }
        if (newPassword !== newPasswordConfirmation) {
            setError("A senha e a confirmação não conferem");
            return;
        }
        mutation.mutate();
    };

    return (
        <Card animate={false} title="Alterar senha" subtitle="Defina uma nova senha para o seu acesso">
            <form onSubmit={handleSubmit} className="grid w-full gap-3.5">
                <InputPassword
                    label="Senha atual"
                    autoComplete="current-password"
                    value={currentPassword}
                    onValueChange={setCurrentPassword}
                    required
                />
                <InputPassword
                    label="Nova senha"
                    autoComplete="new-password"
                    value={newPassword}
                    onValueChange={setNewPassword}
                    required
                    hint="Mínimo de 8 caracteres"
                />
                <InputPassword
                    label="Confirmar nova senha"
                    autoComplete="new-password"
                    value={newPasswordConfirmation}
                    onValueChange={setNewPasswordConfirmation}
                    required
                />
                {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
                <div className="flex justify-end pt-1">
                    <Button type="submit" variant="primary" loading={mutation.isPending}>
                        Salvar senha
                    </Button>
                </div>
            </form>
        </Card>
    );
}
