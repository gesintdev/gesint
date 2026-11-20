"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MouseEvent } from "react";
import { toast } from "sonner";

import { admissionprocessKeys } from "@/modules/rh/person/collaborators/admission/admission.query";
import { ADMISSION_CLIENT_MESSAGES } from "@/modules/rh/person/collaborators/admission/exceptions/admission-process.messages";
import { admissionprocessService } from "@/modules/rh/person/collaborators/admission/services/admission-process.service";
import { useHasPermission } from "@/shared/auth/permissions";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";

type GenerateAdmissionAccessCodeButtonProps = {
    admissionId: string;
    className?: string;
    /** Evita que o clique abra a linha da esteira ou da listagem. */
    stopPropagation?: boolean;
};

export function GenerateAdmissionAccessCodeButton({
    admissionId,
    className,
    stopPropagation = false,
}: GenerateAdmissionAccessCodeButtonProps) {
    const queryClient = useQueryClient();
    const canWrite = useHasPermission("admission:write");
    const canPipeline = useHasPermission("admission:pipeline");
    const mutation = useMutation({
        mutationFn: () => admissionprocessService.issueAccessCode(admissionId),
        onSuccess: async (result) => {
            toast.success(`Cod. Colab. gerado: ${result.accessCode}`);
            await queryClient.invalidateQueries({ queryKey: admissionprocessKeys.all });
        },
        onError: (error: unknown) => {
            toast.error(
                ExceptionCapture.displayMessage(error, ADMISSION_CLIENT_MESSAGES.ACCESS_CODE_GENERATE_FAILED),
            );
        },
    });

    if (!canWrite && !canPipeline) return null;

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        if (stopPropagation) {
            event.stopPropagation();
            event.preventDefault();
        }
        mutation.mutate();
    };

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className={className}
            loading={mutation.isPending}
            onClick={handleClick}
        >
            Gerar código
        </Button>
    );
}
