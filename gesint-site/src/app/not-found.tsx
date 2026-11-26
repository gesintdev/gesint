import type {Metadata} from "next";

import {SiteFooter} from "@/components/home/SiteFooter";
import {SiteHeader} from "@/components/home/SiteHeader";
import {StatusPage} from "@/components/pages/StatusPage";

export const metadata: Metadata = {title: "Página não encontrada — Gesint", robots: {index: false}};

export default function NotFound() {
    return (
        <>
            <SiteHeader/>
            <main className="flex flex-1 flex-col">
                <StatusPage
                    eyebrow="ERRO 404"
                    emoji="🧭"
                    lines={["Essa página", "não está aqui."]}
                    description="O endereço pode ter mudado ou nunca ter existido. Que tal recomeçar pelo início?"
                />
            </main>
            <SiteFooter/>
        </>
    );
}
