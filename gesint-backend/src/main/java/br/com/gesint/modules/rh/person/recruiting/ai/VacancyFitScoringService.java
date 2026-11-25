package br.com.gesint.modules.rh.person.recruiting.ai;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import br.com.gesint.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gesint.modules.rh.person.jobvacancy.entity.JobVacancySeniorityEnum;

@Service
public class VacancyFitScoringService {

    private static final Pattern NON_ALNUM = Pattern.compile("[^a-z0-9\\s]");
    private static final String RUBRIC_VERSION = "v2";

    public ScoreResult score(
            JobVacancy vacancy,
            List<Map<String, String>> experiences,
            List<String> skills,
            String seniorityGuess,
            boolean hasCurriculum,
            BigDecimal salaryExpectation) {
        String corpus = buildCorpus(experiences, skills);
        List<Map<String, Object>> criteria = new ArrayList<>();

        criteria.add(criterion(
                "title",
                "Cargo semelhante",
                StringUtils.hasText(vacancy.getJobTitle()) ? vacancy.getJobTitle() : "Cargo da vaga",
                titleFound(experiences, vacancy.getJobTitle()),
                titleScore(experiences, vacancy.getJobTitle()),
                3));

        if (vacancy.getSeniorityLevel() != null) {
            criteria.add(criterion(
                    "seniority",
                    "Senioridade",
                    seniorityLabel(vacancy.getSeniorityLevel()),
                    seniorityFound(seniorityGuess, vacancy.getSeniorityLevel()),
                    seniorityScore(seniorityGuess, vacancy.getSeniorityLevel()),
                    2));
        }

        List<String> requirements = splitLines(vacancy.getRequirements(), 5);
        int index = 0;
        for (String requirement : requirements) {
            int score = keywordOverlapScore(corpus, requirement);
            criteria.add(criterion(
                    "req-" + index,
                    "Requisito " + (index + 1),
                    requirement,
                    scoreFound(score, requirement),
                    score,
                    2));
            index++;
        }

        String activitiesAssignments = joinNonBlank(vacancy.getActivities(), vacancy.getAssignments());
        if (StringUtils.hasText(activitiesAssignments)) {
            criteria.add(criterion(
                    "activities",
                    "Atividades / atribuições",
                    truncate(activitiesAssignments, 180),
                    activitiesFound(corpus, activitiesAssignments),
                    keywordOverlapScore(corpus, activitiesAssignments),
                    2));
        }

        int totalScore = criteria.isEmpty() ? 0 : totalFromCriteria(criteria);
        String summary = buildSummary(totalScore, hasCurriculum, seniorityGuess);

        Map<String, Object> analysis = new LinkedHashMap<>();
        analysis.put("summary", summary);
        analysis.put("hasCurriculum", hasCurriculum);
        analysis.put("seniorityGuess", seniorityGuess);
        analysis.put("skills", skills == null ? List.of() : skills);
        analysis.put("matchedSkills", matchedSkills(skills, vacancy));
        analysis.put("missingSkills", missingSkills(skills, vacancy));
        analysis.put("criteria", criteria);
        analysis.put("rubricVersion", RUBRIC_VERSION);

        return new ScoreResult(BigDecimal.valueOf(totalScore).setScale(2, RoundingMode.HALF_UP), analysis);
    }

    private static Map<String, Object> criterion(
            String key, String label, String expected, String found, int score, int weight) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("key", key);
        item.put("label", label);
        item.put("expected", expected);
        item.put("found", found);
        item.put("score", score);
        item.put("weight", weight);
        return item;
    }

    private static int totalFromCriteria(List<Map<String, Object>> criteria) {
        int weightedSum = 0;
        int weightTotal = 0;
        for (Map<String, Object> item : criteria) {
            int score = ((Number) item.get("score")).intValue();
            int weight = ((Number) item.get("weight")).intValue();
            weightedSum += score * weight;
            weightTotal += weight;
        }
        if (weightTotal == 0) {
            return 0;
        }
        return Math.round((float) weightedSum / weightTotal);
    }

    private static String buildSummary(int totalScore, boolean hasCurriculum, String seniorityGuess) {
        StringBuilder summary = new StringBuilder();
        summary.append("Compatibilidade estimada de ").append(totalScore).append("%.");
        if (!hasCurriculum) {
            summary.append(" Análise baseada apenas em experiências manuais.");
        }
        if (StringUtils.hasText(seniorityGuess)) {
            summary.append(" Senioridade sugerida: ").append(seniorityGuess).append(".");
        }
        return summary.toString();
    }

    private static String buildCorpus(List<Map<String, String>> experiences, List<String> skills) {
        StringBuilder builder = new StringBuilder();
        if (experiences != null) {
            for (Map<String, String> experience : experiences) {
                if (experience == null) {
                    continue;
                }
                experience.values().forEach(value -> {
                    if (StringUtils.hasText(value)) {
                        builder.append(' ').append(value);
                    }
                });
            }
        }
        if (skills != null) {
            for (String skill : skills) {
                if (StringUtils.hasText(skill)) {
                    builder.append(' ').append(skill);
                }
            }
        }
        return normalize(builder.toString());
    }

    private static String titleFound(List<Map<String, String>> experiences, String jobTitle) {
        int score = titleScore(experiences, jobTitle);
        if (!StringUtils.hasText(jobTitle)) {
            return "Vaga sem título para comparação.";
        }
        return score >= 70 ? "Experiência compatível com o cargo." : "Pouca evidência de cargo semelhante.";
    }

    private static int titleScore(List<Map<String, String>> experiences, String jobTitle) {
        if (!StringUtils.hasText(jobTitle) || experiences == null || experiences.isEmpty()) {
            return 0;
        }
        String expected = normalize(jobTitle);
        int best = 0;
        for (Map<String, String> experience : experiences) {
            if (experience == null) {
                continue;
            }
            String title = experience.get("title");
            if (!StringUtils.hasText(title)) {
                title = experience.get("role");
            }
            if (!StringUtils.hasText(title)) {
                continue;
            }
            best = Math.max(best, keywordOverlapScore(normalize(title), expected));
        }
        return best;
    }

    private static String seniorityLabel(JobVacancySeniorityEnum seniority) {
        return seniority == null ? "Não informado" : seniority.name();
    }

    private static String seniorityFound(String seniorityGuess, JobVacancySeniorityEnum required) {
        if (required == null) {
            return "Vaga sem senioridade definida.";
        }
        if (!StringUtils.hasText(seniorityGuess)) {
            return "Senioridade do candidato não identificada.";
        }
        return "Senioridade estimada: " + seniorityGuess;
    }

    private static int seniorityScore(String seniorityGuess, JobVacancySeniorityEnum required) {
        if (required == null || !StringUtils.hasText(seniorityGuess)) {
            return 0;
        }
        String guess = normalize(seniorityGuess);
        String expected = normalize(required.name());
        if (guess.contains(expected) || expected.contains(guess)) {
            return 100;
        }
        return keywordOverlapScore(guess, expected);
    }

    private static String scoreFound(int score, String requirement) {
        if (score >= 70) {
            return "Evidência forte para: " + truncate(requirement, 80);
        }
        if (score >= 40) {
            return "Evidência parcial para: " + truncate(requirement, 80);
        }
        return "Pouca evidência para: " + truncate(requirement, 80);
    }

    private static String activitiesFound(String corpus, String activities) {
        int score = keywordOverlapScore(corpus, activities);
        return scoreFound(score, "atividades/atribuições");
    }

    private static int keywordOverlapScore(String corpus, String expected) {
        if (!StringUtils.hasText(corpus) || !StringUtils.hasText(expected)) {
            return 0;
        }
        String normalizedExpected = normalize(expected);
        String[] tokens = normalizedExpected.split("\\s+");
        int hits = 0;
        int considered = 0;
        for (String token : tokens) {
            if (token.length() < 3) {
                continue;
            }
            considered++;
            if (corpus.contains(token)) {
                hits++;
            }
        }
        if (considered == 0) {
            return corpus.contains(normalizedExpected) ? 100 : 0;
        }
        return Math.round((hits * 100f) / considered);
    }

    private static List<String> splitLines(String value, int limit) {
        if (!StringUtils.hasText(value)) {
            return List.of();
        }
        String[] lines = value.split("[\\r\\n;•|-]+");
        List<String> result = new ArrayList<>();
        for (String line : lines) {
            String trimmed = line == null ? "" : line.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            result.add(trimmed);
            if (result.size() >= limit) {
                break;
            }
        }
        return result;
    }

    private static List<String> matchedSkills(List<String> skills, JobVacancy vacancy) {
        List<String> required = splitLines(vacancy.getRequirements(), 20);
        List<String> matched = new ArrayList<>();
        if (skills == null) {
            return matched;
        }
        for (String skill : skills) {
            if (!StringUtils.hasText(skill)) {
                continue;
            }
            String normalizedSkill = normalize(skill);
            for (String requirement : required) {
                if (normalize(requirement).contains(normalizedSkill) || normalizedSkill.contains(normalize(requirement))) {
                    matched.add(skill);
                    break;
                }
            }
        }
        return matched;
    }

    private static List<String> missingSkills(List<String> skills, JobVacancy vacancy) {
        List<String> required = splitLines(vacancy.getRequirements(), 8);
        List<String> missing = new ArrayList<>();
        String skillCorpus = skills == null ? "" : normalize(String.join(" ", skills));
        for (String requirement : required) {
            if (keywordOverlapScore(skillCorpus, requirement) < 40) {
                missing.add(requirement);
            }
        }
        return missing;
    }

    private static String joinNonBlank(String first, String second) {
        StringBuilder builder = new StringBuilder();
        if (StringUtils.hasText(first)) {
            builder.append(first.trim());
        }
        if (StringUtils.hasText(second)) {
            if (!builder.isEmpty()) {
                builder.append(' ');
            }
            builder.append(second.trim());
        }
        return builder.toString();
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max - 1) + "…";
    }

    private static String normalize(String value) {
        if (value == null) {
            return "";
        }
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT);
        return NON_ALNUM.matcher(normalized).replaceAll(" ").replaceAll("\\s+", " ").trim();
    }

    public record ScoreResult(BigDecimal score, Map<String, Object> analysis) {}
}
