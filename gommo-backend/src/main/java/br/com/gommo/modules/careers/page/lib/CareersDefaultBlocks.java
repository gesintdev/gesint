package br.com.gommo.modules.careers.page.lib;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import br.com.gommo.modules.careers.page.dto.CareersBlockDto;
import br.com.gommo.modules.careers.page.entity.CareersBlockTypeEnum;

/**
 * Blocos padrao (RN-32): capa, por que trabalhar aqui, beneficios, um dia aqui, vagas abertas e
 * banco de talentos. Ponto de partida do editor; o cliente edita, oculta e reordena.
 */
public final class CareersDefaultBlocks {

    /** Sem pagina publicada, /careers mostra so a capa e as vagas (layout padrao do Gesint). */
    public static final List<CareersBlockTypeEnum> FALLBACK_SITE_TYPES =
            List.of(CareersBlockTypeEnum.HERO, CareersBlockTypeEnum.OPEN_VACANCIES);

    private CareersDefaultBlocks() {}

    public static List<CareersBlockDto> create(String organizationName) {
        List<CareersBlockDto> blocks = new ArrayList<>();
        blocks.add(block(
                CareersBlockTypeEnum.HERO,
                organizationName == null || organizationName.isBlank()
                        ? "Venha construir sua carreira com a gente"
                        : "Trabalhe na " + organizationName.trim(),
                "Conheça nossa cultura e as oportunidades abertas.",
                true,
                content("highlight", "", "ctaLabel", "Ver vagas abertas", "align", "left")));
        blocks.add(block(
                CareersBlockTypeEnum.WHY_WORK_HERE,
                "Por que trabalhar aqui",
                "O que nos move todos os dias.",
                true,
                content("items", List.of(
                        item("title", "Propósito", "description", "Conte o impacto do trabalho do time."),
                        item("title", "Crescimento", "description", "Trilhas, mentorias e promoções internas."),
                        item("title", "Ambiente", "description", "Como é o dia a dia e a cultura da empresa.")))));
        blocks.add(block(
                CareersBlockTypeEnum.BENEFITS,
                "Benefícios",
                "",
                true,
                content("items", List.of(
                        item("title", "Plano de saúde", "description", ""),
                        item("title", "Vale-alimentação", "description", ""),
                        item("title", "Desenvolvimento", "description", "")))));
        blocks.add(block(
                CareersBlockTypeEnum.DAY_IN_LIFE,
                "Um dia aqui",
                "Fotos e depoimentos de quem faz parte do time.",
                false,
                content("photos", List.of(), "testimonials", List.of(), "imageUseAuthorized", false)));
        blocks.add(block(
                CareersBlockTypeEnum.OPEN_VACANCIES,
                "Vagas abertas",
                "Encontre a oportunidade certa para você.",
                true,
                content("showFilters", true)));
        blocks.add(block(
                CareersBlockTypeEnum.TALENT_POOL,
                "Não encontrou sua vaga?",
                "Entre no nosso banco de talentos e seja lembrado nas próximas oportunidades.",
                false,
                content("ctaLabel", "Quero participar", "ctaUrl", "")));
        return blocks;
    }

    private static CareersBlockDto block(
            CareersBlockTypeEnum type, String title, String subtitle, boolean visible, Map<String, Object> content) {
        return CareersBlockDto.builder()
                .type(type)
                .title(title)
                .subtitle(subtitle)
                .visible(visible)
                .systemBlock(true)
                .content(content)
                .build();
    }

    private static Map<String, Object> content(Object... keyValues) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int i = 0; i + 1 < keyValues.length; i += 2) {
            map.put((String) keyValues[i], keyValues[i + 1]);
        }
        return map;
    }

    private static Map<String, Object> item(Object... keyValues) {
        return content(keyValues);
    }
}
