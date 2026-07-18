import "./globals.css";

import type { Metadata } from "next";
import { Inter, Outfit, Plus_Jakarta_Sans } from "next/font/google";

import { auth } from "@/auth";
import { AppProviders } from "@/shared/components/providers/AppProviders";
import { ThemeInitScript } from "@/shared/components/providers/ThemeInitScript";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
    weight: ["400", "500", "600", "700"],
});
const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-jakarta",
    display: "swap",
    weight: ["400", "500", "600", "700"],
});
const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    display: "swap",
    weight: ["500", "600", "700"],
});
export const metadata: Metadata = {
    title: "Gommo — Departamento Pessoal",
    description: "Sistema de gestão de RH e departamento pessoal",
    icons: {
        icon: "/brand/gommo-logo-favicon-blue.svg",
        apple: "/brand/gommo-logo-favicon-blue.svg",
    },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const session = await auth();

    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className={`${inter.variable} ${jakarta.variable} ${outfit.variable} surface-page min-h-full antialiased`}>
                <ThemeInitScript />
                <AppProviders session={session}>{children}</AppProviders>
            </body>
        </html>
    );
}
