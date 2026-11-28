import Link from "next/link";
import type {ComponentProps} from "react";

/**
 * Link que escolhe o elemento certo: âncoras da home (`/#secao`) viram `<a>` comum, para o Lenis rolar
 * suave até a seção; rotas usam o `Link` do Next (navegação sem recarregar).
 */
export function SmartLink({href, ...props}: Omit<ComponentProps<"a">, "href"> & {href: string}) {
    if (href.includes("#")) return <a href={href} {...props}/>;
    return <Link href={href} {...props}/>;
}
