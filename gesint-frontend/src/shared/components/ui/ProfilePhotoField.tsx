import clsx from "clsx";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Modal } from "@/shared/components/ui/Modal";
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
    /** Código do colaborador exibido no lugar do rótulo da foto */
    collaboratorCode?: string | null;
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
    const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [crop, setCrop] = useState<ProfilePhotoCropState>(INITIAL_CROP);
    const [processing, setProcessing] = useState(false);
    const viewport = PROFILE_PHOTO_DISPLAY_PX;

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

    return (
        <Modal
            open
            onClose={onCancel}
            title="Recortar foto"
            subtitle="Ajuste zoom e posição. A área de recorte tem a mesma dimensão da prévia."
            size="sm"
            actions={[
                { title: "Cancelar", variant: "ghost", onClick: onCancel, disabled: processing },
                { title: "OK", onClick: () => void handleConfirm(), loading: processing, disabled: !image },
            ]}
        >
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
        </Modal>
    );
}

export function ProfilePhotoField({
    photoObjectId,
    pendingPreviewUrl,
    onCropComplete,
    onClear,
    displayName = "Colaborador",
    collaboratorCode,
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
        <div className={clsx("gesint-photo-card", disabled && "pointer-events-none opacity-60", className)}>
            <div className="gesint-photo-card__frame">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => inputRef.current?.click()}
                    className="gesint-photo-card__trigger group relative"
                    aria-label={hasPhoto ? "Alterar foto" : "Adicionar foto"}
                >
                    {pendingPreviewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={pendingPreviewUrl} alt={displayName} className="h-full w-full object-cover" />
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
                {hasPhoto ? (
                    <button
                        type="button"
                        className="gesint-photo-card__remove"
                        aria-label="Remover foto"
                        disabled={disabled}
                        onClick={onClear}
                    >
                        <Trash2 className="size-4" strokeWidth={2} />
                    </button>
                ) : null}
            </div>
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
                <p className="gesint-label mb-0 text-center tabular-nums">
                    Código: {collaboratorCode?.trim() ? collaboratorCode : "—"}
                </p>
                {pendingPreviewUrl ? (
                    <p className="text-center text-[11px] text-warning">Pendente — salve a admissão</p>
                ) : null}
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
