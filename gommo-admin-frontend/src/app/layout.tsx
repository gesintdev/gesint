import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AppProviders } from "@/shared/components/providers/AppProviders";
import { ThemeInitScript } from "@/shared/components/providers/ThemeInitScript";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "Gommo Admin",
    description: "Sistema administrativo Gommo",
    icons: {
        icon: "/brand/gommo-admin-logo-favicon-blue.svg",
        apple: "/brand/gommo-admin-logo-favicon-blue.svg",
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className={`${inter.variable} min-h-full antialiased`}>
                <ThemeInitScript />
                <AppProviders>{children}</AppProviders>
            </body>
        </html>
    );
}
