import {RevealGroup, RevealItem} from "@/components/motion";

/** Lista numerada do site (01, 02…): título em tinta, apoio em cinza. Os itens entram em sequência. */
export function NumberedList({items, className = ""}: {items: {title: string; description: string}[]; className?: string}) {
    return (
        <RevealGroup as="ul" className={`flex flex-col gap-5 ${className}`}>
            {items.map((item, index) => (
                <RevealItem as="li" key={item.title} className="flex items-baseline">
                    <span className="w-[45px] shrink-0 text-[12px] text-muted">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                        <p className="text-[15px] text-ink">{item.title}</p>
                        <p className="mt-1 text-[13px] text-muted">{item.description}</p>
                    </div>
                </RevealItem>
            ))}
        </RevealGroup>
    );
}
