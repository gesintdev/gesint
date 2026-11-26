import type {Metadata} from "next";

import {NumberedList} from "@/components/NumberedList";
import {Enter, Reveal} from "@/components/motion";
import {ContactForm} from "@/components/pages/ContactForm";
import {PageHeading} from "@/components/pages/PageHeading";
import {Container, Divider} from "@/components/ui";

export const metadata: Metadata = {
    title: "Fale com a Gesint",
    description: "Conte como é a rotina de DP e RH da sua empresa e conheça a Gesint.",
};

const nextSteps = [
    {title: "A gente lê com atenção", description: "Sua mensagem chega para quem entende de DP e RH."},
    {title: "Marcamos uma conversa", description: "Entendemos o seu cenário, sem roteiro engessado."},
    {title: "Você vê a Gesint na prática", description: "Uma demonstração pensada para a rotina da sua empresa."},
];

export default function ContactPage() {
    return (
        <Container>
            <div className="grid gap-12 pt-10 pb-16 md:pt-[50px] md:pb-[90px] lg:grid-cols-[minmax(0,500fr)_minmax(0,744fr)] lg:gap-5">
                <div className="lg:pr-10">
                    <PageHeading
                        eyebrow="FALE COM A GESINT"
                        lines={["Vamos conversar", "sobre a sua rotina."]}
                        description="Conte como sua empresa trabalha hoje. A gente mostra como a Gesint pode ajudar."
                    />
                    <Enter delay={0.45}>
                        <Divider className="mt-10"/>
                        <p className="mt-6 text-[12px] font-medium text-muted">O QUE ACONTECE DEPOIS</p>
                        <NumberedList items={nextSteps} className="mt-5"/>
                    </Enter>
                </div>

                <Reveal delay={0.2} className="rounded-md bg-white px-5 pt-6 pb-8 md:px-8 md:pt-[28px] md:pb-10">
                    <p className="text-[22px] font-light text-ink md:text-[24px]">Conte pra gente</p>
                    <p className="mt-1.5 text-[13px] text-muted">Leva menos de dois minutos.</p>
                    <Divider className="mt-[25px] mb-7"/>
                    <ContactForm/>
                </Reveal>
            </div>
        </Container>
    );
}
