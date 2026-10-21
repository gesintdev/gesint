"use client";

type TocItem = {
    id: string;
    label: string;
};

export function DocsToc({ items, title = "Nesta página" }: { items: TocItem[]; title?: string }) {
    if (items.length === 0) return null;

    return (
        <aside className="docs-toc">
            <div className="docs-toc__title">{title}</div>
            <ul className="docs-toc__list">
                {items.map((item) => (
                    <li key={item.id}>
                        <a href={`#${item.id}`} className="docs-toc__link">
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
