package br.com.gesint.admin.modules.client.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Cadastros minimos que todo tenant precisa no primeiro acesso e em toda sincronizacao de schema.
 *
 * <p>Inclui:
 * <ul>
 *   <li>RBAC de dominio (permissoes, perfis de sistema e Administrador por sistema)</li>
 *   <li>Escala de trabalho padrao</li>
 *   <li>Colunas do kanban de admissao</li>
 *   <li>Preferencias do sistema ({@code system_setting})</li>
 *   <li>Itens do checklist de devolucao na entrevista de desligamento</li>
 *   <li>Eventos padrao de folha ({@code payroll_event})</li>
 *   <li>Catalogo inicial de PDI (niveis de proficiencia, tipos de evidencia, origens)</li>
 *   <li>Catalogo eSocial Tabela 27 (exames complementares)</li>
 *   <li>Catalogo de tipos de documento para anexos (SEG-01 / RN-02)</li>
 * </ul>
 *
 * <p>Escala e kanban usam valores explicitos (nao copiam {@code public}) para nao vazar ajustes
 * locais do ambiente. Demais cadastros copiam o catalogo canonico de {@code public}, preenchido
 * pelas migrations do gesint-backend na primeira subida do ambiente.
 *
 * <p>Idempotente: roda no provisionamento, no sync manual, no bootstrap de schemas no start do
 * admin-backend e pode ser reexecutado sem duplicar registros.
 */
@Component
public class TenantDefaultDataProvisioner {

    private static final String DEFAULT_WORK_SCHEDULE_ID = "00000000-0000-0000-0000-0000000000a1";

    private final JdbcTemplate jdbcTemplate;
    private final TenantRbacProvisioner tenantRbacProvisioner;

    public TenantDefaultDataProvisioner(JdbcTemplate jdbcTemplate, TenantRbacProvisioner tenantRbacProvisioner) {
        this.jdbcTemplate = jdbcTemplate;
        this.tenantRbacProvisioner = tenantRbacProvisioner;
    }

    public void seedDefaults(String schema) {
        tenantRbacProvisioner.provisionRbacTables(schema);
        seedDefaultWorkSchedule(schema);
        seedAdmissionKanbanColumns(schema);
        seedRejectedKanbanColumn(schema);
        seedSystemSettings(schema);
        seedExitInterviewReturnChecklistItems(schema);
        seedPayrollEvents(schema);
        seedDevelopmentPlanCatalog(schema);
        seedEsocialTable27Procedures(schema);
        seedDocumentTypes(schema);
    }

    private void seedDefaultWorkSchedule(String schema) {
        if (!tableExists(schema, "work_schedule") || !tableExists(schema, "work_schedule_day")) {
            return;
        }
        if (hasRows(schema, "work_schedule")) {
            return;
        }

        jdbcTemplate.update(
                """
                INSERT INTO "%s".work_schedule (id, code, status, name, description, created_at)
                VALUES ('%s'::uuid, 1, 'ACTIVE', 'Escala Padrão', 'Segunda a sexta, 44 horas semanais', now())
                ON CONFLICT (id) DO NOTHING
                """
                        .formatted(schema, DEFAULT_WORK_SCHEDULE_ID));

        jdbcTemplate.update(
                """
                INSERT INTO "%s".work_schedule_day (
                    work_schedule_id, day_of_week, period1_start, period1_end, period2_start, period2_end
                )
                SELECT '%s'::uuid, d.day_of_week, TIME '08:00', TIME '12:00', d.period2_start, TIME '18:00'
                FROM (
                    VALUES
                        ('MONDAY', TIME '13:00'),
                        ('TUESDAY', TIME '13:00'),
                        ('WEDNESDAY', TIME '13:00'),
                        ('THURSDAY', TIME '13:00'),
                        ('FRIDAY', TIME '14:00')
                ) AS d(day_of_week, period2_start)
                ON CONFLICT (work_schedule_id, day_of_week) DO NOTHING
                """
                        .formatted(schema, DEFAULT_WORK_SCHEDULE_ID));
    }

    /** Sem cor definida: a cor e escolha do cliente e a UI ja trata coluna sem cor. */
    private void seedAdmissionKanbanColumns(String schema) {
        if (!tableExists(schema, "admission_process_kanban_column")) {
            return;
        }
        if (hasRows(schema, "admission_process_kanban_column")) {
            return;
        }

        jdbcTemplate.update(
                """
                INSERT INTO "%s".admission_process_kanban_column (
                    id, code, status, column_key, name, display_order, created_at
                )
                SELECT
                    gen_random_uuid(),
                    ROW_NUMBER() OVER (ORDER BY d.display_order),
                    'ACTIVE',
                    d.column_key,
                    d.name,
                    d.display_order,
                    now()
                FROM (
                    VALUES
                        ('resume_analysis', 'Análise de Currículo', 10),
                        ('cultural_fit', 'Fit Cultural', 20),
                        ('behavioral_assessment', 'Avaliação Comportamental', 30),
                        ('initial_interview', 'Entrevista Inicial', 40),
                        ('manager_interview', 'Entrevista Com Gestor', 50),
                        ('pre_approval', 'Pré-aprovação', 60),
                        ('hiring', 'Contratação', 70)
                ) AS d(column_key, name, display_order)
                """
                        .formatted(schema));
    }

    /** Coluna de sistema "Encerrados": so recebe cards pelo encerramento com motivo e nao pode ser excluida. */
    private void seedRejectedKanbanColumn(String schema) {
        if (!tableExists(schema, "admission_process_kanban_column")
                || !columnExists(schema, "admission_process_kanban_column", "system_column")) {
            return;
        }
        if (columnExists(schema, "admission_process_kanban_column", "sla_enabled")) {
            jdbcTemplate.update(
                    """
                    UPDATE "%1$s".admission_process_kanban_column
                    SET name = 'Encerrados', column_key = 'closed', sla_enabled = false
                    WHERE LOWER(column_key) = 'rejected' AND status <> 'DELETED'
                    """
                            .formatted(schema));
        }
        String slaColumns = columnExists(schema, "admission_process_kanban_column", "sla_enabled")
                ? ", sla_enabled, sla_business_days"
                : "";
        String slaValues = columnExists(schema, "admission_process_kanban_column", "sla_enabled")
                ? ", false, 5"
                : "";
        jdbcTemplate.update(
                """
                INSERT INTO "%1$s".admission_process_kanban_column (
                    id, code, status, column_key, name, color, display_order, system_column%2$s, created_at
                )
                SELECT gen_random_uuid(),
                       COALESCE((SELECT MAX(code) FROM "%1$s".admission_process_kanban_column), 0) + 1,
                       'ACTIVE', 'closed', 'Encerrados', '#DC2626', 1000, true%3$s, now()
                WHERE NOT EXISTS (
                    SELECT 1 FROM "%1$s".admission_process_kanban_column
                    WHERE LOWER(column_key) = 'closed' AND status <> 'DELETED'
                )
                """
                        .formatted(schema, slaColumns, slaValues));
    }

    private boolean columnExists(String schema, String table, String column) {
        Boolean exists = jdbcTemplate.queryForObject(
                """
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = ? AND table_name = ? AND column_name = ?
                )
                """,
                Boolean.class,
                schema,
                table,
                column);
        return Boolean.TRUE.equals(exists);
    }

    private void seedSystemSettings(String schema) {
        if (!tableExists(schema, "system_setting") || !tableExists("public", "system_setting")) {
            return;
        }

        jdbcTemplate.update(
                """
                INSERT INTO "%s".system_setting (
                    id, code, status, setting_key, setting_value, description, created_at
                )
                SELECT
                    s.id, s.code, s.status, s.setting_key, s.setting_value, s.description, now()
                FROM public.system_setting s
                WHERE s.status <> 'DELETED'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "%s".system_setting t
                      WHERE t.setting_key = s.setting_key
                        AND t.status <> 'DELETED'
                  )
                ON CONFLICT (id) DO NOTHING
                """
                        .formatted(schema, schema));
    }

    private void seedExitInterviewReturnChecklistItems(String schema) {
        if (!tableExists(schema, "exit_interview_return_checklist_item")
                || !tableExists("public", "exit_interview_return_checklist_item")) {
            return;
        }

        jdbcTemplate.update(
                """
                INSERT INTO "%s".exit_interview_return_checklist_item (
                    id, status, item_key, description, display_order, code, created_at
                )
                SELECT p.id, p.status, p.item_key, p.description, p.display_order, p.code, now()
                FROM public.exit_interview_return_checklist_item p
                WHERE p.status <> 'DELETED'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "%s".exit_interview_return_checklist_item t
                      WHERE LOWER(t.item_key) = LOWER(p.item_key)
                        AND t.status <> 'DELETED'
                  )
                ON CONFLICT (id) DO NOTHING
                """
                        .formatted(schema, schema));
    }

    private void seedPayrollEvents(String schema) {
        if (!tableExists(schema, "payroll_event") || !tableExists("public", "payroll_event")) {
            return;
        }

        jdbcTemplate.update(
                """
                INSERT INTO "%s".payroll_event (
                    id, status, event_code, description, event_type,
                    incides_inss, incides_fgts, incides_irrf, formula, code, created_at
                )
                SELECT
                    p.id, p.status, p.event_code, p.description, p.event_type,
                    p.incides_inss, p.incides_fgts, p.incides_irrf, p.formula, p.code, now()
                FROM public.payroll_event p
                WHERE p.status <> 'DELETED'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "%s".payroll_event t
                      WHERE t.event_code = p.event_code
                        AND t.status <> 'DELETED'
                  )
                ON CONFLICT (id) DO NOTHING
                """
                        .formatted(schema, schema));
    }

    private void seedDevelopmentPlanCatalog(String schema) {
        seedProficiencyLevels(schema);
        seedEvidenceTypes(schema);
        seedDevelopmentPlanOrigins(schema);
    }

    private void seedEsocialTable27Procedures(String schema) {
        if (!tableExists(schema, "esocial_table27_procedure")
                || !tableExists("public", "esocial_table27_procedure")) {
            return;
        }

        jdbcTemplate.update(
                """
                INSERT INTO "%s".esocial_table27_procedure (
                    id, code, status, procedure_code, description, active, created_at
                )
                SELECT p.id, p.code, p.status, p.procedure_code, p.description, p.active, now()
                FROM public.esocial_table27_procedure p
                WHERE p.status <> 'DELETED'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "%s".esocial_table27_procedure t
                      WHERE t.id = p.id
                         OR (t.procedure_code = p.procedure_code AND t.status <> 'DELETED')
                  )
                ON CONFLICT (id) DO NOTHING
                """
                        .formatted(schema, schema));
    }

    private void seedProficiencyLevels(String schema) {
        if (!tableExists(schema, "proficiency_level") || !tableExists("public", "proficiency_level")) {
            return;
        }

        jdbcTemplate.update(
                """
                INSERT INTO "%s".proficiency_level (
                    id, code, status, name, description, level_order, weight, created_at
                )
                SELECT p.id, p.code, p.status, p.name, p.description, p.level_order, p.weight, now()
                FROM public.proficiency_level p
                WHERE p.status <> 'DELETED'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "%s".proficiency_level t
                      WHERE LOWER(t.name) = LOWER(p.name)
                        AND t.status <> 'DELETED'
                  )
                ON CONFLICT (id) DO NOTHING
                """
                        .formatted(schema, schema));
    }

    private void seedEvidenceTypes(String schema) {
        if (!tableExists(schema, "evidence_type") || !tableExists("public", "evidence_type")) {
            return;
        }

        jdbcTemplate.update(
                """
                INSERT INTO "%s".evidence_type (
                    id, code, status, name, description, requires_file, allows_link, created_at
                )
                SELECT
                    e.id, e.code, e.status, e.name, e.description, e.requires_file, e.allows_link, now()
                FROM public.evidence_type e
                WHERE e.status <> 'DELETED'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "%s".evidence_type t
                      WHERE LOWER(t.name) = LOWER(e.name)
                        AND t.status <> 'DELETED'
                  )
                ON CONFLICT (id) DO NOTHING
                """
                        .formatted(schema, schema));
    }

    private void seedDocumentTypes(String schema) {
        if (!tableExists(schema, "document_type") || !tableExists("public", "document_type")) {
            return;
        }

        jdbcTemplate.update(
                """
                INSERT INTO "%s".document_type (
                    id, code, status, type_code, name, description, data_class,
                    contexts, system_managed, sort_order, created_at
                )
                SELECT
                    p.id, p.code, p.status, p.type_code, p.name, p.description, p.data_class,
                    p.contexts, p.system_managed, p.sort_order, now()
                FROM public.document_type p
                WHERE p.status <> 'DELETED'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "%s".document_type t
                      WHERE LOWER(t.type_code) = LOWER(p.type_code)
                        AND t.status <> 'DELETED'
                  )
                ON CONFLICT (id) DO NOTHING
                """
                        .formatted(schema, schema));
    }

    private void seedDevelopmentPlanOrigins(String schema) {
        if (!tableExists(schema, "development_plan_origin") || !tableExists("public", "development_plan_origin")) {
            return;
        }

        jdbcTemplate.update(
                """
                INSERT INTO "%s".development_plan_origin (
                    id, code, status, name, description, created_at
                )
                SELECT o.id, o.code, o.status, o.name, o.description, now()
                FROM public.development_plan_origin o
                WHERE o.status <> 'DELETED'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "%s".development_plan_origin t
                      WHERE LOWER(t.name) = LOWER(o.name)
                        AND t.status <> 'DELETED'
                  )
                ON CONFLICT (id) DO NOTHING
                """
                        .formatted(schema, schema));
    }

    private boolean hasRows(String schema, String table) {
        Integer existing = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM \"" + schema + "\"." + table + " WHERE status <> 'DELETED'", Integer.class);
        return existing != null && existing > 0;
    }

    private boolean tableExists(String schema, String table) {
        Boolean exists = jdbcTemplate.queryForObject(
                """
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = ? AND table_name = ?
                )
                """,
                Boolean.class,
                schema,
                table);
        return Boolean.TRUE.equals(exists);
    }
}
