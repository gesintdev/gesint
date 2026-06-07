package br.com.gommo.modules.payroll.calculation.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;

public final class PayrollFormulaEvaluator {

    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\b([a-zA-Z][a-zA-Z0-9_]*)\\b");
    private static final Set<String> RESERVED = Set.of("true", "false", "null");
    private static final ExpressionParser PARSER = new SpelExpressionParser();

    private PayrollFormulaEvaluator() {}

    public static BigDecimal evaluate(String formula, Map<String, BigDecimal> variables) {
        if (formula == null || formula.isBlank()) {
            return BigDecimal.ZERO;
        }

        String trimmed = formula.trim();
        if (variables.containsKey(trimmed)) {
            return scale(variables.get(trimmed));
        }

        String spel = toSpelExpression(trimmed, variables.keySet());
        StandardEvaluationContext context = new StandardEvaluationContext();
        variables.forEach((key, value) -> context.setVariable(key, value != null ? value.doubleValue() : 0.0d));

        Double result = PARSER.parseExpression(spel).getValue(context, Double.class);
        if (result == null || result.isNaN() || result.isInfinite()) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.valueOf(result).setScale(2, RoundingMode.HALF_UP);
    }

    private static String toSpelExpression(String formula, Set<String> allowedVariables) {
        return VARIABLE_PATTERN.matcher(formula).replaceAll(match -> {
            String token = match.group(1);
            if (RESERVED.contains(token) || !allowedVariables.contains(token)) {
                return token;
            }
            return "#" + token;
        });
    }

    private static BigDecimal scale(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
