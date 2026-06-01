/** Dimensão da área de exibição e do recorte (px). */
export const PROFILE_PHOTO_DISPLAY_PX = 200;

/** Tamanho máximo exportado após recorte (px). */
export const PROFILE_PHOTO_OUTPUT_MAX_PX = 512;

/** Qualidade JPEG (0–1) — equilíbrio entre peso e nitidez. */
export const PROFILE_PHOTO_JPEG_QUALITY = 0.82;

export type ProfilePhotoCropState = {
    scale: number;
    panX: number;
    panY: number;
};

export type ProfilePhotoCropArea = {
    x: number;
    y: number;
    width: number;
    height: number;
};

/** Escala base para cobrir o viewport quadrado (cover). */
export function baseCoverScale(
    naturalWidth: number,
    naturalHeight: number,
    viewportSize: number,
): number {
    return Math.max(viewportSize / naturalWidth, viewportSize / naturalHeight);
}

/** Calcula região de recorte em coordenadas naturais da imagem. */
export function computeCropArea(
    naturalWidth: number,
    naturalHeight: number,
    viewportSize: number,
    crop: ProfilePhotoCropState,
): ProfilePhotoCropArea {
    const baseScale = baseCoverScale(naturalWidth, naturalHeight, viewportSize);
    const displayScale = baseScale * crop.scale;
    const displayWidth = naturalWidth * displayScale;
    const displayHeight = naturalHeight * displayScale;

    const imageLeft = viewportSize / 2 - displayWidth / 2 + crop.panX;
    const imageTop = viewportSize / 2 - displayHeight / 2 + crop.panY;

    const sx = Math.max(0, (-imageLeft / displayWidth) * naturalWidth);
    const sy = Math.max(0, (-imageTop / displayHeight) * naturalHeight);
    const sw = Math.min(naturalWidth - sx, (viewportSize / displayWidth) * naturalWidth);
    const sh = Math.min(naturalHeight - sy, (viewportSize / displayHeight) * naturalHeight);
    const side = Math.min(sw, sh);

    return {
        x: sx + (sw - side) / 2,
        y: sy + (sh - side) / 2,
        width: side,
        height: side,
    };
}

/** Recorta, redimensiona e comprime a imagem para upload. */
export async function exportProfilePhotoBlob(
    image: HTMLImageElement,
    crop: ProfilePhotoCropState,
    viewportSize = PROFILE_PHOTO_DISPLAY_PX,
    outputMaxPx = PROFILE_PHOTO_OUTPUT_MAX_PX,
    quality = PROFILE_PHOTO_JPEG_QUALITY,
): Promise<Blob> {
    const area = computeCropArea(image.naturalWidth, image.naturalHeight, viewportSize, crop);
    const canvas = document.createElement("canvas");
    canvas.width = outputMaxPx;
    canvas.height = outputMaxPx;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Canvas não disponível");
    }
    ctx.drawImage(
        image,
        area.x,
        area.y,
        area.width,
        area.height,
        0,
        0,
        outputMaxPx,
        outputMaxPx,
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Falha ao gerar imagem"));
            },
            "image/jpeg",
            quality,
        );
    });
}

export function loadImageFromFile(file: File): Promise<{ image: HTMLImageElement; objectUrl: string }> {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => resolve({ image: img, objectUrl });
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Não foi possível carregar a imagem"));
        };
        img.src = objectUrl;
    });
}

export function loadImageFromSrc(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Não foi possível carregar a imagem"));
        img.src = src;
    });
}
