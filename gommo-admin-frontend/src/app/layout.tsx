import "./globals.css";

import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

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
export const metadata: Metadata = {
    title: "Gommo — Departamento Pessoal",
    description: "Sistema de gestão de RH e departamento pessoal",
    icons: {
        icon: "/brand/gommo-logo-icon.png",
        apple: "/brand/gommo-logo-icon.png",
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className={`${inter.variable} ${jakarta.variable} surface-page min-h-full antialiased`}>
                <ThemeInitScript />
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    );
}
