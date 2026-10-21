import { redirect } from "next/navigation";

/** Matriz de exames agora vive como aba do cadastro de Cargo. */
export default function ExamRequirementPage() {
    redirect("/organization/job-positions");
}
