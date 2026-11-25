package br.com.gesint.core.util;

/** Validador de CPF (digitos verificadores), espelhando a regra do frontend. */
public final class BrazilianCpfValidator {

    private BrazilianCpfValidator() {}

    public static String digitsOnly(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("\\D", "");
    }

    public static boolean isValid(String value) {
        String digits = digitsOnly(value);
        if (digits.length() != 11 || digits.chars().distinct().count() == 1) {
            return false;
        }
        int[] nums = digits.chars().map(ch -> ch - '0').toArray();
        int d1 = checkDigit(nums, 9, 10);
        int d2 = checkDigit(nums, 10, 11);
        return d1 == nums[9] && d2 == nums[10];
    }

    private static int checkDigit(int[] nums, int length, int factor) {
        int sum = 0;
        for (int i = 0; i < length; i++) {
            sum += nums[i] * (factor - i);
        }
        int mod = (sum * 10) % 11;
        return mod == 10 ? 0 : mod;
    }
}
