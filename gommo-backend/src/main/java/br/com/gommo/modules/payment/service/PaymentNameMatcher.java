package br.com.gommo.modules.payment.service;

import br.com.gommo.modules.person.collaborators.people.entity.Collaborator;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class PaymentNameMatcher {

    private static final double FUZZY_THRESHOLD = 0.88;
    private static final int MIN_SUBSTANTIVE_TOKEN_OVERLAP = 2;
    static final int MIN_NAME_TOKENS_FOR_MATCH = 2;

    public enum MatchType {
        EXACT,
        FUZZY,
        NONE
    }

    public record MatchResult(MatchType type, Collaborator collaborator, double score) {}

    public record NamedCollaborator(Collaborator collaborator, List<String> normalizedNames) {}

    public MatchResult match(
            String extractedName, Map<String, Collaborator> exactIndex, List<NamedCollaborator> candidates) {
        if (extractedName == null || extractedName.isBlank() || isUnidentified(extractedName)) {
            return new MatchResult(MatchType.NONE, null, 0);
        }
        for (String candidate : PaymentCollaboratorResolver.normalizedNameCandidates(extractedName)) {
            Collaborator exact = exactIndex.get(candidate);
            if (exact != null) {
                return new MatchResult(MatchType.EXACT, exact, 1.0);
            }
        }

        String normalizedExtracted = PaymentPersonNameFormatter.normalizeForComparison(extractedName);
        NamedCollaborator bestCandidate = null;
        double bestScore = 0;
        for (NamedCollaborator candidate : candidates) {
            double score = bestScore(normalizedExtracted, candidate.normalizedNames());
            if (score > bestScore) {
                bestScore = score;
                bestCandidate = candidate;
            }
        }
        if (bestCandidate != null && bestScore >= FUZZY_THRESHOLD) {
            if (passesSurnameCheck(normalizedExtracted, bestCandidate.normalizedNames())
                    && passesSubstantiveTokenOverlap(
                            normalizedExtracted, bestCandidate.normalizedNames(), MIN_SUBSTANTIVE_TOKEN_OVERLAP)) {
                return new MatchResult(MatchType.FUZZY, bestCandidate.collaborator(), bestScore);
            }
        }
        return new MatchResult(MatchType.NONE, null, bestScore);
    }

    private boolean passesSurnameCheck(String extracted, List<String> candidateNames) {
        String extractedSurname = lastSubstantiveToken(extracted);
        if (extractedSurname.isBlank()) {
            return false;
        }
        for (String candidate : candidateNames) {
            String candidateSurname = lastSubstantiveToken(candidate);
            if (candidateSurname.isBlank()) {
                continue;
            }
            if (levenshteinRatio(extractedSurname, candidateSurname) >= 0.85) {
                return true;
            }
        }
        return false;
    }

    private boolean passesSubstantiveTokenOverlap(String extracted, List<String> candidateNames, int minimumShared) {
        Set<String> extractedTokens = PaymentPersonNameFormatter.substantiveTokens(extracted);
        if (extractedTokens.size() < minimumShared) {
            return false;
        }
        for (String candidate : candidateNames) {
            Set<String> candidateTokens = PaymentPersonNameFormatter.substantiveTokens(candidate);
            int shared = 0;
            for (String token : extractedTokens) {
                if (candidateTokens.contains(token)) {
                    shared++;
                }
            }
            if (shared >= minimumShared) {
                return true;
            }
        }
        return false;
    }

    private String lastSubstantiveToken(String normalizedValue) {
        if (normalizedValue == null || normalizedValue.isBlank()) {
            return "";
        }
        String[] tokens = normalizedValue.split("\\s+");
        for (int index = tokens.length - 1; index >= 0; index--) {
            String token = tokens[index];
            if (!token.isBlank() && !isParticle(token)) {
                return token;
            }
        }
        return tokens[tokens.length - 1];
    }

    private boolean isParticle(String token) {
        return PaymentPersonNameFormatter.stripParticles(token).isBlank()
                && token.length() <= 4;
    }

    private double bestScore(String extracted, List<String> candidateNames) {
        double best = 0;
        for (String candidate : candidateNames) {
            best = Math.max(best, scorePair(extracted, candidate));
        }
        return best;
    }

    private double scorePair(String left, String right) {
        if (left.isBlank() || right.isBlank()) {
            return 0;
        }
        if (left.equals(right)) {
            return 1.0;
        }
        double full = levenshteinRatio(left, right);
        String strippedLeft = PaymentPersonNameFormatter.stripParticles(left);
        String strippedRight = PaymentPersonNameFormatter.stripParticles(right);
        double stripped = levenshteinRatio(strippedLeft, strippedRight);
        double tokens = tokenOverlapScore(left, right);
        return Math.max(full, Math.max(stripped, tokens));
    }

    private double tokenOverlapScore(String left, String right) {
        Set<String> leftTokens = PaymentPersonNameFormatter.substantiveTokens(left);
        Set<String> rightTokens = PaymentPersonNameFormatter.substantiveTokens(right);
        if (leftTokens.isEmpty() || rightTokens.isEmpty()) {
            return 0;
        }
        int intersection = 0;
        for (String token : leftTokens) {
            if (rightTokens.contains(token)) {
                intersection++;
            }
        }
        int union = new HashSet<>(leftTokens).size();
        union = Math.max(union, rightTokens.size());
        return (double) intersection / union;
    }

    private double levenshteinRatio(String left, String right) {
        int distance = levenshteinDistance(left, right);
        int maxLen = Math.max(left.length(), right.length());
        if (maxLen == 0) {
            return 1.0;
        }
        return 1.0 - ((double) distance / maxLen);
    }

    private int levenshteinDistance(String left, String right) {
        int[][] matrix = new int[left.length() + 1][right.length() + 1];
        for (int row = 0; row <= left.length(); row++) {
            matrix[row][0] = row;
        }
        for (int col = 0; col <= right.length(); col++) {
            matrix[0][col] = col;
        }
        for (int row = 1; row <= left.length(); row++) {
            for (int col = 1; col <= right.length(); col++) {
                int cost = left.charAt(row - 1) == right.charAt(col - 1) ? 0 : 1;
                matrix[row][col] = Math.min(
                        Math.min(matrix[row - 1][col] + 1, matrix[row][col - 1] + 1),
                        matrix[row - 1][col - 1] + cost);
            }
        }
        return matrix[left.length()][right.length()];
    }

    private boolean isUnidentified(String extractedName) {
        return "nao identificado".equals(extractedName.trim().toLowerCase(Locale.ROOT));
    }
}
