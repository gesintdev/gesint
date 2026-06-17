import fs from "node:fs";
import path from "node:path";

const target = path.join(
    "gommo-frontend",
    "src",
    "modules",
    "person",
    "leave",
    "config",
    "leave-vacation.route-labels.ts",
);

const content = `/** Labels da rota RH /leave/vacation - fonte unica (UTF-8). */
export const LEAVE_VACATION_CRUD_LABELS = {
    routeId: "leave-vacation",
    href: "/leave/vacation",
    routeLabel: "F\u00e9rias",
    tabShortLabel: "F\u00e9rias",
    listToolbar: "Solicita\u00e7\u00f5es enviadas ao DP e f\u00e9rias j\u00e1 concedidas.",
    formTabLabel: "Solicita\u00e7\u00e3o de f\u00e9rias",
    listToFormLabel: "Nova solicita\u00e7\u00e3o de f\u00e9rias",
    eligibleTabLabel: "Aptos a f\u00e9rias",
    eligibleEmptyMessage: "Nenhum colaborador apto a solicitar f\u00e9rias no momento.",
    reviewReasonHint: "O motivo ser\u00e1 exibido ao RH na solicita\u00e7\u00e3o de f\u00e9rias.",
    columnAdmission: "Admiss\u00e3o",
    columnPeriod: "Per\u00edodo",
} as const;
`;

fs.writeFileSync(target, content, "utf8");

const saved = fs.readFileSync(target, "utf8");
const label = saved.match(/listToFormLabel: "([^"]+)"/)?.[1];
console.log("written:", label);
console.log("hasReplacement:", saved.includes("\uFFFD"));
console.log("hasLiteralBackslashU:", /\\u00/.test(saved));
