/**
 * Destinos usados em mais de um lugar do site.
 * Âncoras da home começam com "/" para também funcionarem a partir das outras páginas.
 */
export const links = {
    home: "/",
    login: "/entrar",
    forgotPassword: "/entrar/recuperar-senha",
    contact: "/contato",
    privacy: "/privacidade",
    terms: "/termos",
    solutions: "/#solucoes",
    features: "/#recursos",
    admission: "/#admissao",
    assistant: "/#assistente",
    security: "/#seguranca",
    howItWorks: "/#como-funciona",
    about: "/#duvidas",
} as const;

/** Menu principal (cabeçalho no desktop e no celular). */
export const navItems = [
    {label: "Soluções", href: links.solutions},
    {label: "Recursos", href: links.features},
    {label: "Assistente I.A.", href: links.assistant},
    {label: "Como funciona", href: links.howItWorks},
] as const;
