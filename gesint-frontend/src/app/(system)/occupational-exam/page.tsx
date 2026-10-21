import { redirect } from "next/navigation";

/** Exames ocupacionais operacionais ficam na aba Exames da Admissão. */
export default function OccupationalExamPage() {
    redirect("/collaborator/admission");
}
