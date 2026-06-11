package br.com.gommo.modules.payment.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class PaymentPersonNameFormatterTest {

    private final PaymentPersonNameFormatter formatter = new PaymentPersonNameFormatter();

    @Test
    void formatsNameWithLowercaseParticles() {
        assertEquals("Valdimar Oliveira da Silva", formatter.formatForDisplay("VALDIMAR OLIVEIRA DA SILVA"));
    }

    @Test
    void formatsFirstNameWithInitialUppercase() {
        assertEquals("Josuel Dias dos Santos da Silva", formatter.formatForDisplay("JOSUEL DIAS DOS SANTOS DA SILVA"));
    }
}
