"use client";

import Link from "next/link";

import {Checkbox, ShowcaseForm, TextField} from "@/components/forms";
import {Button} from "@/components/ui";
import {links} from "@/lib/links";

/** Login só visual: nenhum dado sai da página. */
export function LoginForm() {
    return (
        <ShowcaseForm notice="O acesso pelo site ainda está em desenvolvimento. Por enquanto, entre pelo endereço da sua empresa.">
            <TextField label="E-mail" type="email" name="email" placeholder="voce@suaempresa.com.br" autoComplete="off"/>
            <TextField
                label="Senha"
                type="password"
                name="senha"
                placeholder="Sua senha"
                autoComplete="off"
                hint={
                    <Link href={links.forgotPassword} className="text-[13px] text-brand hover:text-brand-hover">
                        Esqueceu a senha?
                    </Link>
                }
            />
            <Checkbox label="Manter conectado neste dispositivo" name="lembrar"/>
            <Button type="submit" className="mt-1 w-full">
                Entrar
            </Button>
        </ShowcaseForm>
    );
}

/** Recuperação de senha só visual. */
export function ForgotPasswordForm() {
    return (
        <ShowcaseForm notice="A recuperação de senha pelo site ainda está em desenvolvimento. Fale com o administrador do Gesint na sua empresa.">
            <TextField label="E-mail" type="email" name="email" placeholder="voce@suaempresa.com.br" autoComplete="off"/>
            <Button type="submit" className="mt-1 w-full">
                Enviar link de recuperação
            </Button>
        </ShowcaseForm>
    );
}
