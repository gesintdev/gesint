export function userInitials(name?: string | null): string {
    if (!name) return "U";
    return name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();
}
