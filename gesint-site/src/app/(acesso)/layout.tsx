import Image from "next/image";
import Link from "next/link";

import painelDp from "@/assets/painel-dp.png";
import {Enter, Parallax} from "@/components/motion";
import {Divider, Eyebrow, Logo} from "@/components/ui";
import {links} from "@/lib/links";

/** Lado direito (só desktop): o mesmo card do hero, com a tela do sistema. */
function ShowcasePanel() {
    return (
        <Enter delay={0.2} y={32} className="hidden lg:block">
            <Parallax distance={14}>
                <div className="rounded-md bg-white px-8 pt-[28px] pb-6">
                    <Eyebrow>SEU DIA A DIA, ORGANIZADO</Eyebrow>
                    <p className="mt-3 text-[24px] font-light leading-[1.3] text-ink">
                        Bom te ver de novo.
                        <br/>
                        Tudo segue no seu lugar.
                    </p>
                    <Divider className="mt-[25px]"/>
                    <div className="mt-6 overflow-hidden rounded-[5px] border border-line">
                        <Image src={painelDp} alt="" placeholder="blur" sizes="560px" className="block h-auto w-full"/>
                    </div>
                    <p className="mt-5 text-[11px] text-muted">Exemplo ilustrativo da experiência Gesint</p>
                </div>
            </Parallax>
        </Enter>
    );
}

/** Páginas de acesso: sem o menu do site, formulário à esquerda e a vitrine do sistema à direita. */
export default function AccessLayout({children}: LayoutProps<"/">) {
    return (
        <div className="flex min-h-screen flex-1 flex-col px-5 md:px-10 xl:px-[88px]">
            <header className="mx-auto flex h-[72px] w-full max-w-[1264px] items-center justify-between lg:h-[95px]">
                <Link href={links.home} aria-label="Gesint — voltar ao início">
                    <Logo className="h-7 lg:h-[34px]"/>
                </Link>
                <Link href={links.home} className="text-[14px] text-muted transition-colors hover:text-ink">
                    ← Voltar ao site
                </Link>
            </header>
            <Divider className="mx-auto w-full max-w-[1264px]"/>
            <main className="mx-auto grid w-full max-w-[1264px] flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,560fr)_minmax(0,584fr)] lg:gap-20 lg:py-16">
                <div className="mx-auto w-full max-w-[420px] lg:mx-0">{children}</div>
                <ShowcasePanel/>
            </main>
        </div>
    );
}
