"use client";

import { ArrowRight, Briefcase, Clock, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { CareersVacancySummary } from "@/modules/careers/shared/dto/careers.dto";
import {
    formatRelativePublished,
    formatSalaryRange,
    isClosingSoon,
} from "@/modules/careers/shared/lib/careers-format";
import {
    CAREERS_CONTRACT_TYPE_LABELS,
    CAREERS_SENIORITY_LABELS,
    CAREERS_WORK_MODALITY_LABELS,
} from "@/modules/careers/shared/lib/careers-labels";
import { InputSelect, InputString, type SelectItem } from "@/shared/components/ui/input/index";

type CareersVacancyListProps = {
    vacancies: CareersVacancySummary[];
    showFilters: boolean;
    /** No preview do editor os cards não navegam. */
    preview?: boolean;
    emptyHint?: string;
};

const ALL = "";

function uniqueSorted(values: (string | null | undefined)[]): string[] {
    return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))].sort(
        (a, b) => a.localeCompare(b, "pt-BR"),
    );
}

function FilterSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: SelectItem[];
    onChange: (value: string) => void;
}) {
    return (
        <InputSelect
            items={options}
            value={value}
            placeholder={label}
            clearable
            onValueChange={onChange}
            wrapperClassName="min-w-40 flex-1"
        />
    );
}

function VacancyCard({ vacancy, preview }: { vacancy: CareersVacancySummary; preview?: boolean }) {
    const modality = vacancy.workModality ? CAREERS_WORK_MODALITY_LABELS[vacancy.workModality] : null;
    const contract = vacancy.contractType ? CAREERS_CONTRACT_TYPE_LABELS[vacancy.contractType] : null;
    const seniority = vacancy.seniorityLevel ? CAREERS_SENIORITY_LABELS[vacancy.seniorityLevel] : null;
    const salary = formatSalaryRange(vacancy.salary, vacancy.salaryMax);
    const published = formatRelativePublished(vacancy.publishedAt);
    const closingSoon = isClosingSoon(vacancy.expectedCompletionDate);

    const body = (
        <>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    {vacancy.department ? (
                        <span className="text-xs font-medium text-base-content/55">{vacancy.department}</span>
                    ) : null}
                    {closingSoon ? (
                        <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[11px] font-semibold text-base-content/80">
                            Encerra em breve
                        </span>
                    ) : null}
                </div>
                <h3 className="mt-1 text-base font-semibold text-base-content">{vacancy.jobTitle}</h3>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-base-content/60">
                    {vacancy.location || modality ? (
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5" strokeWidth={2} />
                            {[vacancy.location, modality].filter(Boolean).join(" · ")}
                        </span>
                    ) : null}
                    {contract || seniority ? (
                        <span className="inline-flex items-center gap-1.5">
                            <Briefcase className="size-3.5" strokeWidth={2} />
                            {[contract, seniority].filter(Boolean).join(" · ")}
                        </span>
                    ) : null}
                    {published ? (
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="size-3.5" strokeWidth={2} />
                            {published}
                        </span>
                    ) : null}
                </div>
                {salary ? <p className="mt-2 text-sm font-medium text-base-content/80">{salary}</p> : null}
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">
                Ver vaga
                <ArrowRight className="size-4" strokeWidth={2} />
            </span>
        </>
    );

    const className =
        "group flex flex-col gap-3 rounded-[var(--careers-radius)] border border-base-content/10 bg-base-100 p-5 transition-colors hover:border-primary/50 @md:flex-row @md:items-center";

    if (preview) {
        return <div className={className}>{body}</div>;
    }
    return (
        <Link href={`/careers/${encodeURIComponent(vacancy.slug)}`} className={className}>
            {body}
        </Link>
    );
}

export function CareersVacancyList({ vacancies, showFilters, preview, emptyHint }: CareersVacancyListProps) {
    const [query, setQuery] = useState("");
    const [department, setDepartment] = useState(ALL);
    const [location, setLocation] = useState(ALL);
    const [modality, setModality] = useState(ALL);

    const departments = useMemo(() => uniqueSorted(vacancies.map((item) => item.department)), [vacancies]);
    const locations = useMemo(() => uniqueSorted(vacancies.map((item) => item.location)), [vacancies]);
    const modalities = useMemo(
        () => uniqueSorted(vacancies.map((item) => item.workModality)) as (keyof typeof CAREERS_WORK_MODALITY_LABELS)[],
        [vacancies],
    );

    const filtered = useMemo(() => {
        const term = query.trim().toLocaleLowerCase("pt-BR");
        return vacancies.filter((item) => {
            if (department && item.department !== department) return false;
            if (location && item.location !== location) return false;
            if (modality && item.workModality !== modality) return false;
            if (!term) return true;
            return [item.jobTitle, item.department, item.location]
                .filter(Boolean)
                .some((value) => value!.toLocaleLowerCase("pt-BR").includes(term));
        });
    }, [vacancies, query, department, location, modality]);

    const hasFilters = showFilters && vacancies.length > 1;

    return (
        <div className="grid gap-4">
            {hasFilters ? (
                <div className="flex flex-wrap gap-2">
                    <InputString
                        value={query}
                        onValueChange={setQuery}
                        placeholder="Buscar por cargo, área ou cidade"
                        leftIcon={<Search className="size-4 text-base-content/40" strokeWidth={2} />}
                        wrapperClassName="basis-full @3xl:basis-64 @3xl:flex-[2]"
                    />
                    {departments.length > 1 ? (
                        <FilterSelect
                            label="Todas as áreas"
                            value={department}
                            onChange={setDepartment}
                            options={departments.map((value) => ({ value, label: value }))}
                        />
                    ) : null}
                    {locations.length > 1 ? (
                        <FilterSelect
                            label="Todas as cidades"
                            value={location}
                            onChange={setLocation}
                            options={locations.map((value) => ({ value, label: value }))}
                        />
                    ) : null}
                    {modalities.length > 1 ? (
                        <FilterSelect
                            label="Todos os modelos"
                            value={modality}
                            onChange={setModality}
                            options={modalities.map((value) => ({
                                value,
                                label: CAREERS_WORK_MODALITY_LABELS[value] ?? value,
                            }))}
                        />
                    ) : null}
                </div>
            ) : null}

            {vacancies.length > 0 ? (
                <p className="text-[13px] text-base-content/55">
                    {filtered.length === vacancies.length
                        ? `${vacancies.length} ${vacancies.length === 1 ? "vaga aberta" : "vagas abertas"}`
                        : `${filtered.length} de ${vacancies.length} vagas`}
                </p>
            ) : null}

            {filtered.length > 0 ? (
                <div className="grid gap-3">
                    {filtered.map((vacancy) => (
                        <VacancyCard key={vacancy.slug} vacancy={vacancy} preview={preview} />
                    ))}
                </div>
            ) : (
                <div className="rounded-[var(--careers-radius)] border border-dashed border-base-content/20 bg-base-100 px-6 py-10 text-center">
                    <p className="text-sm font-medium text-base-content">
                        {vacancies.length === 0 ? "Nenhuma vaga aberta no momento." : "Nenhuma vaga encontrada com esses filtros."}
                    </p>
                    {emptyHint && vacancies.length === 0 ? (
                        <p className="mt-1 text-[13px] text-base-content/55">{emptyHint}</p>
                    ) : null}
                </div>
            )}
        </div>
    );
}
