import type { Metadata } from "next";

import { PontoLandingClient } from "@/modules/dp/attendance/components/PontoLandingClient";
import { assertPublicPontoTenant } from "@/modules/dp/attendance/server/public-ponto.server";

export const metadata: Metadata = {
    title: "Registro de Ponto | Gesint",
    description: "Registre seu ponto com o código de acesso do colaborador no endereço da sua empresa.",
};

export default async function PontoPage() {
    await assertPublicPontoTenant();
    return <PontoLandingClient />;
}
