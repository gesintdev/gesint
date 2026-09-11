"use client";

import {CameraOff, Check, Clock3, Globe, Info, Loader2, ShieldCheck} from "lucide-react";
import {FormEvent, useEffect, useRef, useState} from "react";
import {toast} from "sonner";

import {
    createClientRequestId,
    formatLiveClock,
    formatLiveDate,
} from "@/modules/dp/attendance/lib/attendance-clock.util";
import {publicPontoService} from "@/modules/dp/attendance/services/public-ponto.service";
import {SystemLogo} from "@/shared/components/brand/SystemLogo";
import {Button} from "@/shared/components/ui/Button";
import {FormInput} from "@/shared/components/ui/FormInput";
import {AppException, ExceptionCapture} from "@/shared/exceptions";

const FEATURES = [
    {icon: Check, label: "Simples"},
    {icon: ShieldCheck, label: "Seguro"},
    {icon: Globe, label: "Sempre disponível"},
] as const;

type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "unavailable";

function isPermissionDeniedError(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;
    const name = "name" in error ? String(error.name) : "";
    return name === "NotAllowedError" || name === "PermissionDeniedError";
}

function isIgnorableCameraError(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;
    const name = "name" in error ? String(error.name) : "";
    return name === "AbortError" || name === "InvalidStateError";
}

function stopMediaStream(stream: MediaStream | null, video: HTMLVideoElement | null) {
    stream?.getTracks().forEach((track) => track.stop());
    if (video) {
        video.srcObject = null;
    }
}

async function capturePhotoFromVideo(video: HTMLVideoElement): Promise<File> {
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
        throw new AppException({
            code: "PUBLIC_PONTO_CAMERA",
            message: "Câmera ainda não está pronta. Aguarde um instante e tente novamente.",
            displayMessage: "Câmera ainda não está pronta. Aguarde um instante e tente novamente.",
            source: "client",
        });
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
        throw new AppException({
            code: "PUBLIC_PONTO_CAMERA",
            message: "Não foi possível capturar a imagem da câmera.",
            displayMessage: "Não foi possível capturar a imagem da câmera.",
            source: "client",
        });
    }
    context.drawImage(video, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) {
        throw new AppException({
            code: "PUBLIC_PONTO_CAMERA",
            message: "Falha ao gerar a foto do ponto.",
            displayMessage: "Falha ao gerar a foto do ponto.",
            source: "client",
        });
    }
    return new File([blob], `selfie-ponto-${Date.now()}.jpg`, {type: "image/jpeg"});
}

export function PontoLandingClient() {
    const year = new Date().getFullYear();
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const cameraRequestIdRef = useRef(0);
    const [now, setNow] = useState<Date | null>(null);
    const [employerCode, setEmployerCode] = useState("");
    const [collaboratorCode, setCollaboratorCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");

    useEffect(() => {
        setNow(new Date());
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        const requestId = ++cameraRequestIdRef.current;
        setCameraStatus("requesting");

        const startCamera = async () => {
            if (!navigator.mediaDevices?.getUserMedia) {
                if (cameraRequestIdRef.current === requestId) {
                    setCameraStatus("unavailable");
                }
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        facingMode: "user",
                        width: {ideal: 720},
                        height: {ideal: 720},
                    },
                });
                if (cameraRequestIdRef.current !== requestId) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                streamRef.current = stream;
                const video = videoRef.current;
                if (video) {
                    video.srcObject = stream;
                    try {
                        await video.play();
                    } catch (playError) {
                        if (isIgnorableCameraError(playError)) {
                            return;
                        }
                        throw playError;
                    }
                    if (cameraRequestIdRef.current === requestId) {
                        setCameraStatus("ready");
                    }
                }
            } catch (err) {
                if (cameraRequestIdRef.current !== requestId || isIgnorableCameraError(err)) {
                    return;
                }
                setCameraStatus(isPermissionDeniedError(err) ? "denied" : "unavailable");
            }
        };

        void startCamera();

        return () => {
            cameraRequestIdRef.current += 1;
            stopMediaStream(streamRef.current, videoRef.current);
            streamRef.current = null;
        };
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (cameraStatus === "denied") {
            setError("Permissão da câmera necessária. Autorize o acesso no navegador e recarregue a página.");
            return;
        }
        if (cameraStatus === "unavailable") {
            setError("Não foi possível acessar a câmera neste dispositivo.");
            return;
        }
        if (cameraStatus !== "ready" || !videoRef.current) {
            setError("Aguarde a câmera ficar pronta antes de registrar.");
            return;
        }

        setLoading(true);
        try {
            const photo = await capturePhotoFromVideo(videoRef.current);
            const result = await publicPontoService.clock(
                {
                    employerCode: employerCode.trim(),
                    collaboratorCode: collaboratorCode.trim(),
                    clientRequestId: createClientRequestId(),
                },
                photo,
            );
            toast.success(result.message || "Ponto registrado com sucesso.");
            setCollaboratorCode("");
        } catch (err) {
            const ex = ExceptionCapture.handle(err, {
                toast: false,
                fallbackMessage: "Não foi possível registrar o ponto.",
            });
            setError(ex.displayMessage);
        } finally {
            setLoading(false);
        }
    }

    const cameraOverlayMessage =
        cameraStatus === "requesting"
            ? "Aguardando permissão da câmera..."
            : cameraStatus === "denied"
                ? "Permissão da câmera necessária. Autorize o acesso no navegador."
                : cameraStatus === "unavailable"
                    ? "Não foi possível acessar a câmera neste dispositivo."
                    : null;

    const canRegister = cameraStatus === "ready" && !loading;

    return (
        <div className="ponto-landing">
            <div className="ponto-landing__glow ponto-landing__glow--tr" aria-hidden="true"/>
            <div className="ponto-landing__glow ponto-landing__glow--bl" aria-hidden="true"/>
            <div className="ponto-landing__glow ponto-landing__glow--center" aria-hidden="true"/>

            <header className="ponto-landing__header">
                <div className="flex items-center gap-3">
                    <SystemLogo size="2rem" title="Gesint"/>
                    <span className="ponto-landing__brand-dot" aria-hidden="true"/>
                    <span className="text-sm font-medium text-[color:var(--login-brand-ink)]/70">
                        Gestão Integrada
                    </span>
                </div>
            </header>

            <main className="ponto-landing__main">
                <section className="ponto-landing__intro">
                    <span className="ponto-landing__badge">
                        <Clock3 className="size-3.5" strokeWidth={2.25}/>
                        Registro de Ponto
                    </span>
                    <h1 className="ponto-landing__title">Registro de Ponto</h1>
                    <p className="ponto-landing__subtitle">
                        Acesse o sistema de registro de ponto para realizar o seu registro diário
                        com rapidez, segurança e conformidade.
                    </p>
                    <ul className="ponto-landing__features">
                        {FEATURES.map(({icon: Icon, label}) => (
                            <li key={label}>
                                <span className="ponto-landing__feature-icon">
                                    <Icon className="size-3.5" strokeWidth={2.5}/>
                                </span>
                                {label}
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="ponto-landing__card" aria-label="Formulário de registro de ponto">
                    <div className="ponto-landing__live">
                        <p className="ponto-landing__live-time">
                            {now ? formatLiveClock(now) : "--:--:--"}
                        </p>
                        <p className="ponto-landing__live-date">
                            {now ? formatLiveDate(now) : "\u00a0"}
                        </p>
                        <p className="ponto-landing__live-hint">Seu horário atual</p>
                    </div>

                    <div className="ponto-landing__camera" aria-label="Pré-visualização da câmera">
                        <video
                            ref={videoRef}
                            className="ponto-landing__camera-video"
                            playsInline
                            muted
                            autoPlay
                        />
                        {cameraStatus !== "ready" && cameraOverlayMessage ? (
                            <div className="ponto-landing__camera-overlay">
                                {cameraStatus === "requesting" ? (
                                    <Loader2 className="size-8 animate-spin text-base-content/35" strokeWidth={1.75}/>
                                ) : (
                                    <CameraOff className="size-8 text-base-content/35" strokeWidth={1.75}/>
                                )}
                                <p>{cameraOverlayMessage}</p>
                            </div>
                        ) : null}
                    </div>

                    <form className="ponto-landing__form" onSubmit={handleSubmit}>
                        <FormInput
                            label="Código do Empregador"
                            value={employerCode}
                            onChange={(e) => setEmployerCode(e.target.value)}
                            placeholder="Ex.: 123456789"
                            required
                            autoComplete="organization"
                            inputMode="numeric"
                        />
                        <FormInput
                            label="Código do Colaborador"
                            value={collaboratorCode}
                            onChange={(e) => setCollaboratorCode(e.target.value)}
                            placeholder="Código de acesso"
                            required
                            autoComplete="off"
                            inputMode="numeric"
                        />
                        {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
                        <Button type="submit" className="w-full" size="lg" loading={loading} disabled={!canRegister}>
                            Registrar Ponto
                        </Button>
                    </form>

                    <div className="ponto-landing__info">
                        <Info className="mt-0.5 size-4 shrink-0 text-info" strokeWidth={2.25}/>
                        <p>
                            É necessário autorizar o acesso à câmera para registrar o ponto com foto.
                        </p>
                    </div>
                </section>
            </main>

            <footer className="ponto-landing__footer">
                <div className="flex items-center gap-2">
                    <SystemLogo size="1.15rem" title="Gesint"/>
                    <span className="text-xs text-base-content/50">Gesint | Gestão Integrada</span>
                </div>
                <p className="text-xs text-base-content/40">© {year} Gesint Tecnologia</p>
            </footer>
        </div>
    );
}
