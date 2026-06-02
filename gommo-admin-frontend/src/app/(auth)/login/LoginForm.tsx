"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      toast.error("Usuário ou senha inválidos");
      return;
    }

    toast.success("Bem-vindo ao Gommo Admin");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <Input
        label="Usuário"
        type="text"
        autoComplete="username"
        spellCheck={false}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <Input
        label="Senha"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <Button type="submit" className="gommo-btn--block mt-1" loading={loading}>
        Entrar
      </Button>

      {process.env.NODE_ENV === "development" && (
        <p className="text-center text-[11px] text-base-content/40">
          Desenvolvimento: credenciais do seu arquivo .env
        </p>
      )}
    </form>
  );
}
