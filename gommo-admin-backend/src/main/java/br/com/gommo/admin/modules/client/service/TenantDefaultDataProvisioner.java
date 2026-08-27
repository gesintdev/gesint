package br.com.gommo.admin.modules.client.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Cadastros minimos que todo tenant precisa ter no primeiro acesso: escala de trabalho padrao,
 * colunas do kanban de admissao e o RBAC de dominio (permissoes + perfis Administrador por sistema).
 *
 * Diferente dos seeds de payroll_event/checklist, escala e kanban nao sao copiados de public: o
 * schema template acumula ajustes do ambiente (cores escolhidas por usuario, escalas de teste) que
 * nao devem vazar para um cliente novo. Os valores ficam explicitos aqui.
 *
 * A operacao e idempotente e roda tanto no provisionamento quanto na sincronizacao dos tenants ja
 * existentes.
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
