import Link from "next/link";

export default function NotFound() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                background: "var(--ga-bg)",
            }}
        >
            <div style={{ textAlign: "center", maxWidth: 360 }}>
                <div style={{ fontSize: 48, fontWeight: 700, color: "var(--ga-text)", letterSpacing: "-0.04em" }}>
                    404
                </div>
                <p style={{ marginTop: 8, fontSize: 14, color: "var(--ga-text-muted)", lineHeight: 1.5 }}>
                    Página não encontrada.
                </p>
                <Link
                    href="/clients/list"
                    style={{
                        display: "inline-block",
                        marginTop: 20,
                        fontSize: 13,
                        color: "var(--ga-primary)",
                        textDecoration: "none",
                        fontWeight: 500,
                    }}
                >
                    Voltar ao Admin
                </Link>
            </div>
        </div>
    );
}
