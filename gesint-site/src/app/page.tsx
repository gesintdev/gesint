import {ContactCta} from "@/components/home/ContactCta";
import {ContextStrip} from "@/components/home/ContextStrip";
import {Faq} from "@/components/home/Faq";
import {Hero} from "@/components/home/Hero";
import {HowItWorks} from "@/components/home/HowItWorks";
import {OperationVisibility} from "@/components/home/OperationVisibility";
import {SiteFooter} from "@/components/home/SiteFooter";
import {SiteHeader} from "@/components/home/SiteHeader";
import {Solutions} from "@/components/home/Solutions";

export default function Home() {
    return (
        <>
            <SiteHeader/>
            <main>
                <Hero/>
                <ContextStrip/>
                <Solutions/>
                <OperationVisibility/>
                <HowItWorks/>
                <Faq/>
                <ContactCta/>
            </main>
            <SiteFooter/>
        </>
    );
}
