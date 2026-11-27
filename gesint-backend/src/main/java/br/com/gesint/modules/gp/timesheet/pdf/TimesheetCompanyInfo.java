package br.com.gesint.modules.gp.timesheet.pdf;

/** Cabecalho do espelho: empregador e documento do colaborador. */
public record TimesheetCompanyInfo(String companyName, String companyCnpj, String collaboratorCpf) {

    public static TimesheetCompanyInfo empty() {
        return new TimesheetCompanyInfo(null, null, null);
    }
}
