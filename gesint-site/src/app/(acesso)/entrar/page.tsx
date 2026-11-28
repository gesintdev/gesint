import type {Metadata} from "next";

import {PageHeading} from "@/components/pages/PageHeading";
import {LoginForm} from "@/components/pages/LoginForm";
import {Enter} from "@/components/motion";
import {ArrowLink} from "@/components/ui";
import {links} from "@/lib/links";

export const metadata: Metadata = {title: "Entrar — Gesint", robots: {index: false}};

export default function LoginPage() {
    return (
        <>
            <PageHeading eyebrow="ÁREA DO CLIENTE" lines={["Entrar no", "Gesint."]} description="Use o e-mail e a senha cadastrados pela sua empresa."/>
            <Enter delay={0.35} className="mt-8 md:mt-10">
                <LoginForm/>
            </Enter>
            <Enter delay={0.45} className="mt-10 border-t border-line pt-6 text-[14px] text-muted">
                Sua empresa ainda não usa a Gesint?
                <ArrowLink href={links.contact} className="mt-2 flex w-fit">
                    Fale com a Gesint
                </ArrowLink>
            </Enter>
        </>
    );
}
