"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {CameraOff, Loader2, X} from "lucide-react";
import {useEffect, useRef, useState} from "react";
import {toast} from "sonner";

import {
    createClientRequestId,
    formatLiveClock,
    formatLiveDate,
    isJourneyComplete,
    nextPunchLabel,
} from "@/modules/dp/attendance/lib/attendance-clock.util";
import {attendancerecordService} from "@/modules/dp/attendance/services/attendance-record.service";
import {storageService} from "@/modules/storage/services/storage.service";
import {Button} from "@/shared/components/ui/Button";
import {AppException, ExceptionCapture} from "@/shared/exceptions";

type AttendanceClockModalProps = {
    open: boolean;
    onClose: () => void;
};

type GeoPosition = {
    latitude: number;
    longitude: number;
    accuracy?: number;
};

type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "unavailable";

function clockClientError(message: string): AppException {
    return new AppException({
        code: "ATTENDANCE_CLOCK",
        message,
        displayMessage: message,
        source: "client",
    });
}

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

async function readGeolocation(): Promise<GeoPosition> {
    if (!navigator.geolocation) {
        throw clockClientError("Geolocalização não disponível neste navegador.");
    }
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
            },
            () => reject(clockClientError("Não foi possível obter a localização. Autorize o acesso no navegador.")),
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 0},
        );
    });
}

async function capturePhotoFromVideo(video: HTMLVideoElement): Promise<File> {
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
        throw clockClientError("Câmera ainda não está pronta. Aguarde um instante e tente novamente.");
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
        throw clockClientError("Não foi possível capturar a imagem da câmera.");
    }
    context.drawImage(video, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) {
        throw clockClientError("Falha ao gerar a foto do ponto.");
    }
    return new File([blob], `selfie-ponto-${Date.now()}.jpg`, {type: "image/jpeg"});
}

export function AttendanceClockModal({open, onClose}: AttendanceClockModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const cameraRequestIdRef = useRef(0);
    const queryClient = useQueryClient();
    const [mounted, setMounted] = useState(false);
    const [now, setNow] = useState<Date | null>(null);
    const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const contextQuery = useQuery({
        queryKey: ["attendance", "mobile-context"],
        queryFn: () => attendancerecordService.getMobileContext(),
        enabled: open && mounted,
        staleTime: 30_000,
        retry: false,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog || !mounted) return;
        if (open && !dialog.open) {
            setSubmitError(null);
            setCameraStatus("requesting");
            dialog.showModal();
        }
        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open, mounted]);

    useEffect(() => {
        if (!open || !mounted) {
            setNow(null);
            return;
        }
        setNow(new Date());
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, [open, mounted]);

    useEffect(() => {
        if (!open) {
            setCameraStatus("idle");
            return;
        }

        const requestId = ++cameraRequestIdRef.current;
        setCameraStatus("requesting");

        const stopStream = () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };

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
                    await video.play();
                    if (cameraRequestIdRef.current === requestId) {
                        setCameraStatus("ready");
                    }
                }
            } catch (error) {
                if (cameraRequestIdRef.current !== requestId || isIgnorableCameraError(error)) {
                    return;
                }
                setCameraStatus(isPermissionDeniedError(error) ? "denied" : "unavailable");
            }
        };

        void startCamera();

        return () => {
            cameraRequestIdRef.current += 1;
            stopStream();
        };
    }, [open]);

    const clockMutation = useMutation({
        mutationFn: async () => {
            const context = contextQuery.data;
            if (!context) {
                throw clockClientError("Contexto de ponto indisponível.");
            }
            if (!context.collaboratorId) {
                throw clockClientError("Seu usuário não está vinculado a um colaborador.");
            }
            if (isJourneyComplete(context.todayRecord)) {
                throw clockClientError("A jornada de hoje já está concluída.");
            }

            let photo:
                | {
                      objectId: string;
                      fileName: string;
                      documentType: string;
                  }
                | undefined;

            if (context.requirePhoto) {
                const video = videoRef.current;
                if (!video || cameraStatus !== "ready") {
                    throw clockClientError("Aguarde a câmera ficar pronta antes de registrar.");
                }
                const file = await capturePhotoFromVideo(video);
                const uploaded = await storageService.upload(file);
                photo = {
                    objectId: uploaded.id,
                    fileName: file.name,
                    documentType: "CLOCK_SELFIE",
                };
            }

            let geo: GeoPosition | undefined;
            if (context.requireLocation) {
                geo = await readGeolocation();
            }

            return attendancerecordService.clock({
                capturedAt: new Date().toISOString(),
                clientRequestId: createClientRequestId(),
                photo,
                latitude: geo?.latitude,
                longitude: geo?.longitude,
                locationAccuracyMeters: geo?.accuracy,
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["attendance", "mobile-context"]});
            toast.success("Ponto registrado");
            onClose();
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, {
                toast: false,
                fallbackMessage: "Não foi possível registrar o ponto.",
            });
            setSubmitError(
                err instanceof AppException
                    ? err.displayMessage
                    : "Não foi possível registrar o ponto.",
            );
        },
    });

    const todayRecord = contextQuery.data?.todayRecord;
    const journeyDone = isJourneyComplete(todayRecord);
    const punchLabel = nextPunchLabel(todayRecord);
    const cameraReady = cameraStatus === "ready";
    const canRegister =
        Boolean(contextQuery.data?.collaboratorId) &&
        !journeyDone &&
        !contextQuery.isLoading &&
        !contextQuery.isError &&
        (!contextQuery.data?.requirePhoto || cameraReady);

    const cameraOverlayMessage =
        cameraStatus === "requesting"
            ? "Aguardando permissão da câmera..."
            : cameraStatus === "denied"
              ? "Permissão da câmera necessária. Autorize o acesso no navegador."
              : cameraStatus === "unavailable"
                ? "Não foi possível acessar a câmera neste dispositivo."
                : null;

    if (!mounted) return null;

    return (
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box max-w-md p-0 overflow-hidden">
                <div className="flex items-center justify-between border-b border-base-content/8 px-4 py-3">
                    <div>
                        <h3 className="text-base font-semibold">Registro de ponto</h3>
                        <p className="text-xs text-base-content/55">
                            {contextQuery.data?.collaboratorName ?? "Colaborador logado"}
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Fechar"
                        className="gommo-btn gommo-btn--ghost gommo-btn--icon-only text-base-content/50"
                        onClick={onClose}
                        disabled={clockMutation.isPending}
                    >
                        <X className="size-4" strokeWidth={2} />
                    </button>
                </div>

                <div className="grid gap-4 px-4 py-4">
                    <div className="text-center">
                        <p className="text-xs font-medium uppercase tracking-wide text-base-content/45">
                            {now ? formatLiveDate(now) : "\u00a0"}
                        </p>
                        <p className="mt-1 font-mono text-4xl font-semibold tabular-nums tracking-tight text-base-content">
                            {now ? formatLiveClock(now) : "--:--:--"}
                        </p>
                        <p className="mt-2 text-sm font-medium text-primary">
                            {contextQuery.isLoading
                                ? "Carregando..."
                                : journeyDone
                                  ? "Jornada concluída"
                                  : punchLabel}
                        </p>
                    </div>

                    <div className="relative aspect-square overflow-hidden rounded-2xl border border-base-content/10 bg-base-300">
                        <video
                            ref={videoRef}
                            className="size-full object-cover scale-x-[-1]"
                            playsInline
                            muted
                            autoPlay
                        />
                        {cameraStatus !== "ready" && cameraOverlayMessage ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-base-300 px-6 text-center">
                                {cameraStatus === "requesting" ? (
                                    <Loader2 className="size-8 animate-spin text-base-content/35" strokeWidth={1.75} />
                                ) : (
                                    <CameraOff className="size-8 text-base-content/35" strokeWidth={1.75} />
                                )}
                                <p className="text-sm text-base-content/65">{cameraOverlayMessage}</p>
                            </div>
                        ) : null}
                    </div>

                    {contextQuery.isError ? (
                        <p className="text-sm font-medium text-error">
                            {contextQuery.error instanceof AppException
                                ? contextQuery.error.displayMessage
                                : "Não foi possível carregar o contexto de ponto."}
                        </p>
                    ) : null}

                    {submitError ? <p className="text-sm font-medium text-error">{submitError}</p> : null}

                    <div className="flex flex-wrap gap-2 text-[11px] text-base-content/50">
                        <span className="rounded-full bg-base-200 px-2.5 py-1">
                            Foto {contextQuery.data?.requirePhoto ? "obrigatória" : "dispensada"}
                        </span>
                        <span className="rounded-full bg-base-200 px-2.5 py-1">
                            Localização {contextQuery.data?.requireLocation ? "obrigatória" : "dispensada"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-base-content/8 px-4 py-3">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={clockMutation.isPending}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            setSubmitError(null);
                            clockMutation.mutate();
                        }}
                        loading={clockMutation.isPending}
                        disabled={!canRegister || clockMutation.isPending}
                    >
                        Registrar
                    </Button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit" aria-label="Fechar">
                    fechar
                </button>
            </form>
        </dialog>
    );
}
