/** Imagem pública da página de carreiras (proxy Next → API com o tenant do host). */
export function careersAssetUrl(objectId?: string | null): string | null {
    const id = objectId?.trim();
    if (!id) return null;
    return `/careers-assets/${encodeURIComponent(id)}`;
}
