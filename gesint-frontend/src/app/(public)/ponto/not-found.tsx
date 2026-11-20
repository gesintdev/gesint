export default function PontoNotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-(--color-page) px-6">
            <div className="max-w-md text-center">
                <p className="text-sm font-semibold text-base-content/45">404</p>
                <h1 className="mt-2 text-xl font-semibold text-base-content">Empresa não encontrada</h1>
                <p className="mt-2 text-sm text-base-content/60">
                    Este endereço de ponto não corresponde a uma empresa cadastrada.
                </p>
            </div>
        </main>
    );
}
