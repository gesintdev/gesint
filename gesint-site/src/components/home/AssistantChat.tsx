"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useState} from "react";

import {EASE, Typewriter} from "@/components/motion";
import {Divider, StatusBadge} from "@/components/ui";

const QUESTION = "Resuma a admissão do Lucas e me diga o que falta.";

/** Três pontinhos de "pensando". */
function Thinking() {
    return (
        <span className="flex gap-1" aria-label="Assistente pensando">
            {[0, 1, 2].map((dot) => (
                <motion.span
                    key={dot}
                    className="size-1.5 rounded-full bg-muted"
                    animate={{opacity: [0.25, 1, 0.25]}}
                    transition={{duration: 1, repeat: Infinity, delay: dot * 0.15}}
                />
            ))}
        </span>
    );
}

/**
 * Conversa de exemplo com o assistente (nomes e dados fictícios).
 * A pergunta se digita quando o card entra na tela; depois de um instante "pensando", a resposta aparece.
 */
export function AssistantChat() {
    const [stage, setStage] = useState<"asking" | "thinking" | "answered">("asking");

    const onQuestionTyped = () => {
        setStage("thinking");
        setTimeout(() => setStage("answered"), 900);
    };

    return (
        <div className="rounded-md bg-white px-5 pt-6 pb-6 md:px-8 md:pt-[28px] md:pb-8">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-[22px] font-light text-ink md:text-[24px]">Assistente IA</p>
                    <p className="mt-1.5 text-[13px] text-muted">Pergunte sobre qualquer tela ou processo.</p>
                </div>
                <StatusBadge tone="info" className="h-7 px-2.5 text-[11px]">
                    Exemplo ilustrativo
                </StatusBadge>
            </div>
            <Divider className="mt-[25px]"/>

            <div className="mt-6 flex min-h-[260px] flex-col gap-4">
                <p className="ml-auto max-w-[85%] rounded-md bg-surface px-4 py-3 text-[14px] text-ink">
                    <Typewriter text={QUESTION} delay={0.4} onDone={onQuestionTyped}/>
                </p>

                <AnimatePresence mode="wait">
                    {stage === "thinking" && (
                        <motion.div key="thinking" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="px-1 py-2">
                            <Thinking/>
                        </motion.div>
                    )}
                    {stage === "answered" && (
                        <motion.div
                            key="answer"
                            initial={{opacity: 0, y: 12}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.6, ease: EASE}}
                            className="max-w-[92%] rounded-md border border-line px-4 py-4 text-[14px] text-ink"
                        >
                            <p>
                                A admissão está na etapa <strong className="font-medium">eSocial</strong>. Documentos e ASO estão completos e o contrato
                                foi assinado ontem.
                            </p>
                            <p className="mt-2 text-muted">Falta só enviar o S-2200. O prazo legal vence em 2 dias.</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {["Abrir admissão", "Ver pendências"].map((label) => (
                                    <span key={label} className="inline-flex items-center gap-1 rounded bg-brand-soft px-2 py-1 text-[12px] font-medium text-brand">
                                        {label} →
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-[5px] border border-line px-4 py-3 text-[14px] text-muted">
                <span className="flex-1 truncate">Por que o ASO está em atraso?</span>
                <span aria-hidden className="text-brand">↗</span>
            </div>
        </div>
    );
}
