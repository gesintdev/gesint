"use client";

import {
    DevelopmentPlanDomainFormClient
} from "@/modules/cfg/settings/developmentplan/components/DevelopmentPlanDomainFormClient";
import {
    DevelopmentPlanDomainListClient
} from "@/modules/cfg/settings/developmentplan/components/DevelopmentPlanDomainListClient";
import {
    DEVELOPMENT_PLAN_DOMAIN_CONFIGS
} from "@/modules/cfg/settings/developmentplan/config/development-plan-domain.config";

export function CompetencyListClient() {
    return <DevelopmentPlanDomainListClient config={DEVELOPMENT_PLAN_DOMAIN_CONFIGS.competencies}/>;
}

export function CompetencyFormClient() {
    return <DevelopmentPlanDomainFormClient config={DEVELOPMENT_PLAN_DOMAIN_CONFIGS.competencies}/>;
}

export function ProficiencyLevelListClient() {
    return <DevelopmentPlanDomainListClient config={DEVELOPMENT_PLAN_DOMAIN_CONFIGS.proficiencyLevels}/>;
}

export function ProficiencyLevelFormClient() {
    return <DevelopmentPlanDomainFormClient config={DEVELOPMENT_PLAN_DOMAIN_CONFIGS.proficiencyLevels}/>;
}

export function DevelopmentTrackListClient() {
    return <DevelopmentPlanDomainListClient config={DEVELOPMENT_PLAN_DOMAIN_CONFIGS.tracks}/>;
}

export function DevelopmentTrackFormClient() {
    return <DevelopmentPlanDomainFormClient config={DEVELOPMENT_PLAN_DOMAIN_CONFIGS.tracks}/>;
}

export function DevelopmentActionTemplateListClient() {
    return <DevelopmentPlanDomainListClient config={DEVELOPMENT_PLAN_DOMAIN_CONFIGS.actionTemplates}/>;
}

export function DevelopmentActionTemplateFormClient() {
    return <DevelopmentPlanDomainFormClient config={DEVELOPMENT_PLAN_DOMAIN_CONFIGS.actionTemplates}/>;
}

export function EvidenceTypeListClient() {
    return <DevelopmentPlanDomainListClient config={DEVELOPMENT_PLAN_DOMAIN_CONFIGS.evidenceTypes}/>;
}

export function EvidenceTypeFormClient() {
    return <DevelopmentPlanDomainFormClient config={DEVELOPMENT_PLAN_DOMAIN_CONFIGS.evidenceTypes}/>;
}

export function DevelopmentPlanOriginListClient() {
    return <DevelopmentPlanDomainListClient config={DEVELOPMENT_PLAN_DOMAIN_CONFIGS.origins}/>;
}

export function DevelopmentPlanOriginFormClient() {
    return <DevelopmentPlanDomainFormClient config={DEVELOPMENT_PLAN_DOMAIN_CONFIGS.origins}/>;
}
