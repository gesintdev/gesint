# Gestão de Ponto (GP)

Sistema do rail (sigla **GP**, ícone impressão digital) que acompanha a jornada. Ele **lê** o cadastro que já
existe e **não edita**:

| Dado | Dono | Como o GP usa |
|---|---|---|
| Colaboradores, cargo, departamento, filial | DP / RH | Quadro apurado: admissão concluída, ativo, não desligado |
| Escala (`work_schedule`) | CFG › Escalas | Jornada prevista do dia, horário de entrada e saída |
| Férias e afastamentos (`leave_request` aprovados) | RH / DP | Dia abonado (férias, atestado, licença) ou falta injustificada |
| Feriados nacionais | `BrazilianBusinessCalendar` | Dia sem jornada; horas trabalhadas viram crédito |

Código: frontend `gesint-frontend/src/modules/gp/`, backend `br.com.gesint.modules.gp`.

## Menu

| Seção | Tela | Rota | Permissão |
|---|---|---|---|
| — | Painel (aba fixa) | `/dashboard` com o GP ativo | `attendance:read` |
| Gestão de ponto | Controle de ponto | `/attendance` | `attendance:read` |
| | Solicitações de ajuste | `/attendance/requests` | `attendance:read` (decidir: `attendance:write`) |
| | Banco de horas | `/attendance/hour-bank` | `hourbank:read` |
| | Espelho de ponto | `/attendance/timesheets` | `timesheet:read` (fechar/reabrir: `timesheet:write`, PDF: `timesheet:export`) |
| | Agenda de ausências | `/attendance/calendar` | `attendance:read` |
| Relatórios | Status dos colaboradores | `/attendance/status` | `attendance:read` |
| Configurações | Preferências de ponto | `/attendance/settings` | `attendance:read` (salvar: `attendance:write`) |

Perfil de sistema: **Administrador Gestão de Ponto** (`role_type = ADMIN`, `system = PONTO`, authority `ADM:PONTO`)
cobre `attendance`, `hourbank`, `timesheet`, `notification`, `agenda` e `storage`. Produto comercial: chave `GP` em
`admin.product_system`.

O registro do próprio ponto (relógio do cabeçalho, Gesint Tick, página pública) exige só autenticação; `attendance:write`
é do gestor e não é mais concedido automaticamente a todo usuário.

## Apuração do dia

Fonte única: `AttendanceDayEvaluator` (lógica pura, testada em `AttendanceDayEvaluatorTest`), alimentado por
`AttendanceEvaluationService`. Painel, grid, banco de horas, espelho, relatórios e avisos usam o mesmo resultado.

1. **Prevista** = períodos da escala no dia da semana (0 em folga). Sem escala vinculada na admissão, usa a carga
   textual da admissão nos dias úteis (40h = 8h; 44h = 8h48; 12x36 = 12h).
2. **Trabalhada** = (saída − entrada) − intervalo. Jornada que passa da meia-noite soma 24h.
3. **Situação** do dia:

| Situação | Regra |
|---|---|
| Completo | entrada e saída registradas (e intervalo fechado, se houver) |
| Incompleto | dia passado com marcação faltando; não inventa horas |
| Sem registro | dia de trabalho passado sem marcação e sem justificativa |
| Em andamento | hoje, jornada aberta (não mexe no saldo até fechar) |
| Folga / Feriado | sem jornada prevista; trabalho nesses dias é crédito integral |
| Férias / Afastamento | abonado: nem crédito nem débito |
| Falta | afastamento do tipo falta injustificada: débito da jornada |

4. **Tolerância** (Preferências, padrão 10 min, máximo 60): variação diária até a tolerância não gera saldo
   (CLT, art. 58, § 1º). Atraso e saída antecipada só viram alerta acima dela.
5. **Destino do saldo** (Preferências):
   - Banco de horas ligado: diferença positiva é crédito e negativa é débito no banco. Só vira hora extra paga o que o
     RH aprovar como "Hora extra" na solicitação de ponto fora da escala.
   - Banco desligado e horas extras ligadas: diferença positiva é hora extra; negativa é falta de horas.
6. **Alertas** do dia: acima de 10h trabalhadas; mais de 2h além da jornada (art. 59); jornada acima de 6h sem
   intervalo ou com intervalo menor que 1h (art. 71); bloco contínuo acima de 6h; descanso menor que 11h desde a
   jornada anterior (art. 66); atraso; saída antecipada; ajuste aguardando decisão.
7. **Pendência** = incompleto, sem registro ou ajuste aguardando decisão. É o número da coluna Pendências.

## Banco de horas

Saldo derivado, sem lançamento editável: soma dos saldos diários desde o **início da apuração** (Preferências; padrão
1º de janeiro do ano corrente). Corrige-se o saldo corrigindo o ponto. A grid do Controle de ponto mostra o saldo
acumulado até o fim do período: `+08h23` em verde, `-08h23` em vermelho.

O livro-razão com vigência, compensação e fechamento descrito em `docs/analise/plano-banco-de-horas-2026-08-26.md`
continua como evolução; o saldo derivado é compatível com ele (a apuração diária é a fonte dos lançamentos).

## Espelho de ponto

Documento por colaborador e período (`attendance_timesheet`) com ciclo:

- **Aberto**: marcações podem ser ajustadas.
- **Fechado**: guarda os totais do momento e trava criar, editar, excluir e aprovar ajuste de ponto em qualquer dia do
  período (`ATTENDANCE_PERIOD_CLOSED`). Só fecha sem pendência (`TIMESHEET_HAS_PENDING`); o fechamento em lote fecha
  quem está em dia e informa quem ficou aberto.
- **Reabrir** exige motivo, registrado na trilha de auditoria (`REOPEN`). Fechar grava `CLOSE`; gerar o PDF grava
  `EXPORT`.

PDF (OpenPDF, `TimesheetPdfRenderer`): empregador e CNPJ, situação (prévia aberta ou fechado em), identificação, faixa de
totais, tabela diária com situação e alertas, banco de horas (saldo anterior, gerado, final), limites da CLT no
período, nota da regra de tolerância e campos de assinatura.

## Avisos

| Aviso | Quando | Para quem | Canal |
|---|---|---|---|
| Ponto de ontem precisa de atenção | diário 07:30 (`gesint.attendance.health.cron`) | colaborador com usuário vinculado | sino; e-mail se ligado |
| Saúde do ponto em dd/mm | diário 07:30 | caixa do RH, por filial | sino; e-mail para os destinatários do resumo |
| Perto de 10 horas / hora de fazer o intervalo | a cada 15 min, 05h–23h (`gesint.attendance.near-limits.cron`) | colaborador | sino |
| Ajuste de ponto pendente | de hora em hora (`gesint.notifications.refresh.cron`) e ao abrir o sino | caixa do RH | sino |
| Ajuste aprovado / recusado | na decisão | colaborador | sino |
| Férias a vencer | de hora em hora | caixa do RH | sino |

Cada aviso tem chave única (tipo, referência, dia): o job reenvia atualizando a mesma notificação, sem duplicar. O RH
pode disparar o resumo de ontem em Preferências de ponto › "Enviar avisos de ontem agora".

E-mail usa o SMTP da plataforma (Admin › E-mail). Sem SMTP configurado, os avisos ficam só no sino.

## Notificações: regras de acesso

- A caixa do RH (`recipient_user_id` nulo) só aparece para quem tem `attendance:read`, `leave:read`,
  `collaborator:read`, `admission:read` ou `jobvacancyapplication:read` (ou admin). `notification:read`, que todo
  usuário vinculado a colaborador recebe para a caixa pessoal, não basta.
- Alterar o prazo de "férias a vencer" exige `notification:write` e acesso à caixa do RH.
- Notificação criada por job recebe a filial do colaborador (ou da candidatura); sem filial ela ficava invisível no sino.
