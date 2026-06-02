"use client";

import clsx from "clsx";
import {Plus, RefreshCw} from "lucide-react";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import {
    canAccessExtraTab,
    canWriteRoute,
    type RoutePublicAccess,
} from "@/shared/auth/route-access";
import { useSessionPermissions } from "@/shared/auth/permissions";
import { findRouteById } from "@/shared/workspace/workspace-routes";
import {useQueryRefresh} from "@/shared/components/data/QueryRefreshContext";
import {Button} from "@/shared/components/ui/Button";
import {useTabbedCrudConfigOptional} from "@/shared/workspace/TabbedCrudConfigContext";
import {useWorkspaceTabOptional} from "@/shared/workspace/WorkspaceTabContext";
import {useWorkspaceNavigation} from "@/shared/workspace/useWorkspaceNavigation";
import {useWorkspaceStore} from "@/shared/workspace/workspace.store";
import {isModuleListTab} from "@/shared/workspace/workspace-tab-id";

export const CRUD_TAB_LIST = "list";
export const CRUD_TAB_FORM = "form";

export type CrudExtraTab = {
    id: string;
    label: string;
    content: ReactNode;
    permission?: string;
    publicAccess?: RoutePublicAccess;
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

export function useCrudScreen(): CrudScreenContextValue {
    const ctx = useContext(CrudScreenContext);
    if (!ctx) throw new Error("useCrudScreen deve ser usado dentro de CrudScreen");
    return ctx;
}

export type CrudScreenProps = {
    list: ReactNode;
    form: ReactNode;
    extraTabs?: CrudExtraTab[];
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
    const permissions = useSessionPermissions();
    const crudConfig = useTabbedCrudConfigOptional();
    const workspaceTabCtx = useWorkspaceTabOptional();
    const {syncCrudUrl} = useWorkspaceNavigation();
    const clearTitleSuffix = useWorkspaceStore((s) => s.clearTitleSuffix);
    const setTitleSuffix = useWorkspaceStore((s) => s.setTitleSuffix);

    const isEditing = editingId != null;
    const workspaceRoute = workspaceTabCtx
        ? findRouteById(workspaceTabCtx.tab.routeId)
        : undefined;
    const canWrite = canWriteRoute(workspaceRoute, permissions, writePermission);
    const formSessionActive = canWrite && (isEditing || activeTab === CRUD_TAB_FORM);
    const isListInstance =
        workspaceTabCtx == null || isModuleListTab(workspaceTabCtx.tab.entityKey);

    const syncWorkspace = useCallback(
        (crud: { editingId?: string | null; isNew?: boolean; titleSuffix?: string | null }) => {
            if (!workspaceEnabled || !crudConfig || !workspaceTabCtx) return;
            const tabId = workspaceTabCtx.tab.id;
            if (!isListInstance) return;
            if (crud.titleSuffix) setTitleSuffix(tabId, crud.titleSuffix);
            else clearTitleSuffix(tabId);
            syncCrudUrl(tabId, {editingId: crud.editingId, isNew: crud.isNew});
        },
        [
            clearTitleSuffix,
            crudConfig,
            isListInstance,
            setTitleSuffix,
            syncCrudUrl,
            workspaceEnabled,
            workspaceTabCtx,
        ],
    );

    const visibleExtraTabs = useMemo(
        () => extraTabs.filter((tab) => canAccessExtraTab(tab, permissions)),
        [extraTabs, permissions],
    );

    const tabs = useMemo(() => {
        const items: { id: string; label: string }[] = [{id: CRUD_TAB_LIST, label: listTabLabel}];
        const showFormTab = canWrite && (!editOnly || isEditing || activeTab === CRUD_TAB_FORM);
        if (showFormTab) {
            items.push({
                id: CRUD_TAB_FORM,
                label: isEditing ? formTabLabelEdit : formTabLabel,
            });
        }
        items.push(...visibleExtraTabs.map((t) => ({id: t.id, label: t.label})));
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
        syncWorkspace({isNew: true});
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

    const ctx = useMemo(
        () => ({activeTab, editingId, isEditing, goToList, goToForm, startCreate, startEdit, goToTab}),
        [activeTab, editingId, goToForm, goToList, goToTab, isEditing, startCreate, startEdit],
    );

    const extraTabPanel = visibleExtraTabs.find((t) => t.id === activeTab)?.content ?? null;

    const queryRefresh = useQueryRefresh();

    return (
        <CrudScreenContext.Provider value={ctx}>
            <div className="flex min-h-0 flex-1 flex-col">

                <div
                    className="gommo-crud-tablist"
                    role="tablist"
                    aria-label="Seções do cadastro"
                >
                    {tabs.map((tab) => {
                        const selected = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={selected}
                                aria-controls={`crud-panel-${tab.id}`}
                                id={`crud-tab-${tab.id}`}
                                onClick={() => {
                                    if (tab.id === CRUD_TAB_LIST) {
                                        setActiveTab(CRUD_TAB_LIST);
                                    } else if (tab.id === CRUD_TAB_FORM) {
                                        if (!canWrite) return;
                                        if (editOnly && !editingId) return;
                                        setActiveTab(CRUD_TAB_FORM);
                                        if (workspaceEnabled && !editingId && !editOnly) syncWorkspace({isNew: true});
                                    } else setActiveTab(tab.id);
                                }}
                                className={clsx("gommo-crud-tab", selected && "gommo-crud-tab--active")}
                            >
                                {tab.label}
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
                        <div
                            className="crud-list-toolbar flex flex-wrap items-center justify-between gap-2 border-b px-4 py-1.5">
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
                                                className={clsx("size-3.5", queryRefresh.isFetching && "animate-spin")}
                                                strokeWidth={2.25}
                                            />
                                        }
                                    />
                                )}
                                {showListToFormButton && canWrite ? (
                                    <Button
                                        size="sm"
                                        leftIcon={<Plus className="size-3.5" strokeWidth={2.5}/>}
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
                        {activeTab === CRUD_TAB_LIST ? list : null}
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
        </CrudScreenContext.Provider>
    );
}
