"use client";

import type {Candidate, CandidateExperience} from "@/modules/rh/person/candidate/dto/candidate.dto";
import {EntityAttachments} from "@/shared/components/storage/EntityAttachments";
import {formatCellValue, formatCpf, formatPhone} from "@/shared/lib/table/format-cell-value";
import {TableDataType} from "@/shared/types/table.types";

function InfoItem({
                      label,
                      value,
                      className,
                  }: {
    label: string;
    value: string;
    className?: string;
}) {
    return (
        <div className={className ?? "text-[9pt] min-w-0 flex items-center gap-2"}>
            <p className="text-base-content/45">{`${label}:`}</p>
            <p className="font-normal text-base-content [font-variation-settings:'wght'_400]">
                {value || "—"}
            </p>
        </div>
    );
}

function InfoLink({
                      label,
                      href,
                      className,
                  }: {
    label: string;
    href?: string | null;
    className?: string;
}) {
    const trimmed = href?.trim();
    return (
        <div className={className ?? "text-[9pt] min-w-0 flex items-center gap-2"}>

            {/*<div className={className ?? "text-[9pt] min-w-0 flex items-center gap-2"}>*/}
            {/*    <p className="text-base-content/45">{`${label}:`}</p>*/}
            {/*    <p className="font-normal text-base-content [font-variation-settings:'wght'_400]">*/}
            {/*        {value || "—"}*/}
            {/*    </p>*/}
            {/*</div>*/}


            <p className="text-xs text-base-content/45">{`${label}:`}</p>
            {trimmed ? (
                <a
                    href={trimmed}
                    target="_blank"
                    rel="noreferrer"
                    className="tex-blue-500 block truncate font-normal text-primary [font-variation-settings:'wght'_400] hover:underline"
                >
                    {trimmed}
                </a>
            ) : (
                <p className="font-normal text-base-content [font-variation-settings:'wght'_400]">
                    —
                </p>
            )}
        </div>
    );
}

function formatExperiencePeriod(experience: CandidateExperience): string {
    const start = formatCellValue(experience.startDate, TableDataType.DATE);
    if (experience.currentJob) {
        return `${start} — atual`;
    }
    const end = experience.endDate ? formatCellValue(experience.endDate, TableDataType.DATE) : "—";
    return `${start} — ${end}`;
}

type CandidateProfileViewProps = {
    candidate: Candidate;
};

export function CandidateProfileView({candidate}: CandidateProfileViewProps) {
    const location = [candidate.city?.trim(), candidate.stateCode?.trim()].filter(Boolean).join(" / ");
    const experiences = candidate.experiences ?? [];

    return (
        <div className="grid gap-6">
            <section className="grid gap-4">
                <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                    <InfoItem label="Código" value={candidate.code != null ? String(candidate.code) : "—"}/>
                    <InfoItem
                        label="Status"
                        value={formatCellValue(candidate.status, TableDataType.BADGE)}
                    />
                    <InfoItem label="Nome completo" value={candidate.fullName ?? "—"}/>
                    <InfoItem label="CPF" value={candidate.cpf ? formatCpf(candidate.cpf) : "—"}/>
                    <InfoItem label="E-mail" value={candidate.email ?? "—"}/>
                    <InfoItem
                        label="Telefone"
                        value={candidate.phone ? formatPhone(candidate.phone) : "—"}
                    />
                    <InfoItem
                        label="Data de nascimento"
                        value={formatCellValue(candidate.birthDate, TableDataType.DATE)}
                    />
                    <InfoItem label="Cidade / UF" value={location || "—"}/>
                    <InfoLink label="LinkedIn" href={candidate.linkedinUrl} className="min-w-0 sm:col-span-2 flex items-center gap-2"/>
                    <InfoLink
                        label="Portfólio / GitHub"
                        href={candidate.portfolioUrl}
                        className="min-w-0 sm:col-span-2 flex items-center gap-2"
                    />
                    <InfoItem
                        label="Criado em"
                        value={formatCellValue(candidate.createdAt, TableDataType.DATETIME)}
                    />
                    <InfoItem
                        label="Atualizado em"
                        value={formatCellValue(candidate.updatedAt, TableDataType.DATETIME)}
                    />
                </div>
            </section>

            <section className="grid gap-3">
                <div>
                    <h4 className="text-sm font-semibold text-base-content">Experiência profissional</h4>
                    <div className="mt-2 border-t border-base-content/10"/>
                </div>
                {experiences.length === 0 ? (
                    <p className="text-xs text-base-content/45">Nenhuma experiência cadastrada.</p>
                ) : (
                    <div className="grid gap-4">
                        {experiences.map((experience, index) => (
                            <div key={experience.id ?? `experience-${index}`} className="grid gap-1">
                                <p className="text-sm font-normal text-base-content [font-variation-settings:'wght'_400]">
                                    {experience.jobTitle || "Cargo não informado"}
                                </p>
                                <p className="text-xs text-base-content/55">
                                    {experience.companyName || "Empresa não informada"}
                                    {" · "}
                                    {formatExperiencePeriod(experience)}
                                </p>
                                {experience.description?.trim() ? (
                                    <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-base-content/70">
                                        {experience.description.trim()}
                                    </p>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="grid gap-3">
                <EntityAttachments
                    entityType="candidate"
                    entityId={candidate.id}
                    linkRole="CURRICULUM"
                    emptyMessage="Nenhum currículo anexado."
                />
            </section>
        </div>
    );
}
