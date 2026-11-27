import {Enter, LineReveal} from "@/components/motion";
import {Eyebrow} from "@/components/ui";

/** Título das páginas de acesso e de conteúdo: rótulo, título leve linha a linha e um apoio. */
export function PageHeading({eyebrow, lines, description, size = "md"}: {eyebrow: string; lines: string[]; description: string; size?: "md" | "lg"}) {
    const titleSize = size === "lg" ? "text-[40px] md:text-[56px] xl:text-[64px]" : "text-[40px] md:text-[48px]";
    return (
        <>
            <Enter y={8}>
                <Eyebrow>{eyebrow}</Eyebrow>
            </Enter>
            <LineReveal lines={lines} delay={0.1} className={`mt-4 font-light leading-[1.08] tracking-[-0.04em] text-ink md:mt-5 ${titleSize}`}/>
            <Enter delay={0.3}>
                <p className="mt-5 text-[16px] text-muted md:text-[17px]">{description}</p>
            </Enter>
        </>
    );
}
