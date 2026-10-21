import clsx from "clsx";
import { Camera, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/Button";
import { ProfileAvatar } from "@/shared/components/ui/ProfileAvatar";
import { ExceptionCapture } from "@/shared/exceptions";
import {
    baseCoverScale,
    exportProfilePhotoBlob,
    loadImageFromFile,
    PROFILE_PHOTO_DISPLAY_PX,
    type ProfilePhotoCropState,
} from "@/shared/lib/image/profile-photo.util";

type ProfilePhotoFieldProps = {
    /** ID já persistido no storage/admissão */
    photoObjectId?: string;
    /** Prévia local de foto recortada ainda não salva */
    pendingPreviewUrl?: string | null;
    onCropComplete: (blob: Blob) => void;
    onClear: () => void;
    displayName?: string;
    disabled?: boolean;
    className?: string;
};

const INITIAL_CROP: ProfilePhotoCropState = { scale: 1, panX: 0, panY: 0 };

function ProfilePhotoCropModal({
    file,
    displayName,
    onConfirm,
    onCancel,
}: {
    file: File;
    displayName: string;
    onConfirm: (blob: Blob) => void;
    onCancel: () => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
    const [mounted, setMounted] = useState(false);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [crop, setCrop] = useState<ProfilePhotoCropState>(INITIAL_CROP);
    const [processing, setProcessing] = useState(false);
    const viewport = PROFILE_PHOTO_DISPLAY_PX;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        dialogRef.current?.showModal();
    }, [mounted]);

    useEffect(() => {
        let cancelled = false;
        loadImageFromFile(file)
            .then(({ image: img, objectUrl }) => {
                if (cancelled) {
                    URL.revokeObjectURL(objectUrl);
                    return;
                }
                setImage(img);
                setPreviewUrl(objectUrl);
            })
            .catch(() => toast.error("Não foi possível carregar a imagem"));
        return () => {
            cancelled = true;
        };
    }, [file]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const displayScale = image ? baseCoverScale(image.naturalWidth, image.naturalHeight, viewport) * crop.scale : 1;
    const displayWidth = image ? image.naturalWidth * displayScale : viewport;
    const displayHeight = image ? image.naturalHeight * displayScale : viewport;
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!image) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        dragRef.current = { x: e.clientX, y: e.clientY, panX: crop.panX, panY: crop.panY };
    };
    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;
        const dx = e.clientX - dragRef.current.x;
        const dy = e.clientY - dragRef.current.y;
        setCrop((prev) => ({
            ...prev,
            panX: dragRef.current!.panX + dx,
            panY: dragRef.current!.panY + dy,
        }));
    };
    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        dragRef.current = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
    };
    const handleConfirm = async () => {
        if (!image) return;
        setProcessing(true);
        try {
            const blob = await exportProfilePhotoBlob(image, crop);
            onConfirm(blob);
        } catch (err: unknown) {
            ExceptionCapture.handle(err, { fallbackMessage: "Falha ao recortar a foto" });
        } finally {
            setProcessing(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={onCancel}
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
        >
            <div className="modal-box max-w-md">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-base font-semibold text-base-content">Recortar foto</h3>
                        <p className="mt-0.5 text-xs text-base-content/50">
                            Ajuste zoom e posição. A área de recorte tem a mesma dimensão da prévia.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-circle"
                        aria-label="Fechar"
                        onClick={onCancel}
                    >
                        <X className="size-4" />
                    </button>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="relative touch-none overflow-hidden rounded-2xl bg-base-300/40 ring-1 ring-base-content/10"
                        style={{ width: viewport, height: viewport }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    >
                        {image && previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={previewUrl}
                                alt={displayName}
                                draggable={false}
                                className="pointer-events-none absolute max-w-none select-none"
                                style={{
                                    width: displayWidth,
                                    height: displayHeight,
                                    left: viewport / 2 - displayWidth / 2 + crop.panX,
                                    top: viewport / 2 - displayHeight / 2 + crop.panY,
                                }}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="size-6 animate-spin text-base-content/40" />
                            </div>
                        )}
                    </div>
                    <label className="flex w-full max-w-xs items-center gap-3 text-xs text-base-content/60">
                        <span className="shrink-0">Zoom</span>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.01}
                            value={crop.scale}
                            onChange={(e) => setCrop((prev) => ({ ...prev, scale: Number(e.target.value) }))}
                            className="range range-primary range-xs flex-1"
                        />
                    </label>
                </div>
                <div className="modal-action">
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button type="button" onClick={handleConfirm} loading={processing} disabled={!image}>
                        OK
                    </Button>
                </div>
            </div>
            <button type="button" className="modal-backdrop" aria-label="Fechar modal" onClick={onCancel} />
        </dialog>,
        document.body,
    );
}

export function ProfilePhotoField({
    photoObjectId,
    pendingPreviewUrl,
    onCropComplete,
    onClear,
    displayName = "Colaborador",
    disabled = false,
    className,
}: ProfilePhotoFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const handleFileSelect = useCallback((file: File | undefined) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Selecione um arquivo de imagem");
            return;
        }
        setPendingFile(file);
    }, []);
    const handleCropConfirm = (blob: Blob) => {
        setPendingFile(null);
        onCropComplete(blob);
        toast.success("Foto pronta — clique em Salvar para gravar");
    };
    const hasPhoto = Boolean(pendingPreviewUrl || photoObjectId);

    return (
        <div className={clsx("flex shrink-0 flex-col items-center gap-2", className)}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className={clsx(
                    "group relative overflow-hidden rounded-2xl ring-1 ring-base-content/10 transition-shadow",
                    "hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    disabled && "pointer-events-none opacity-60",
                )}
                style={{ width: PROFILE_PHOTO_DISPLAY_PX, height: PROFILE_PHOTO_DISPLAY_PX }}
                aria-label={hasPhoto ? "Alterar foto" : "Adicionar foto"}
            >
                {pendingPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pendingPreviewUrl} alt={displayName} className="h-full w-full rounded-2xl object-cover" />
                ) : (
                    <ProfileAvatar
                        name={displayName}
                        photoObjectId={photoObjectId}
                        size="xl"
                        shape="rounded"
                        className="h-full w-full"
                    />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-base-content/0 transition-colors group-hover:bg-base-content/25">
                    <Camera className="size-7 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100" />
                </span>
            </button>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                    handleFileSelect(e.target.files?.[0]);
                    e.target.value = "";
                }}
            />
            <div className="flex flex-col items-center gap-1">
                <p className="text-center text-xs font-medium text-base-content/70">Foto do colaborador</p>
                {pendingPreviewUrl ? (
                    <p className="text-center text-[11px] text-warning">Pendente — salve a admissão</p>
                ) : null}
                {hasPhoto ? (
                    <button
                        type="button"
                        className="text-[11px] text-error/80 hover:text-error"
                        onClick={onClear}
                        disabled={disabled}
                    >
                        Remover foto
                    </button>
                ) : (
                    <p className="text-center text-[11px] text-base-content/40">Clique para enviar</p>
                )}
            </div>
            {pendingFile && (
                <ProfilePhotoCropModal
                    file={pendingFile}
                    displayName={displayName}
                    onConfirm={handleCropConfirm}
                    onCancel={() => setPendingFile(null)}
                />
            )}
        </div>
    );
}
