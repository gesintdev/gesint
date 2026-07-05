package br.com.gommo.admin.modules.client.service;

import java.security.SecureRandom;

import org.springframework.stereotype.Component;

@Component
public class MobileLoginCodeGenerator {

    private static final int BASE_CODE_BOUND = 100_000_000;
    private static final SecureRandom RANDOM = new SecureRandom();

    public String generate() {
        String baseCode = String.format("%08d", RANDOM.nextInt(BASE_CODE_BOUND));
        return baseCode + luhnCheckDigit(baseCode);
    }

    private int luhnCheckDigit(String baseCode) {
        int sum = 0;
        boolean shouldDouble = true;

        for (int index = baseCode.length() - 1; index >= 0; index--) {
            int digit = Character.digit(baseCode.charAt(index), 10);
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }

        return (10 - (sum % 10)) % 10;
    }
}