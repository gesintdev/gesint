import Link from "next/link";

import { INTERNAL_DOCS } from "@/docs/provisionar-ambiente";
import { DocsToc } from "@/shared/components/docs/DocsToc";

export default function DocsIndexPage() {
    return (
        <div className="docs-layout">
            <article className="docs-article">
                <h1 className="docs-title">Visão geral</h1>
                <p className="docs-lead">
                    Documentação operacional do Admin Gommo. Use o menu lateral para navegar pelos
                    guias. O acesso exige sessão autenticada.
                </p>

                <section id="guias" className="docs-section">
                    <h2>Guias disponíveis</h2>
                    <ul className="docs-card-list">
                        {INTERNAL_DOCS.map((doc) => (
                            <li key={doc.slug}>
                                <Link href={`/docs/${doc.slug}`} className="docs-card">
                                    <span className="docs-card__title">{doc.title}</span>
                                    <span className="docs-card__summary">{doc.summary}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            </article>

            <DocsToc items={[{ id: "guias", label: "Guias disponíveis" }]} />
        </div>
    );
}
