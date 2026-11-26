"use client";

import {AnimatePresence, motion} from "framer-motion";
import {useId, useState, type ComponentProps, type ReactNode} from "react";

import {EASE} from "@/components/motion";

/** Mesma caixa dos campos do sistema: 50px, raio 5px, borda fina, foco azul. Fonte 16px no celular (o iOS não dá zoom). */
const fieldClassName =
    "w-full rounded-[5px] border border-line bg-white px-4 text-[16px] text-ink placeholder:text-muted/60 outline-none transition-[border-color,box-shadow] duration-300 focus:border-brand focus:ring-4 focus:ring-brand/10 md:text-[15px]";

function FieldShell({id, label, hint, children, className = ""}: {id: string; label: string; hint?: ReactNode; children: ReactNode; className?: string}) {
    return (
        <div className={className}>
            <div className="flex items-baseline justify-between gap-4">
                <label htmlFor={id} className="text-[13px] font-medium text-ink">
                    {label}
                </label>
                {hint}
            </div>
            <div className="relative mt-2">{children}</div>
        </div>
    );
}

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {label: string; hint?: ReactNode};

/** Campo de texto. Com `type="password"` ganha o botão de mostrar/ocultar. */
export function TextField({label, hint, className, type = "text", ...props}: TextFieldProps) {
    const id = useId();
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";
    return (
        <FieldShell id={id} label={label} hint={hint} className={className}>
            <input id={id} type={isPassword && visible ? "text" : type} className={`${fieldClassName} h-[50px] ${isPassword ? "pr-20" : ""}`} {...props}/>
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setVisible((value) => !value)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded px-2 py-1 text-[12px] font-medium text-muted transition-colors hover:text-ink"
                >
                    {visible ? "Ocultar" : "Mostrar"}
                </button>
            )}
        </FieldShell>
    );
}

export function SelectField({label, options, className, ...props}: Omit<ComponentProps<"select">, "id"> & {label: string; options: string[]}) {
    const id = useId();
    return (
        <FieldShell id={id} label={label} className={className}>
            <select id={id} className={`${fieldClassName} h-[50px] appearance-none pr-10`} {...props}>
                <option value="">Selecione</option>
                {options.map((option) => (
                    <option key={option}>{option}</option>
                ))}
            </select>
            <span aria-hidden className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[12px] text-muted">
                ▾
            </span>
        </FieldShell>
    );
}

export function TextAreaField({label, className, ...props}: Omit<ComponentProps<"textarea">, "id"> & {label: string}) {
    const id = useId();
    return (
        <FieldShell id={id} label={label} className={className}>
            <textarea id={id} rows={4} className={`${fieldClassName} resize-none py-3`} {...props}/>
        </FieldShell>
    );
}

export function Checkbox({label, ...props}: Omit<ComponentProps<"input">, "type"> & {label: ReactNode}) {
    return (
        <label className="inline-flex cursor-pointer items-start gap-2.5 text-[13px] text-muted select-none">
            <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-brand" {...props}/>
            <span>{label}</span>
        </label>
    );
}

/** Aviso que aparece abaixo do formulário: esta tela ainda é só visual, nada foi enviado. */
export function DevNotice({show, children}: {show: boolean; children: ReactNode}) {
    return (
        <AnimatePresence>
            {show && (
                <motion.p
                    role="status"
                    initial={{opacity: 0, y: -6, height: 0}}
                    animate={{opacity: 1, y: 0, height: "auto"}}
                    exit={{opacity: 0, height: 0}}
                    transition={{duration: 0.4, ease: EASE}}
                    className="overflow-hidden"
                >
                    <span className="block rounded-[5px] bg-warning-bg px-4 py-3 text-[13px] text-warning-fg">{children}</span>
                </motion.p>
            )}
        </AnimatePresence>
    );
}

/**
 * Formulário só de vitrine: não envia nada a lugar nenhum. Ao enviar, mostra o aviso de "em desenvolvimento".
 * Recebe os campos e o botão como filhos.
 */
export function ShowcaseForm({notice, children, className = ""}: {notice: ReactNode; children: ReactNode; className?: string}) {
    const [sent, setSent] = useState(false);
    return (
        <form
            noValidate
            onSubmit={(event) => {
                event.preventDefault();
                setSent(true);
            }}
            className={`flex flex-col gap-5 ${className}`}
        >
            {children}
            <DevNotice show={sent}>{notice}</DevNotice>
        </form>
    );
}
