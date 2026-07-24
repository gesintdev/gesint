export { auth as proxy } from "@/auth";

export const config = {
    matcher: [
        "/((?!api|login|definir-senha|esqueci-senha|_next/static|_next/image|favicon.ico|brand/).*)",
    ],
};
