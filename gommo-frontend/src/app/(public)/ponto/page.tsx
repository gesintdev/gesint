import type { Metadata } from "next";

import { PontoLandingClient } from "@/modules/dp/attendance/components/PontoLandingClient";

export const metadata: Metadata = {
    title: "Registro de Ponto | Gesint",
    description: "Registre seu ponto com o código de acesso do colaborador no endereço da sua empresa.",
};

export default function PontoPage() {
    return <PontoLandingClient />;
}
