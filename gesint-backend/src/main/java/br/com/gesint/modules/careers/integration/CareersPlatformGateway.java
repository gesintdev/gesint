package br.com.gesint.modules.careers.integration;

import java.util.List;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

/**
 * Fronteira do site de carreiras com o restante do Gesint (vagas, candidatos, tenant).
 * O modulo {@code careers} so conversa com o recrutamento por aqui: para extrair o site para um
 * servico proprio, basta trocar a implementacao por um cliente HTTP.
 */
public interface CareersPlatformGateway {

    String organizationName();

    List<CareersVacancy> listPublishedVacancies();

    Optional<CareersVacancy> findPublishedVacancy(String slug);

    CareersApplicationOutcome submitApplication(CareersApplicationCommand command, MultipartFile resume);
}
