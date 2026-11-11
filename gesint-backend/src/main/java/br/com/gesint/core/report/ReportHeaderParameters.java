package br.com.gesint.core.report;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.imageio.ImageIO;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import br.com.gesint.core.audit.CurrentAuditor;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.ctb.payroll.integration.CompanyDisplayProvider;
import br.com.gesint.modules.ctb.payroll.integration.CompanyDisplaySnapshot;
import br.com.gesint.modules.root.repository.AppUserRepository;

@Component
public class ReportHeaderParameters {

    private static final ZoneId SAO_PAULO = ZoneId.of("America/Sao_Paulo");
    private static final String SYSTEM_LOGO_PATH = "reports/common/gesint-monogram.png";

    private final CompanyDisplayProvider companyDisplayProvider;
    private final AppUserRepository appUserRepository;
    private final BufferedImage systemLogo;

    public ReportHeaderParameters(
            CompanyDisplayProvider companyDisplayProvider, AppUserRepository appUserRepository) {
        this.companyDisplayProvider = companyDisplayProvider;
        this.appUserRepository = appUserRepository;
        this.systemLogo = loadSystemLogo();
    }

    public Map<String, Object> current() {
        CompanyDisplaySnapshot company =
                companyDisplayProvider.findPrimary().orElseGet(() -> CompanyDisplaySnapshot.empty(null));
        String userName = CurrentAuditor.userId()
                .flatMap(id -> appUserRepository.findByIdAndStatusNot(id, StatusEnum.DELETED))
                .map(user -> user.getName() != null && !user.getName().isBlank()
                        ? user.getName()
                        : user.getUsername())
                .orElse("-");

        Map<String, Object> parameters = new LinkedHashMap<>();
        parameters.put("SYSTEM_LOGO", systemLogo);
        parameters.put("COMPANY_NAME", safe(company.legalName()));
        parameters.put("BRANCH_NAME", safe(company.displayName()));
        parameters.put("GENERATED_BY", userName);
        parameters.put("GENERATED_AT", OffsetDateTime.now(SAO_PAULO));
        return parameters;
    }

    private static BufferedImage loadSystemLogo() {
        ClassPathResource resource = new ClassPathResource(SYSTEM_LOGO_PATH);
        try (InputStream input = resource.getInputStream()) {
            BufferedImage image = ImageIO.read(input);
            if (image == null) {
                throw new IllegalStateException("Logo do sistema inválido: " + SYSTEM_LOGO_PATH);
            }
            return image;
        } catch (IOException ex) {
            throw new IllegalStateException("Logo do sistema não encontrado: " + SYSTEM_LOGO_PATH, ex);
        }
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }
}
