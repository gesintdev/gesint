"use client";

import clsx from "clsx";
import { Plus, RefreshCw } from "lucide-react";
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    permissionsForSystem,
    useSessionPermissions,
    useSessionSystemPermissions,
} from "@/shared/auth/permissions";
import { canAccessExtraTab, canWriteRoute, type RoutePublicAccess } from "@/shared/auth/route-access";
import {
    QueryRefreshHostProvider,
    useQueryRefresh,
} from "@/shared/components/data/QueryRefreshContext";
import { CrudFormDirtyProvider } from "@/shared/components/crud/CrudFormDirtyContext";
import { Button } from "@/shared/components/ui/Button";
import { useActiveBranch } from "@/shared/context/ActiveBranchContext";
import { useOptionalActiveSystem } from "@/shared/context/ActiveSystemContext";
import { confirmDiscardUnsavedChanges } from "@/shared/workspace/dirty-tab-guard";
import { useTabbedCrudConfigOptional } from "@/shared/workspace/TabbedCrudConfigContext";
import { useWorkspaceNavigation } from "@/shared/workspace/useWorkspaceNavigation";
import { useWorkspaceStore } from "@/shared/workspace/workspace.store";
import { findRouteById } from "@/shared/workspace/workspace-routes";
import { isModuleListTab } from "@/shared/workspace/workspace-tab-id";
import { useWorkspaceTabOptional } from "@/shared/workspace/WorkspaceTabContext";

export const CRUD_TAB_LIST = "list";
export const CRUD_TAB_FORM = "form";

export type CrudExtraTab = {
    id: string;
    label: string;
    content: ReactNode;
    permission?: string;
    publicAccess?: RoutePublicAccess;
    badge?: number;
    /** Só exibe a aba quando há registro em edição (ex.: histórico do colaborador). */
    visibleWhenEditing?: boolean;
    /** Aba visível, mas não clicável (ex.: processo sem candidato selecionado). */
    disabled?: boolean;
    /**
     * Posição na régua de abas.
     * - leading: antes da Listagem
     * - afterList: entre Listagem e Cadastro
     * - trailing (padrão): depois de Listagem/Cadastro
     */
    placement?: CrudExtraTabPlacement;
    /**
     * Abre esta aba no lugar da Listagem ao entrar no módulo. Só vale na entrada pela listagem:
     * link direto para um registro continua abrindo o formulário.
     */
    initial?: boolean;
};

export type CrudExtraTabPlacement = "leading" | "afterList" | "trailing";

type CrudScreenContextValue = {
    activeTab: string;
    editingId: string | null;
    isEditing: boolean;
    /** Volta à listagem com confirmação se houver alterações não salvas (cancelar, etc.). */
    goToList: () => void | Promise<void>;
    /** Volta à listagem após salvar — sem confirmação de descarte. */
    returnToList: () => void;
    goToForm: () => void;
    goToTab: (tabId: string) => void | Promise<void>;
    startCreate: () => void | Promise<void>;
    /**
     * Abre o formulário em edição.
     * `skipDirtyCheck` evita o modal de descarte (ex.: save parcial que continua na mesma sessão).
     */
    startEdit: (
        id: string,
        record?: object,
        options?: { skipDirtyCheck?: boolean },
    ) => void | Promise<void>;
};

const CrudScreenContext = createContext<CrudScreenContextValue | null>(null);
const CrudExtraTabsSetterContext = createContext<((tabs: CrudExtraTab[] | null) => void) | null>(null);
const CrudListToolbarSetterContext = createContext<((content: ReactNode | null) => void) | null>(
    null,
);

export function useCrudScreen(): CrudScreenContextValue {
    const ctx = useContext(CrudScreenContext);
    if (!ctx) throw new Error("useCrudScreen deve ser usado dentro de CrudScreen");
    return ctx;
}

/** Escopo aninhado de CRUD (ex.: formulário de outro módulo dentro de uma aba extra). */
export function CrudScreenScope({
    value,
    children,
}: {
    value: CrudScreenContextValue;
    children: ReactNode;
}) {
    return <CrudScreenContext.Provider value={value}>{children}</CrudScreenContext.Provider>;
}

/** Publica abas extras dinâmicas a partir do `editingId` interno do CrudScreen. */
export function useCrudExtraTabs(tabs: CrudExtraTab[] | null) {
    const setExtraTabs = useContext(CrudExtraTabsSetterContext);
    if (!setExtraTabs) throw new Error("useCrudExtraTabs deve ser usado dentro de CrudScreen");
    // Layout: a aba precisa existir no CrudScreen antes de efeitos que chamam goToTab.
    useLayoutEffect(() => {
        setExtraTabs(tabs);
    }, [setExtraTabs, tabs]);
    useLayoutEffect(() => {
        return () => setExtraTabs(null);
    }, [setExtraTabs]);
}

/** Publica conteúdo à esquerda da toolbar da listagem (ex.: filtros de período). */
export function useCrudListToolbar(content: ReactNode | null) {
    const setListToolbarContent = useContext(CrudListToolbarSetterContext);
    if (!setListToolbarContent) {
        throw new Error("useCrudListToolbar deve ser usado dentro de CrudScreen");
    }
    useLayoutEffect(() => {
        setListToolbarContent(content);
    }, [setListToolbarContent, content]);
    useLayoutEffect(() => {
        return () => setListToolbarContent(null);
    }, [setListToolbarContent]);
}

export type CrudScreenProps = {
    list: ReactNode;
    form: ReactNode;
    extraTabs?: CrudExtraTab[];
    /**
     * Host montado dentro do CrudScreen (com acesso a `useCrudScreen` / `useCrudExtraTabs`)
     * para publicar abas extras com base no registro em edição.
     */
    extraTabsController?: ReactNode;
    listTabLabel?: string;
    formTabLabel?: string;
    formTabLabelEdit?: string;
    /** Cadastro direto bloqueado no backend — entrada via admissão. */
    editOnly?: boolean;
    /** Botão principal da listagem (ex.: Nova Admissão) no lugar de “Novo cadastro”. */
    listPrimaryAction?: ReactNode;
    listToolbar?: ReactNode;
    showListToFormButton?: boolean;
    listToFormLabel?: string;
    writePermission?: string;
    defaultTab?: string;
    initialEditingId?: string | null;
    /** Sincroniza título da aba do módulo e URL ao alternar listagem/cadastro. */
    workspaceEnabled?: boolean;
    /**
     * Listagem em painel (colunas com scroll próprio): contem o overflow no card
     * em vez de scroll da página inteira.
     */
    listContained?: boolean;
};

function CrudListToolbarActions({
    canWrite,
    showListToFormButton,
    listToFormLabel,
    listPrimaryAction,
    onStartCreate,
}: {
    canWrite: boolean;
    showListToFormButton: boolean;
    listToFormLabel: string;
    listPrimaryAction?: ReactNode;
    onStartCreate: () => void | Promise<void>;
}) {
    const queryRefresh = useQueryRefresh();

    return (
        <div className="flex shrink-0 items-center gap-2">
            {queryRefresh ? (
                <Button
                    size="sm"
                    aria-label="Atualizar lista"
                    className="gommo-btn--icon-only"
                    disabled={queryRefresh.isFetching}
                    onClick={() => queryRefresh.refetch()}
                    leftIcon={
                        <RefreshCw
                            className={clsx("size-3.5", queryRefresh.isFetching && "animate-spin")}
                            strokeWidth={2.25}
                        />
                    }
                />
            ) : null}
            {showListToFormButton && canWrite ? (
                <Button
                    size="sm"
                    leftIcon={<Plus className="size-3.5" strokeWidth={2.5} />}
                    onClick={() => void onStartCreate()}
                >
                    {listToFormLabel}
                </Button>
            ) : (
                listPrimaryAction
            )}
        </div>
    );
}

export function CrudScreen({
    list,
    form,
    extraTabs = [],
    extraTabsController = null,
    listTabLabel = "Listagem",
    formTabLabel = "Cadastro",
    formTabLabelEdit = "Editar",
    listToolbar,
    showListToFormButton = true,
    editOnly = false,
    listPrimaryAction,
    listToFormLabel = "Novo cadastro",
    writePermission,
    defaultTab = CRUD_TAB_LIST,
    initialEditingId = null,
    workspaceEnabled = false,
    listContained = false,
}: CrudScreenProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [editingId, setEditingId] = useState<string | null>(initialEditingId);
    const [formEpoch, setFormEpoch] = useState(0);
    const [overrideExtraTabs, setOverrideExtraTabs] = useState<CrudExtraTab[] | null>(null);
    const [listToolbarContent, setListToolbarContent] = useState<ReactNode | null>(null);
    const [initialExtraTabResolved, setInitialExtraTabResolved] = useState(false);
    const hadExtraTabsRef = useRef(false);
    const flatPermissions = useSessionPermissions();
    const systemPermissions = useSessionSystemPermissions();
    const activeSystemCtx = useOptionalActiveSystem();
    const activeSystem = activeSystemCtx?.activeSystem;
    const isSettingsMode = Boolean(activeSystemCtx?.isSettingsMode);
    /** Flat + escopo do rail (ou CFG em modo Configuracoes). Wildcard {@code *} = GLOBAL_ADMIN. */
    const permissions = useMemo(() => {
        if (!systemPermissions) return flatPermissions;
        if (flatPermissions.includes("*")) return flatPermissions;

        const scopeKey = isSettingsMode ? ("CFG" as const) : activeSystem;
        if (!scopeKey) return flatPermissions;

        const scoped = permissionsForSystem(flatPermissions, systemPermissions, scopeKey);
        if (scoped.includes("*")) return scoped;
        return Array.from(new Set([...flatPermissions, ...scoped]));
    }, [activeSystem, flatPermissions, isSettingsMode, systemPermissions]);
    const { activeBranchId } = useActiveBranch();
    const crudConfig = useTabbedCrudConfigOptional();
    const workspaceTabCtx = useWorkspaceTabOptional();
    const { syncCrudUrl } = useWorkspaceNavigation();
    const clearTitleSuffix = useWorkspaceStore((s) => s.clearTitleSuffix);
    const setTitleSuffix = useWorkspaceStore((s) => s.setTitleSuffix);
    const isEditing = editingId != null;
    const workspaceRoute = workspaceTabCtx ? findRouteById(workspaceTabCtx.tab.routeId) : undefined;
    const canWrite = canWriteRoute(workspaceRoute, permissions, writePermission);
    const formSessionActive = canWrite && (isEditing || activeTab === CRUD_TAB_FORM);
    const isListInstance = workspaceTabCtx == null || isModuleListTab(workspaceTabCtx.tab.entityKey);
    const syncWorkspace = useCallback(
        (crud: { editingId?: string | null; isNew?: boolean; titleSuffix?: string | null }) => {
            if (!workspaceEnabled || !crudConfig || !workspaceTabCtx) return;
            const tabId = workspaceTabCtx.tab.id;
            if (!isListInstance) return;
            if (crud.titleSuffix) setTitleSuffix(tabId, crud.titleSuffix);
            else clearTitleSuffix(tabId);
            syncCrudUrl(tabId, { editingId: crud.editingId, isNew: crud.isNew });
        },
        [clearTitleSuffix, crudConfig, isListInstance, setTitleSuffix, syncCrudUrl, workspaceEnabled, workspaceTabCtx],
    );
    const resolvedExtraTabs = overrideExtraTabs ?? extraTabs;
    const visibleExtraTabs = useMemo(
        () =>
            resolvedExtraTabs.filter((tab) => {
                if (tab.visibleWhenEditing && !isEditing) return false;
                return canAccessExtraTab(tab, permissions);
            }),
        [isEditing, permissions, resolvedExtraTabs],
    );
    const tabs = useMemo(() => {
        const toItem = (t: CrudExtraTab) => ({
            id: t.id,
            label: t.label,
            badge: t.badge,
            disabled: t.disabled,
        });
        const items: { id: string; label: string; badge?: number; disabled?: boolean }[] = [
            ...visibleExtraTabs.filter((t) => t.placement === "leading").map(toItem),
            { id: CRUD_TAB_LIST, label: listTabLabel },
            ...visibleExtraTabs.filter((t) => t.placement === "afterList").map(toItem),
        ];
        const showFormTab = canWrite && (!editOnly || isEditing || activeTab === CRUD_TAB_FORM);
        if (showFormTab) {
            items.push({
                id: CRUD_TAB_FORM,
                label: isEditing ? formTabLabelEdit : formTabLabel,
            });
        }
        items.push(
            ...visibleExtraTabs
                .filter((t) => t.placement !== "leading" && t.placement !== "afterList")
                .map(toItem),
        );
        return items;
    }, [activeTab, canWrite, editOnly, formTabLabel, formTabLabelEdit, isEditing, listTabLabel, visibleExtraTabs]);
    const confirmDiscardFormChanges = useCallback(async (): Promise<boolean> => {
        const tabId = workspaceTabCtx?.tab.id;
        if (!tabId) return true;
        return confirmDiscardUnsavedChanges(tabId);
    }, [workspaceTabCtx?.tab.id]);
    const resetToList = useCallback(() => {
        setEditingId(null);
        setActiveTab(CRUD_TAB_LIST);
        syncWorkspace({});
    }, [syncWorkspace]);
    const returnToList = useCallback(() => {
        resetToList();
    }, [resetToList]);
    const goToList = useCallback(async () => {
        if (!(await confirmDiscardFormChanges())) return;
        resetToList();
    }, [confirmDiscardFormChanges, resetToList]);
    const goToForm = useCallback(() => setActiveTab(CRUD_TAB_FORM), []);
    const startCreate = useCallback(async () => {
        if (editOnly || !canWrite) return;
        if (formSessionActive && !(await confirmDiscardFormChanges())) return;
        setEditingId(null);
        setFormEpoch((n) => n + 1);
        setActiveTab(CRUD_TAB_FORM);
        syncWorkspace({ isNew: true });
    }, [canWrite, confirmDiscardFormChanges, editOnly, formSessionActive, syncWorkspace]);
    const startEdit = useCallback(
        async (id: string, record?: object, options?: { skipDirtyCheck?: boolean }) => {
            if (!canWrite) return;
            if (
                !options?.skipDirtyCheck &&
                editingId !== id &&
                !(await confirmDiscardFormChanges())
            ) {
                return;
            }
            const titleSuffix =
                crudConfig?.fieldTabName && record
                    ? String((record as Record<string, unknown>)[crudConfig.fieldTabName] ?? "")
                    : undefined;
            setEditingId(id);
            setActiveTab(CRUD_TAB_FORM);
            syncWorkspace({
                editingId: id,
                titleSuffix: titleSuffix || undefined,
            });
        },
        [canWrite, confirmDiscardFormChanges, crudConfig, editingId, syncWorkspace],
    );
    /**
     * Troca de aba interna nao descarta o formulario (ele permanece montado).
     * Confirmacao de dirty fica para Cancelar/goToList, Novo cadastro, troca de registro,
     * fechar aba do workspace e troca de filial.
     */
    const goToTab = useCallback(async (tabId: string) => {
        setActiveTab(tabId);
    }, []);
    const prevBranchIdRef = useRef<string | null>(null);

    // A aba do modulo (ex.: job-positions::list) permanece montada ao trocar de filial; sem isso o
    // editingId interno sobrevive e o formulario continua apontando para registro da filial anterior.
    useLayoutEffect(() => {
        const previous = prevBranchIdRef.current;
        prevBranchIdRef.current = activeBranchId;
        if (previous != null && activeBranchId != null && previous !== activeBranchId) {
            resetToList();
        }
    }, [activeBranchId, resetToList]);

    useEffect(() => {
        if (!canWrite && activeTab === CRUD_TAB_FORM) {
            setActiveTab(CRUD_TAB_LIST);
        }
    }, [activeTab, canWrite]);

    // Abas extras chegam depois da montagem, entao a aba inicial e escolhida quando elas aparecem.
    // Roda uma vez so: sem isso, cada clique em Listagem seria desfeito pelo proprio efeito.
    useEffect(() => {
        if (initialExtraTabResolved) return;
        if (defaultTab !== CRUD_TAB_LIST || isEditing) {
            setInitialExtraTabResolved(true);
            return;
        }
        const initialTab = visibleExtraTabs.find((tab) => tab.initial && !tab.disabled);
        if (!initialTab) return;
        setInitialExtraTabResolved(true);
        setActiveTab((current) => (current === CRUD_TAB_LIST ? initialTab.id : current));
    }, [defaultTab, initialExtraTabResolved, isEditing, visibleExtraTabs]);

    useEffect(() => {
        if (visibleExtraTabs.length > 0) hadExtraTabsRef.current = true;
    }, [visibleExtraTabs]);

    useEffect(() => {
        const isCoreTab = activeTab === CRUD_TAB_LIST || activeTab === CRUD_TAB_FORM;
        if (isCoreTab) return;
        const activeExtra = visibleExtraTabs.find((tab) => tab.id === activeTab);
        if (activeExtra && !activeExtra.disabled) return;
        // Lista vazia e ambigua: pode ser o estado antes das abas extras serem publicadas (voltar
        // para Listagem daria bounce) ou a ultima aba extra tendo sumido, por troca de sistema ou de
        // permissao. So o segundo caso precisa de fallback, e o ref distingue os dois.
        if (visibleExtraTabs.length === 0 && !hadExtraTabsRef.current) return;
        setActiveTab(isEditing && canWrite ? CRUD_TAB_FORM : CRUD_TAB_LIST);
    }, [activeTab, canWrite, isEditing, visibleExtraTabs]);

    const ctx = useMemo(
        () => ({
            activeTab,
            editingId,
            isEditing,
            goToList,
            returnToList,
            goToForm,
            startCreate,
            startEdit,
            goToTab,
        }),
        [activeTab, editingId, goToForm, goToList, goToTab, isEditing, returnToList, startCreate, startEdit],
    );
    const extraTabPanel = visibleExtraTabs.find((t) => t.id === activeTab)?.content ?? null;

    return (
        <CrudScreenContext.Provider value={ctx}>
            <CrudExtraTabsSetterContext.Provider value={setOverrideExtraTabs}>
            <CrudListToolbarSetterContext.Provider value={setListToolbarContent}>
                <CrudFormDirtyProvider>
                <QueryRefreshHostProvider>
                    {extraTabsController}
                    <div className="flex min-h-0 flex-1 flex-col">
                        <div className="gommo-crud-tablist" role="tablist" aria-label="Seções do cadastro">
                            {tabs.map((tab) => {
                                const selected = activeTab === tab.id;
                                const disabled = Boolean(tab.disabled);
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={selected}
                                        aria-controls={`crud-panel-${tab.id}`}
                                        id={`crud-tab-${tab.id}`}
                                        disabled={disabled}
                                        onClick={() => {
                                            if (disabled) return;
                                            if (tab.id === CRUD_TAB_LIST) {
                                                // Só troca a aba; nao limpa editingId (Cancelar/Salvar usam goToList/returnToList).
                                                void goToTab(CRUD_TAB_LIST);
                                                return;
                                            }
                                            if (tab.id === CRUD_TAB_FORM) {
                                                if (!canWrite) return;
                                                if (editOnly && !editingId) return;
                                                void (async () => {
                                                    await goToTab(CRUD_TAB_FORM);
                                                    if (workspaceEnabled && !editingId && !editOnly) {
                                                        syncWorkspace({ isNew: true });
                                                    }
                                                })();
                                                return;
                                            }
                                            void goToTab(tab.id);
                                        }}
                                        className={clsx(
                                            "gommo-crud-tab",
                                            selected && "gommo-crud-tab--active",
                                            disabled && "gommo-crud-tab--disabled",
                                        )}
                                    >
                                        <span>{tab.label}</span>
                                        {tab.badge != null && tab.badge > 0 ? (
                                            <span className="gommo-crud-tab-badge">{tab.badge}</span>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                        <div
                            id={`crud-panel-${activeTab}`}
                            role="tabpanel"
                            aria-labelledby={`crud-tab-${activeTab}`}
                            className="flex min-h-0 flex-1 flex-col overflow-hidden"
                        >
                            {activeTab === CRUD_TAB_LIST && (
                                <div className="crud-list-toolbar flex flex-wrap items-center justify-between gap-2 border-b px-4 py-1.5">
                                    <div className="min-w-0 flex-1">
                                        {listToolbarContent ?? (
                                            <div className="text-[13px] text-base-content/50">
                                                {listToolbar ??
                                                    "Consulte os registros ou inicie um novo cadastro."}
                                            </div>
                                        )}
                                    </div>
                                    <CrudListToolbarActions
                                        canWrite={canWrite}
                                        showListToFormButton={showListToFormButton}
                                        listToFormLabel={listToFormLabel}
                                        listPrimaryAction={listPrimaryAction}
                                        onStartCreate={startCreate}
                                    />
                                </div>
                            )}
                            <div
                                className={clsx(
                                    "min-h-0 flex-1",
                                    activeTab === CRUD_TAB_LIST && !listContained
                                        ? "overflow-y-auto"
                                        : "flex flex-col overflow-hidden",
                                )}
                            >
                                <div
                                    className={clsx(
                                        "min-h-0 flex-1 flex-col",
                                        activeTab === CRUD_TAB_LIST ? "flex" : "hidden",
                                        listContained && "overflow-hidden",
                                    )}
                                    aria-hidden={activeTab !== CRUD_TAB_LIST}
                                >
                                    {list}
                                </div>
                                {activeTab !== CRUD_TAB_LIST && activeTab !== CRUD_TAB_FORM ? (
                                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                                        {extraTabPanel}
                                    </div>
                                ) : null}
                                {formSessionActive ? (
                                    <div
                                        className={clsx(
                                            "min-h-0 flex-1 flex flex-col overflow-hidden",
                                            activeTab !== CRUD_TAB_FORM && "hidden",
                                        )}
                                        aria-hidden={activeTab !== CRUD_TAB_FORM}
                                    >
                                        <div
                                            key={`${editingId ?? "new"}:${formEpoch}:${activeBranchId ?? "none"}`}
                                            className="flex min-h-0 flex-1 flex-col"
                                        >
                                            {form}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </QueryRefreshHostProvider>
                </CrudFormDirtyProvider>
            </CrudListToolbarSetterContext.Provider>
            </CrudExtraTabsSetterContext.Provider>
        </CrudScreenContext.Provider>
    );
}
