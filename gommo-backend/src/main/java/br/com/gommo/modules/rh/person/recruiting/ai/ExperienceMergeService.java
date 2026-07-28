package br.com.gommo.modules.rh.person.recruiting.ai;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import br.com.gommo.modules.rh.person.candidate.dto.CandidateExperienceDto;

@Component
public class ExperienceMergeService {

    public List<Map<String, String>> merge(
            List<Map<String, String>> fromResume, List<CandidateExperienceDto> manual) {
        List<Map<String, String>> merged = new ArrayList<>();
        if (fromResume != null) {
            for (Map<String, String> item : fromResume) {
                if (item == null) {
                    continue;
                }
                Map<String, String> normalized = normalize(item.get("jobTitle"), item.get("company"), item.get("description"));
                if (normalized != null && !isDuplicate(merged, normalized)) {
                    merged.add(normalized);
                }
            }
        }
        if (manual != null) {
            for (CandidateExperienceDto item : manual) {
                if (item == null) {
                    continue;
                }
                Map<String, String> normalized =
                        normalize(item.getJobTitle(), item.getCompanyName(), item.getDescription());
                if (normalized != null && !isDuplicate(merged, normalized)) {
                    merged.add(normalized);
                }
            }
        }
        return merged;
    }

    private static Map<String, String> normalize(String title, String company, String description) {
        String safeTitle = trim(title);
        String safeCompany = trim(company);
        if (!StringUtils.hasText(safeTitle) && !StringUtils.hasText(safeCompany)) {
            return null;
        }
        Map<String, String> map = new LinkedHashMap<>();
        map.put("jobTitle", safeTitle == null ? "" : safeTitle);
        map.put("company", safeCompany == null ? "" : safeCompany);
        map.put("description", trim(description) == null ? "" : trim(description));
        return map;
    }

    private static boolean isDuplicate(List<Map<String, String>> existing, Map<String, String> candidate) {
        String key = keyOf(candidate);
        for (Map<String, String> item : existing) {
            if (keyOf(item).equals(key)) {
                return true;
            }
        }
        return false;
    }

    private static String keyOf(Map<String, String> item) {
        return (nullToEmpty(item.get("jobTitle")) + "|" + nullToEmpty(item.get("company")))
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ")
                .trim();
    }

    private static String trim(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
