import type { NextRequest } from "next/server";

import { handlers } from "@/auth";
import { runWithSessionWrite } from "@/auth/session-write-context";

/**
 * Só aqui (e nas Server Actions do Auth.js) o `Set-Cookie` da rotação chega ao browser.
 * O jwt callback usa esse marcador para não rotacionar o refresh token em render RSC.
 */
export const runtime = "nodejs";

export function GET(request: NextRequest) {
    return runWithSessionWrite(() => handlers.GET(request));
}

export function POST(request: NextRequest) {
    return runWithSessionWrite(() => handlers.POST(request));
}
