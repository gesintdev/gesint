import Link from "next/link";

import { slugifyHeading } from "@/docs/nav";
import { PROVISIONAR_AMBIENTE_DOC } from "@/docs/provisionar-ambiente";
import { DocsToc } from "@/shared/components/docs/DocsToc";

export default function ProvisionarAmbienteDocsPage() {
    const doc = PROVISIONAR_AMBIENTE_DOC;
    const toc = doc.sections.map((section) => ({
        id: slugifyHeading(section.title),
        label: section.title,
    }));

    return (
        <div className="docs-layout">
            <article className="docs-article">
                <nav className="docs-crumb" aria-label="Breadcrumb">
                    <Link href="/docs">Documentação</Link>
                    <span>/</span>
                    <span>Ambiente</span>
                    <span>/</span>
                    <span>Provisionar</span>
                </nav>

                <h1 className="docs-title">{doc.title}</h1>
                <p className="docs-lead">{doc.summary}</p>

                {doc.sections.map((section) => {
                    const id = slugifyHeading(section.title);
                    return (
                        <section key={section.title} id={id} className="docs-section">
                            <h2>{section.title}</h2>
                            {"paragraphs" in section && section.paragraphs
                                ? section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                                : null}
                            {"steps" in section && section.steps ? (
                                <ol>
                                    {section.steps.map((step) => (
                                        <li key={step}>{step}</li>
                                    ))}
                                </ol>
                            ) : null}
                            {"bullets" in section && section.bullets ? (
                                <ul>
                                    {section.bullets.map((bullet) => (
                                        <li key={bullet}>{bullet}</li>
                                    ))}
                                </ul>
                            ) : null}
                            {"code" in section && section.code ? (
                                <pre className="docs-code">{section.code}</pre>
                            ) : null}
                        </section>
                    );
                })}
            </article>

            <DocsToc items={toc} />
        </div>
    );
}
