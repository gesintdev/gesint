import {AdmissionFlow} from "@/components/home/AdmissionFlow";
import {Assistant} from "@/components/home/Assistant";
import {Audiences} from "@/components/home/Audiences";
import {ContactCta} from "@/components/home/ContactCta";
import {ContextStrip} from "@/components/home/ContextStrip";
import {Faq} from "@/components/home/Faq";
import {Features} from "@/components/home/Features";
import {Hero} from "@/components/home/Hero";
import {HowItWorks} from "@/components/home/HowItWorks";
import {OperationVisibility} from "@/components/home/OperationVisibility";
import {Security} from "@/components/home/Security";
import {Solutions} from "@/components/home/Solutions";

export default function Home() {
    return (
        <>
            <Hero/>
            <ContextStrip/>
            <Solutions/>
            <OperationVisibility/>
            <AdmissionFlow/>
            <Features/>
            <Security/>
            <Assistant/>
            <Audiences/>
            <HowItWorks/>
            <Faq/>
            <ContactCta/>
        </>
    );
}
