import type {Metadata} from "next";

import {StatusPage} from "@/components/pages/StatusPage";

export const metadata: Metadata = {title: "Política de privacidade — Gesint", robots: {index: false}};

export default function PrivacyPage() {
    return (
        <StatusPage
            eyebrow="EM DESENVOLVIMENTO"
            emoji="🔒"
            lines={["Política de privacidade.", "Em breve por aqui."]}
            description="Estamos escrevendo, em linguagem clara, como a Gesint trata e protege os dados das empresas e das pessoas."
        />
    );
}
