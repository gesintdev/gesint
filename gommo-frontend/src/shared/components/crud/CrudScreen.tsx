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
    useState,
} from "react";

import { useSessionPermissions } from "@/shared/auth/permissions";
import { canAccessExtraTab, canWriteRoute, type RoutePublicAccess } from "@/shared/auth/route-access";
import { useQueryRefresh } from "@/shared/components/data/QueryRefreshContext";
import { Button } from "@/shared/components/ui/Button";
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
};

type CrudScreenContextValue = {
    activeTab: string;
    editingId: string | null;
    isEditing: boolean;
    goToList: () => void;
    goToForm: () => void;
    goToTab: (tabId: string) => void;
    startCreate: () => void;
    startEdit: (id: string, record?: object) => void;
};

const CrudScreenContext = createContext<CrudScreenContextValue | null>(null);
const CrudExtraTabsSetterContext = createContext<((tabs: CrudExtraTab[] | null) => void) | null>(null);

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
};

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
}: CrudScreenProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [editingId, setEditingId] = useState<string | null>(initialEditingId);
    const [overrideExtraTabs, setOverrideExtraTabs] = useState<CrudExtraTab[] | null>(null);
    const permissions = useSessionPermissions();
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
        const items: { id: string; label: string; badge?: number; disabled?: boolean }[] = [
            { id: CRUD_TAB_LIST, label: listTabLabel },
        ];
        const showFormTab = canWrite && (!editOnly || isEditing || activeTab === CRUD_TAB_FORM);
        if (showFormTab) {
            items.push({
                id: CRUD_TAB_FORM,
                label: isEditing ? formTabLabelEdit : formTabLabel,
            });
        }
        items.push(
            ...visibleExtraTabs.map((t) => ({
                id: t.id,
                label: t.label,
                badge: t.badge,
                disabled: t.disabled,
            })),
        );
        return items;
    }, [activeTab, canWrite, editOnly, formTabLabel, formTabLabelEdit, isEditing, listTabLabel, visibleExtraTabs]);
    const goToList = useCallback(() => {
        setEditingId(null);
        setActiveTab(CRUD_TAB_LIST);
        syncWorkspace({});
    }, [syncWorkspace]);
    const goToForm = useCallback(() => setActiveTab(CRUD_TAB_FORM), []);
    const startCreate = useCallback(() => {
        if (editOnly || !canWrite) return;
        setEditingId(null);
        setActiveTab(CRUD_TAB_FORM);
        syncWorkspace({ isNew: true });
    }, [canWrite, editOnly, syncWorkspace]);
    const startEdit = useCallback(
        (id: string, record?: object) => {
            if (!canWrite) return;
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
        [canWrite, crudConfig, syncWorkspace],
    );
    const goToTab = useCallback((tabId: string) => setActiveTab(tabId), []);

    useEffect(() => {
        if (!canWrite && activeTab === CRUD_TAB_FORM) {
            setActiveTab(CRUD_TAB_LIST);
        }
    }, [activeTab, canWrite]);

    useEffect(() => {
        const isCoreTab = activeTab === CRUD_TAB_LIST || activeTab === CRUD_TAB_FORM;
        if (isCoreTab) return;
        const activeExtra = visibleExtraTabs.find((tab) => tab.id === activeTab);
        if (activeExtra && !activeExtra.disabled) return;
        setActiveTab(isEditing && canWrite ? CRUD_TAB_FORM : CRUD_TAB_LIST);
    }, [activeTab, canWrite, isEditing, visibleExtraTabs]);

    const ctx = useMemo(
        () => ({ activeTab, editingId, isEditing, goToList, goToForm, startCreate, startEdit, goToTab }),
        [activeTab, editingId, goToForm, goToList, goToTab, isEditing, startCreate, startEdit],
    );
    const extraTabPanel = visibleExtraTabs.find((t) => t.id === activeTab)?.content ?? null;
    const queryRefresh = useQueryRefresh();

    return (
        <CrudScreenContext.Provider value={ctx}>
            <CrudExtraTabsSetterContext.Provider value={setOverrideExtraTabs}>
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
                                            setActiveTab(CRUD_TAB_LIST);
                                        } else if (tab.id === CRUD_TAB_FORM) {
                                            if (!canWrite) return;
                                            if (editOnly && !editingId) return;
                                            setActiveTab(CRUD_TAB_FORM);
                                            if (workspaceEnabled && !editingId && !editOnly) {
                                                syncWorkspace({ isNew: true });
                                            }
                                        } else setActiveTab(tab.id);
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
                                <div className="text-[13px] text-base-content/50">
                                    {listToolbar ?? "Consulte os registros ou inicie um novo cadastro."}
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    {queryRefresh && (
                                        <Button
                                            variant="success"
                                            size="sm"
                                            aria-label="Atualizar lista"
                                            className="gommo-btn--icon-only"
                                            disabled={queryRefresh.isFetching}
                                            onClick={() => queryRefresh.refetch()}
                                            leftIcon={
                                                <RefreshCw
                                                    className={clsx(
                                                        "size-3.5",
                                                        queryRefresh.isFetching && "animate-spin",
                                                    )}
                                                    strokeWidth={2.25}
                                                />
                                            }
                                        />
                                    )}
                                    {showListToFormButton && canWrite ? (
                                        <Button
                                            size="sm"
                                            leftIcon={<Plus className="size-3.5" strokeWidth={2.5} />}
                                            onClick={startCreate}
                                        >
                                            {listToFormLabel}
                                        </Button>
                                    ) : (
                                        listPrimaryAction
                                    )}
                                </div>
                            </div>
                        )}
                        <div
                            className={clsx(
                                "min-h-0 flex-1",
                                activeTab === CRUD_TAB_LIST
                                    ? "overflow-y-auto"
                                    : activeTab === CRUD_TAB_FORM
                                      ? "flex flex-col overflow-hidden"
                                      : "overflow-y-auto",
                            )}
                        >
                            <div
                                className={clsx(
                                    "min-h-0 flex-1 flex-col",
                                    activeTab === CRUD_TAB_LIST ? "flex" : "hidden",
                                )}
                                aria-hidden={activeTab !== CRUD_TAB_LIST}
                            >
                                {list}
                            </div>
                            {activeTab !== CRUD_TAB_LIST && activeTab !== CRUD_TAB_FORM ? extraTabPanel : null}
                            {formSessionActive ? (
                                <div
                                    className={clsx(
                                        "min-h-0 flex-1 flex flex-col overflow-hidden",
                                        activeTab !== CRUD_TAB_FORM && "hidden",
                                    )}
                                    aria-hidden={activeTab !== CRUD_TAB_FORM}
                                >
                                    <div key={editingId ?? "new"} className="flex min-h-0 flex-1 flex-col">
                                        {form}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </CrudExtraTabsSetterContext.Provider>
        </CrudScreenContext.Provider>
    );
}
