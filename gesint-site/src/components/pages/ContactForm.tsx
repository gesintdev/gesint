"use client";

import {Checkbox, SelectField, ShowcaseForm, TextAreaField, TextField} from "@/components/forms";
import {Button} from "@/components/ui";

const teamSizes = ["Até 20 colaboradores", "21 a 50", "51 a 200", "201 a 500", "Mais de 500"];
const interests = ["Departamento pessoal", "Recursos humanos", "Gestão de ponto", "DP e RH", "Ainda estou conhecendo"];

/** Formulário de contato só visual: nada é enviado. */
export function ContactForm() {
    return (
        <ShowcaseForm notice="O envio pelo site ainda está em desenvolvimento. Em breve você poderá falar com a gente por aqui.">
            <div className="grid gap-5 sm:grid-cols-2">
                <TextField label="Nome" name="nome" placeholder="Como podemos te chamar?" autoComplete="off"/>
                <TextField label="Empresa" name="empresa" placeholder="Nome da empresa" autoComplete="off"/>
                <TextField label="E-mail corporativo" type="email" name="email" placeholder="voce@suaempresa.com.br" autoComplete="off"/>
                <TextField label="Telefone" type="tel" name="telefone" placeholder="(00) 00000-0000" autoComplete="off"/>
                <SelectField label="Tamanho do time" name="tamanho" options={teamSizes}/>
                <SelectField label="Interesse" name="interesse" options={interests}/>
            </div>
            <TextAreaField label="Conte um pouco da sua rotina" name="mensagem" placeholder="Quais desafios de DP e RH vocês têm hoje?"/>
            <Checkbox name="aceite" label="Concordo em ser contatado pela Gesint sobre esta solicitação."/>
            <Button type="submit" className="w-full sm:w-fit">
                Enviar mensagem  ↗
            </Button>
        </ShowcaseForm>
    );
}
