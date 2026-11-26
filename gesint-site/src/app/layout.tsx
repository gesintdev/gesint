import type {Metadata} from "next";
import {Inter, Outfit} from "next/font/google";
import {GDustBackground} from "@/components/GDustBackground";
import {MotionProvider} from "@/components/motion";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
    weight: ["500"],
});

export const metadata: Metadata = {
    title: "Gesint — Gestão de DP e RH, com mais clareza",
    description:
        "Conecte processos, organize informações e dê ao seu time a tranquilidade de cuidar do que realmente importa.",
};

export default function RootLayout({children}: LayoutProps<"/">) {
    return (
        <html
            lang="pt-BR"
            className={`${inter.variable} ${outfit.variable} h-full antialiased`}
        >
        <body className="min-h-full flex flex-col">
        <GDustBackground/>
        <MotionProvider>{children}</MotionProvider>
        </body>
        </html>
    );
}
