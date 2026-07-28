import type {
    ApplicationAiAnalysis,
    JobVacancyApplication,
} from "@/modules/rh/person/jobvacancyapplication/dto/job-vacancy-application.dto";
import type { MatchScoreBreakdown, MatchScoreCriterion } from "@/modules/rh/person/jobvacancy/lib/mock-match-score-breakdown";

export function applicationAiScore(application?: Pick<JobVacancyApplication, "aiScore" | "aiStatus"> | null): number | null {
    if (!application) return null;
    if (application.aiScore == null) return null;
    const score = Number(application.aiScore);
    if (Number.isNaN(score)) return null;
    return Math.max(0, Math.min(100, Math.round(score)));
}

export function isApplicationAiPending(application?: Pick<JobVacancyApplication, "aiStatus"> | null): boolean {
    const status = application?.aiStatus;
    return status === "PENDING" || status === "PROCESSING";
}

export function buildMatchBreakdownFromApplication(
    application?: Pick<JobVacancyApplication, "aiScore" | "aiAnalysis" | "aiStatus"> | null,
): MatchScoreBreakdown | null {
    const analysis = application?.aiAnalysis as ApplicationAiAnalysis | null | undefined;
    if (!analysis) return null;

    const criteria: MatchScoreCriterion[] = (analysis.criteria ?? [])
        .filter((item) => item != null)
        .map((item, index) => ({
            id: item.id || `criterion-${index}`,
            label: item.label || `Critério ${index + 1}`,
            required: item.required || "—",
            found: item.found || "—",
            score: Math.max(0, Math.min(100, Math.round(Number(item.score) || 0))),
            weight: Number(item.weight) || 1,
        }));

    const totalScore = applicationAiScore(application) ?? 0;
    return {
        totalScore,
        summary: analysis.summary?.trim() || `Score ${totalScore}%.`,
        criteria,
    };
}
