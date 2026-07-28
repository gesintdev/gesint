package br.com.gommo.modules.rh.person.recruiting.ai;

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

import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancy;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancySeniorityEnum;

@Service
public class VacancyFitScoringService {

    private static final Pattern NON_ALNUM = Pattern.compile("[^a-z0-9\\s]");
    private static final String RUBRIC_VERSION = "v1";

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
                "curriculum",
                "Currículo anexado",
                "Anexar currículo demonstra organização do candidato",
                hasCurriculum
                        ? "Currículo anexado na candidatura."
                        : "Sem currículo anexado; análise baseada só em experiências manuais.",
                hasCurriculum ? 100 : 0,
                2));

        criteria.add(criterion(
                "title",
                "Cargo semelhante",
                StringUtils.hasText(vacancy.getJobTitle()) ? vacancy.getJobTitle() : "Cargo da vaga",
                titleFound(experiences, vacancy.getJobTitle()),
                titleScore(experiences, vacancy.getJobTitle()),
                3));

        criteria.add(criterion(
                "seniority",
                "Senioridade",
                seniorityLabel(vacancy.getSeniorityLevel()),
                seniorityFound(seniorityGuess, vacancy.getSeniorityLevel()),
                seniorityScore(seniorityGuess, vacancy.getSeniorityLevel()),
                2));

        List<String> requirements = splitLines(vacancy.getRequirements(), 5);
        if (requirements.isEmpty()) {
            criteria.add(criterion(
                    "requirements",
                    "Requisitos",
                    "Requisitos da vaga",
                    "Vaga sem requisitos textuais cadastrados.",
                    55,
                    3));
        } else {
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
        }

        String activitiesAssignments = joinNonBlank(vacancy.getActivities(), vacancy.getAssignments());
        criteria.add(criterion(
                "activities",
                "Atividades / atribuições",
                StringUtils.hasText(activitiesAssignments)
                        ? truncate(activitiesAssignments, 180)
                        : "Atividades e atribuições da vaga",
                activitiesFound(corpus, activitiesAssignments),
                StringUtils.hasText(activitiesAssignments) ? keywordOverlapScore(corpus, activitiesAssignments) : 50,
                2));

        criteria.add(criterion(
                "salary",
                "Pretensão salarial",
                salaryRequired(vacancy),
                salaryFound(salaryExpectation, vacancy),
                salaryScore(salaryExpectation, vacancy),
                1));

        int totalScore = totalFromCriteria(criteria);
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
            String id, String label, String required, String found, int score, int weight) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", id);
        map.put("label", label);
        map.put("required", required);
        map.put("found", found);
        map.put("score", Math.max(0, Math.min(100, score)));
        map.put("weight", weight);
        return map;
    }

    private static int totalFromCriteria(List<Map<String, Object>> criteria) {
        if (criteria.isEmpty()) {
            return 0;
        }
        int sum = 0;
        for (Map<String, Object> item : criteria) {
            Object score = item.get("score");
            sum += score instanceof Number number ? number.intValue() : 0;
        }
        return (int) Math.round((sum * 100.0) / (criteria.size() * 100.0));
    }

    private static String buildCorpus(List<Map<String, String>> experiences, List<String> skills) {
        StringBuilder sb = new StringBuilder();
        if (experiences != null) {
            for (Map<String, String> exp : experiences) {
                if (exp == null) {
                    continue;
                }
                sb.append(' ').append(nullToEmpty(exp.get("jobTitle")));
                sb.append(' ').append(nullToEmpty(exp.get("company")));
                sb.append(' ').append(nullToEmpty(exp.get("description")));
            }
        }
        if (skills != null) {
            for (String skill : skills) {
                sb.append(' ').append(nullToEmpty(skill));
            }
        }
        return normalize(sb.toString());
    }

    private static int titleScore(List<Map<String, String>> experiences, String jobTitle) {
        if (!StringUtils.hasText(jobTitle) || experiences == null || experiences.isEmpty()) {
            return 35;
        }
        String target = normalize(jobTitle);
        int best = 0;
        for (Map<String, String> exp : experiences) {
            String title = normalize(exp.get("jobTitle"));
            if (!StringUtils.hasText(title)) {
                continue;
            }
            if (title.equals(target)) {
                return 100;
            }
            if (title.contains(target) || target.contains(title)) {
                best = Math.max(best, 85);
                continue;
            }
            best = Math.max(best, tokenOverlapPercent(title, target));
        }
        return best;
    }

    private static String titleFound(List<Map<String, String>> experiences, String jobTitle) {
        int score = titleScore(experiences, jobTitle);
        if (score >= 80) {
            return "Há cargo(s) semelhantes ao da vaga nas experiências.";
        }
        if (score >= 50) {
            return "Há indícios parciais de cargo semelhante.";
        }
        return "Pouca similaridade de cargo com a vaga.";
    }

    private static int seniorityScore(String guess, JobVacancySeniorityEnum required) {
        if (required == null) {
            return 60;
        }
        if (!StringUtils.hasText(guess)) {
            return 40;
        }
        int g = seniorityRank(guess);
        int r = seniorityRank(required.name());
        int diff = Math.abs(g - r);
        if (diff == 0) {
            return 100;
        }
        if (diff == 1) {
            return 65;
        }
        return 30;
    }

    private static String seniorityFound(String guess, JobVacancySeniorityEnum required) {
        if (required == null) {
            return "Vaga sem senioridade definida.";
        }
        if (!StringUtils.hasText(guess)) {
            return "Senioridade do candidato não identificada com clareza.";
        }
        return "Senioridade inferida: " + guess + " (vaga: " + required.name() + ").";
    }

    private static int seniorityRank(String value) {
        return switch (value) {
            case "JUNIOR" -> 1;
            case "PLENO" -> 2;
            case "SENIOR" -> 3;
            default -> 0;
        };
    }

    private static String seniorityLabel(JobVacancySeniorityEnum value) {
        return value == null ? "Não informado" : value.name();
    }

    private static int keywordOverlapScore(String corpus, String target) {
        if (!StringUtils.hasText(corpus) || !StringUtils.hasText(target)) {
            return 30;
        }
        return Math.max(20, tokenOverlapPercent(corpus, normalize(target)));
    }

    private static String scoreFound(int score, String requirement) {
        if (score >= 75) {
            return "Evidência encontrada para: \"" + requirement + "\".";
        }
        if (score >= 45) {
            return "Atendimento parcial ao requisito: \"" + requirement + "\".";
        }
        return "Não identificado com clareza: \"" + requirement + "\".";
    }

    private static String activitiesFound(String corpus, String activitiesAssignments) {
        if (!StringUtils.hasText(activitiesAssignments)) {
            return "Vaga sem atividades/atribuições textuais.";
        }
        int score = keywordOverlapScore(corpus, activitiesAssignments);
        if (score >= 70) {
            return "Experiências cobrem boa parte das atividades/atribuições.";
        }
        if (score >= 45) {
            return "Cobertura parcial das atividades/atribuições.";
        }
        return "Pouca cobertura textual das atividades/atribuições.";
    }

    private static int salaryScore(BigDecimal expectation, JobVacancy vacancy) {
        if (expectation == null) {
            return 55;
        }
        BigDecimal min = vacancy.getSalary();
        BigDecimal max = vacancy.getSalaryMax() != null ? vacancy.getSalaryMax() : vacancy.getSalary();
        if (min == null && max == null) {
            return 55;
        }
        if (min != null && max != null) {
            if (expectation.compareTo(min) >= 0 && expectation.compareTo(max) <= 0) {
                return 100;
            }
            if (expectation.compareTo(max) > 0) {
                BigDecimal over = expectation.subtract(max);
                BigDecimal tolerance = max.multiply(BigDecimal.valueOf(0.2));
                return over.compareTo(tolerance) <= 0 ? 70 : 35;
            }
            return 80;
        }
        BigDecimal ref = min != null ? min : max;
        BigDecimal delta = expectation.subtract(ref).abs();
        BigDecimal tolerance = ref.multiply(BigDecimal.valueOf(0.2));
        return delta.compareTo(tolerance) <= 0 ? 90 : 45;
    }

    private static String salaryRequired(JobVacancy vacancy) {
        if (vacancy.getSalary() == null && vacancy.getSalaryMax() == null) {
            return "Faixa salarial da vaga não informada";
        }
        if (vacancy.getSalary() != null && vacancy.getSalaryMax() != null) {
            return "Faixa " + vacancy.getSalary() + " – " + vacancy.getSalaryMax();
        }
        return "Referência " + (vacancy.getSalary() != null ? vacancy.getSalary() : vacancy.getSalaryMax());
    }

    private static String salaryFound(BigDecimal expectation, JobVacancy vacancy) {
        if (expectation == null) {
            return "Candidato não informou pretensão salarial.";
        }
        return "Pretensão informada: " + expectation + ". " + salaryRequired(vacancy) + ".";
    }

    private static List<String> matchedSkills(List<String> skills, JobVacancy vacancy) {
        if (skills == null || skills.isEmpty()) {
            return List.of();
        }
        String hay = normalize(joinNonBlank(vacancy.getRequirements(), vacancy.getActivities(), vacancy.getAssignments()));
        List<String> matched = new ArrayList<>();
        for (String skill : skills) {
            if (StringUtils.hasText(skill) && hay.contains(normalize(skill)) && matched.size() < 8) {
                matched.add(skill.trim());
            }
        }
        return matched;
    }

    private static List<String> missingSkills(List<String> skills, JobVacancy vacancy) {
        List<String> reqTokens = significantTokens(normalize(nullToEmpty(vacancy.getRequirements())));
        List<String> missing = new ArrayList<>();
        String skillBlob = normalize(String.join(" ", skills == null ? List.of() : skills));
        for (String token : reqTokens) {
            if (token.length() < 4) {
                continue;
            }
            if (!skillBlob.contains(token) && missing.size() < 8) {
                missing.add(token);
            }
        }
        return missing;
    }

    private static String buildSummary(int totalScore, boolean hasCurriculum, String seniorityGuess) {
        String base = totalScore >= 80
                ? "Forte aderência à vaga (" + totalScore + "%)."
                : totalScore >= 55
                        ? "Aderência moderada à vaga (" + totalScore + "%)."
                        : "Baixa aderência aparente (" + totalScore + "%).";
        if (hasCurriculum) {
            base += " Currículo anexado.";
        }
        if (StringUtils.hasText(seniorityGuess)) {
            base += " Senioridade inferida: " + seniorityGuess + ".";
        }
        return base;
    }

    private static int tokenOverlapPercent(String left, String right) {
        List<String> a = significantTokens(left);
        List<String> b = significantTokens(right);
        if (a.isEmpty() || b.isEmpty()) {
            return 25;
        }
        int hits = 0;
        for (String token : a) {
            if (b.contains(token)) {
                hits++;
            }
        }
        return (int) Math.round((hits * 100.0) / a.size());
    }

    private static List<String> significantTokens(String text) {
        List<String> tokens = new ArrayList<>();
        if (!StringUtils.hasText(text)) {
            return tokens;
        }
        for (String part : text.split("\\s+")) {
            if (part.length() < 3) {
                continue;
            }
            if (List.of("para", "com", "uma", "das", "dos", "que", "por", "nao", "the", "and").contains(part)) {
                continue;
            }
            if (!tokens.contains(part)) {
                tokens.add(part);
            }
        }
        return tokens;
    }

    private static List<String> splitLines(String value, int limit) {
        if (!StringUtils.hasText(value)) {
            return List.of();
        }
        List<String> lines = new ArrayList<>();
        for (String line : value.split("\\R")) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            lines.add(trimmed);
            if (lines.size() >= limit) {
                break;
            }
        }
        return lines;
    }

    private static String joinNonBlank(String... values) {
        StringBuilder sb = new StringBuilder();
        for (String value : values) {
            if (!StringUtils.hasText(value)) {
                continue;
            }
            if (!sb.isEmpty()) {
                sb.append('\n');
            }
            sb.append(value.trim());
        }
        return sb.toString();
    }

    private static String normalize(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        String nfd = Normalizer.normalize(value.toLowerCase(Locale.ROOT), Normalizer.Form.NFD);
        String noAccents = nfd.replaceAll("\\p{M}+", "");
        return NON_ALNUM.matcher(noAccents).replaceAll(" ").replaceAll("\\s+", " ").trim();
    }

    private static String truncate(String value, int max) {
        if (value.length() <= max) {
            return value;
        }
        return value.substring(0, max - 1) + "…";
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    public record ScoreResult(BigDecimal score, Map<String, Object> analysis) {}
}
