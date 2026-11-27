import type {Metadata} from "next";

import {StatusPage} from "@/components/pages/StatusPage";

export const metadata: Metadata = {title: "Termos de uso — Gesint", robots: {index: false}};

export default function TermsPage() {
    return (
        <StatusPage
            eyebrow="EM DESENVOLVIMENTO"
            emoji="📄"
            lines={["Termos de uso.", "Em breve por aqui."]}
            description="As regras de uso da Gesint estão sendo preparadas, sem juridiquês."
        />
    );
}
