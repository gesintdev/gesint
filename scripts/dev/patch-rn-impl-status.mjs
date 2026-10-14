import fs from "node:fs";

const path = "docs/modulos/permissoes/gesint-telas-regras-de-negocio.html";
let html = fs.readFileSync(path, "utf8");

const notes = {
    t1: `<div class="impl-bar parcial"><span class="tag t-parcial">PARCIAL</span><span>Tela: <a href="/settings/users"><code>/settings/users</code></a> (+ abrangência em <code>/settings/atuacoes</code>) · perm: <code>user:read</code> / <code>actingprofile:*</code> · busca global: menu · gap: escopo no vínculo user×perfil (hoje em ActingProfile)</span></div>`,
    t2: `<div class="impl-bar parcial"><span class="tag t-parcial">PARCIAL</span><span>Tela: <a href="/settings/profiles"><code>/settings/profiles</code></a> · perm: <code>role:read|write</code> + <code>*:sensitive|financial|export</code> · busca global: menu · gap: justificativa sensível ainda não persistida na trilha</span></div>`,
    t3: `<div class="impl-bar"><span class="tag t-impl">IMPLEMENTADO</span><span>Tela: <a href="/leave/absence"><code>/leave/absence</code></a> · perm: <code>leave:read</code> + <code>leave:sensitive</code> (CID) · busca global: menu · mobile: form responsivo</span></div>`,
    t4: `<div class="impl-bar"><span class="tag t-impl">IMPLEMENTADO</span><span>Componente: <code>EntityAttachments</code> · config: <a href="/settings/document-types"><code>/settings/document-types</code></a> · guard BE <code>StorageAttachmentAccessGuard</code> · busca global: tipos de documento (menu)</span></div>`,
    t5: `<div class="impl-bar"><span class="tag t-impl">IMPLEMENTADO</span><span>Tela: <a href="/settings/audit-trail"><code>/settings/audit-trail</code></a> · perm: <code>audit:read</code> · busca global: menu · grid padrão com scroll vertical</span></div>`,
    t6: `<div class="impl-bar"><span class="tag t-impl">IMPLEMENTADO</span><span>Tela: <a href="/organization/job-positions"><code>/organization/job-positions</code></a> · perm: <code>jobposition:read|write</code> · busca global: menu + entidade Cargos · catálogo PDI em <code>/settings/pdi/competencies</code></span></div>`,
    t7: `<div class="impl-bar"><span class="tag t-impl">IMPLEMENTADO</span><span>Tela: <a href="/job-requisition"><code>/job-requisition</code></a> · perm: <code>jobrequisition:read|write</code> + aprovações · busca global: menu · gera vaga ao aprovar</span></div>`,
    t8: `<div class="impl-bar parcial"><span class="tag t-parcial">PARCIAL</span><span>Tela: <a href="/job-vacancy"><code>/job-vacancy</code></a> · perm: <code>jobvacancy:read|write</code> · busca global: menu · gaps: Responsáveis, cargo obrigatório, Google/WhatsApp, afirmativa/PCD</span></div>`,
    t9: `<div class="impl-bar"><span class="tag t-impl">IMPLEMENTADO</span><span>Tela: <a href="/settings/careers-page"><code>/settings/careers-page</code></a> · pública: <code>/careers</code> · perm: <code>careerspage:read|write</code> · busca global: menu · gap: domínio próprio (etapa 2)</span></div>`,
    t10: `<div class="impl-bar"><span class="tag t-impl">IMPLEMENTADO</span><span>Telas: <code>/careers</code> + <code>/careers/[slug]</code> · pública (sem RBAC) · SEG-04 consentimento versionado · produto: pós-envio usa conta do portal (não magic link)</span></div>`,
    t11: `<div class="impl-bar"><span class="tag t-impl">IMPLEMENTADO</span><span>Tela: <a href="/job-vacancy"><code>/job-vacancy</code></a> aba Candidatos · perm: <code>jobvacancyapplication:*</code> · coluna sistema Encerrados · IA “apoio” · badge SLA no card · busca global: menu Vagas</span></div>`,
    t12: `<div class="impl-bar parcial"><span class="tag t-parcial">PARCIAL</span><span>Embutido em <code>/job-vacancy</code> (modal detalhe, colunas interview) · perm: <code>jobvacancyapplication:read|write</code> · gaps: recomendação, guia RN-10, RN-51</span></div>`,
    t13: `<div class="impl-bar parcial"><span class="tag t-parcial">PARCIAL</span><span>Modal proposta em <code>/job-vacancy</code> → <code>/collaborator/admission</code> · perm: <code>jobvacancyapplication:write</code> / <code>admission:write</code> · gaps: pré-admissão self-serve, ASO automático, aceite portal</span></div>`,
    t14: `<div class="impl-bar"><span class="tag t-impl">IMPLEMENTADO</span><span>Telas: <a href="/careers/portal"><code>/careers/portal</code></a> (+ login/register) · auth: senha + Google (D8; não magic link) · mobile-first · fora da busca global (rota pública)</span></div>`,
    t15: `<div class="impl-bar"><span class="tag t-impl">IMPLEMENTADO</span><span>Tela: <a href="/offboarding"><code>/offboarding</code></a> · perm: <code>offboarding:*</code> · busca global: menu · gap documentado: verbas/TRCT (RN-03 §7)</span></div>`,
    t16: `<div class="impl-bar"><span class="tag t-impl">IMPLEMENTADO</span><span>Tela: <a href="/experience"><code>/experience</code></a> · perm: <code>experience:read|write|decide</code> · busca global: menu · scheduler 45/90 OK</span></div>`,
};

for (const [id, note] of Object.entries(notes)) {
    const re = new RegExp(
        `(<section class="screen" id="${id}">)\\s*(?:<div class="impl-bar[\\s\\S]*?</div>\\s*)?`,
    );
    if (!re.test(html)) {
        console.error("missing section", id);
        process.exit(1);
    }
    html = html.replace(re, `$1\n${note}\n`);
}

const tocMap = {
    t1: "PARCIAL",
    t2: "PARCIAL",
    t3: "OK",
    t4: "OK",
    t5: "OK",
    t6: "OK",
    t7: "OK",
    t8: "PARCIAL",
    t9: "OK",
    t10: "OK",
    t11: "OK",
    t12: "PARCIAL",
    t13: "PARCIAL",
    t14: "OK",
    t15: "OK",
    t16: "OK",
};

for (const [id, label] of Object.entries(tocMap)) {
    const cls = label === "OK" ? "t-impl" : "t-parcial";
    const liRe = new RegExp(
        `(<li><a href="#${id}">[^<]+</a>[^\\n]*?)(?:\\s*<span class="tag t-(?:impl|parcial)"[^>]*>[^<]*</span>)?(</li>)`,
    );
    html = html.replace(liRe, `$1 <span class="tag ${cls}" style="font-size:9px">${label}</span>$2`);
}

fs.writeFileSync(path, html);
console.log("patched", Object.keys(notes).length, "sections");
