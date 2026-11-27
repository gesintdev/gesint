import {SiteFooter} from "@/components/home/SiteFooter";
import {SiteHeader} from "@/components/home/SiteHeader";

/** Páginas públicas: cabeçalho fixo e rodapé. */
export default function SiteLayout({children}: LayoutProps<"/">) {
    return (
        <>
            <SiteHeader/>
            <main className="flex flex-1 flex-col">{children}</main>
            <SiteFooter/>
        </>
    );
}
