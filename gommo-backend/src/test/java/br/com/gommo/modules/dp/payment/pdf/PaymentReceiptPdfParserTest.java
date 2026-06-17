package br.com.gommo.modules.dp.payment.pdf;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PaymentReceiptPdfParserTest {

    private PaymentReceiptPdfParser parser;

    @BeforeEach
    void setUp() {
        parser = new PaymentReceiptPdfParser(new PaymentReceiptPdfOcr(""));
    }

    @Test
    void extractsNameFromSingleLineBlob() {
        String pageText =
                "CNPJ 47.417.460/0001-83 Folha Mensal Codigo 3 Nome do Funcionario ABEL SILVA LIMA ARMADOR CBO 715315";

        assertEquals("ABEL SILVA LIMA", parser.extractEmployeeName(pageText));
    }

    @Test
    void extractsNameFromEmployeeLabelOnNextLine() {
        String pageText =
                """
                CNPJ: 47.417.460/0001-83
                Folha Mensal
                Maio de 2026
                Codigo: 3
                Nome do Funcionario
                ABEL  SILVA  LIMA
                ARMADOR
                CBO: 715315
                """;

        assertEquals("ABEL SILVA LIMA", parser.extractEmployeeName(pageText));
    }

    @Test
    void extractsNameWhenJobTitleIsOnSameLine() {
        String pageText = "Nome do Funcionario: ABEL  SILVA  LIMA  ARMADOR";

        assertEquals("ABEL SILVA LIMA", parser.extractEmployeeName(pageText));
    }

    @Test
    void extractsNameWithParticleDa() {
        String pageText = "Nome do Funcionario: VALDIMAR OLIVEIRA DA SILVA";

        assertEquals("VALDIMAR OLIVEIRA DA SILVA", parser.extractEmployeeName(pageText));
    }

    @Test
    void extractsNameFromEmployeeLabelInline() {
        String pageText = "Nome do Funcionario: ABEL  SILVA  LIMA";

        assertEquals("ABEL SILVA LIMA", parser.extractEmployeeName(pageText));
    }

    @Test
    void extractsNameFromFuncAbbreviation() {
        String pageText = "Func.: ABEL SILVA LIMA";

        assertEquals("ABEL SILVA LIMA", parser.extractEmployeeName(pageText));
    }

    @Test
    void normalizesNameForMatching() {
        assertEquals("abel silva lima", PaymentReceiptPdfParser.normalizeName("  ABEL   SILVA  LIMA  "));
    }

    @Test
    void rejectsPayrollHeaderLine() {
        String pageText =
                "Salario Base Sal. Contr. INSS Base Calc. FGTS F.G.T.S do Mes Base Calc. IRRF Faixa IRRF";
        assertNull(parser.extractEmployeeName(pageText));
    }

    @Test
    void rejectsBirthdayFooter() {
        String pageText =
                """
                CNPJ 47.417.460/0001-83 Folha Mensal
                Codigo 3 Nome do Funcionario
                VALDIMAR OLIVEIRA DA SILVA
                Vencimentos Descontos
                PARABENS PELO SEU ANIVERSARIO NO DIA
                """;
        assertEquals("VALDIMAR OLIVEIRA DA SILVA", parser.extractEmployeeName(pageText));
    }

    @Test
    void rejectsJobTitleOnly() {
        String pageText = "Nome do Funcionario\nENCARREGADO ARMADOR\nCBO 715315";
        assertNull(parser.extractEmployeeName(pageText));
    }

    @Test
    void rejectsAfastamentoFragment() {
        String pageText = "Nome do Funcionario\nDIAS AFAST\nCBO 715315";
        assertNull(parser.extractEmployeeName(pageText));
    }

    @Test
    void extractsUppercaseNameAfterOcrNoise() {
        String pageText =
                """
                CNPJ 47.417.460/0001-83 Folha Mensal Maio 2026
                Codigo 3 Nome do Funcionario
                ABEL SILVA LIMA
                Salario Base Sal. Contr. INSS Base Calc. FGTS
                """;
        assertEquals("ABEL SILVA LIMA", parser.extractEmployeeName(pageText));
    }

    @Test
    void returnsNullWhenNameCannotBeFound() {
        String pageText =
                """
                CNPJ: 47.417.460/0001-83
                Folha Mensal
                Maio de 2026
                """;

        assertNull(parser.extractEmployeeName(pageText));
    }
}
