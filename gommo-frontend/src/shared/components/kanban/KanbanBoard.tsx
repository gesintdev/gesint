"use client";

import {
    closestCorners,
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { LoaderCircle, PanelRight } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import {
    type KanbanColumn,
    type KanbanItem,
    type KanbanItemMoveEvent,
    resolveKanbanColumnColor,
} from "@/shared/components/kanban/kanban.types";

export type KanbanBoardProps<TItem extends KanbanItem = KanbanItem> = {
    columns: KanbanColumn<TItem>[];
    onItemMove?: (event: KanbanItemMoveEvent) => void;
    renderCard?: (item: TItem, column: KanbanColumn<TItem>, pending: boolean) => ReactNode;
    /** Clique no botao de detalhe a direita do card (nao inicia drag). */
    onCardDetailClick?: (item: TItem, column: KanbanColumn<TItem>) => void;
    /** IDs de cards aguardando persistência (estilo "salvando"). */
    pendingItemIds?: ReadonlySet<string> | readonly string[];
    emptyColumnLabel?: string;
    className?: string;
};

type ActiveDragState = {
    itemId: string;
    columnId: string;
};

function toPendingSet(pendingItemIds?: ReadonlySet<string> | readonly string[]): ReadonlySet<string> {
    if (!pendingItemIds) return new Set();
    if (pendingItemIds instanceof Set) return pendingItemIds;
    return new Set(pendingItemIds);
}

function findColumnIdByItemId<TItem extends KanbanItem>(
    columns: KanbanColumn<TItem>[],
    itemId: string,
): string | null {
    for (const column of columns) {
        if (column.items.some((item) => item.id === itemId)) return column.id;
    }
    return null;
}

function DefaultKanbanCard({
    item,
    pending,
    onDetailClick,
}: {
    item: KanbanItem;
    pending?: boolean;
    onDetailClick?: () => void;
}) {
    return (
        <div className="flex items-start gap-2 px-3 py-2.5">
            <div className="min-w-0 flex-1 grid gap-0.5">
                <p className="m-0 text-[0.8125rem] font-semibold leading-snug text-base-content">{item.title}</p>
                {item.subtitle ? (
                    <p className="m-0 text-[0.6875rem] text-base-content/50">{item.subtitle}</p>
                ) : null}
                {item.meta ? <div className="mt-1 text-[0.625rem] text-base-content/40">{item.meta}</div> : null}
            </div>
            <div className="flex shrink-0 items-start gap-1">
                {pending ? (
                    <LoaderCircle
                        className="mt-0.5 size-3.5 shrink-0 animate-spin text-base-content/35"
                        strokeWidth={2.25}
                        aria-label="Salvando"
                    />
                ) : null}
                {onDetailClick ? (
                    <button
                        type="button"
                        aria-label="Detalhar card"
                        title="Detalhar card"
                        className="mt-0.5 inline-flex size-6 items-center justify-center rounded-md text-base-content/40 transition-colors hover:bg-base-content/8 hover:text-base-content"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                            event.stopPropagation();
                            onDetailClick();
                        }}
                    >
                        <PanelRight className="size-3.5" strokeWidth={2.25} />
                    </button>
                ) : null}
            </div>
        </div>
    );
}

function SortableKanbanCard<TItem extends KanbanItem>({
    item,
    column,
    pending,
    renderCard,
    onDetailClick,
}: {
    item: TItem;
    column: KanbanColumn<TItem>;
    pending: boolean;
    renderCard?: (item: TItem, column: KanbanColumn<TItem>, pending: boolean) => ReactNode;
    onDetailClick?: (item: TItem, column: KanbanColumn<TItem>) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: item.id,
        data: { type: "item", columnId: column.id },
    });

    return (
        <article
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className={clsx(
                "cursor-grab touch-none rounded-lg border shadow-sm transition-[border-color,background-color,box-shadow,opacity] duration-150 active:cursor-grabbing",
                pending
                    ? "border-base-content/8 bg-base-content/[0.03] opacity-50"
                    : "border-base-content/10 bg-base-100 hover:border-primary/30 hover:bg-primary/[0.04] hover:shadow-md",
                isDragging && "opacity-40 shadow-none hover:border-base-content/10 hover:bg-base-100 hover:shadow-none",
            )}
            aria-busy={pending || undefined}
            {...attributes}
            {...listeners}
        >
            {renderCard ? (
                renderCard(item, column, pending)
            ) : (
                <DefaultKanbanCard
                    item={item}
                    pending={pending}
                    onDetailClick={onDetailClick ? () => onDetailClick(item, column) : undefined}
                />
            )}
        </article>
    );
}

function KanbanColumnPanel<TItem extends KanbanItem>({
    column,
    pendingItemIds,
    renderCard,
    onCardDetailClick,
    emptyColumnLabel,
}: {
    column: KanbanColumn<TItem>;
    pendingItemIds: ReadonlySet<string>;
    renderCard?: (item: TItem, column: KanbanColumn<TItem>, pending: boolean) => ReactNode;
    onCardDetailClick?: (item: TItem, column: KanbanColumn<TItem>) => void;
    emptyColumnLabel: string;
}) {
    const color = resolveKanbanColumnColor(column.color);
    const { setNodeRef, isOver } = useDroppable({
        id: `column:${column.id}`,
        data: { type: "column", columnId: column.id },
    });
    const itemIds = useMemo(() => column.items.map((item) => item.id), [column.items]);

    return (
        <section
            className={clsx(
                "flex w-[17.5rem] max-h-full shrink-0 flex-col rounded-xl border bg-base-content/[0.025]",
                isOver ? "border-secondary/45" : "border-base-content/10",
            )}
            style={{ borderTopColor: color, borderTopWidth: 3 }}
        >
            <header className="flex items-center gap-2 border-b border-base-content/8 px-3 pb-2 pt-3">
                <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden
                />
                <h3 className="m-0 min-w-0 flex-1 truncate text-xs font-semibold tracking-wide text-base-content">
                    {column.title}
                </h3>
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-base-content/10 px-1.5 text-[0.625rem] font-semibold text-base-content/55">
                    {column.items.length}
                </span>
            </header>
            <div ref={setNodeRef} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2.5">
                <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                    {column.items.map((item) => (
                        <SortableKanbanCard
                            key={item.id}
                            item={item}
                            column={column}
                            pending={pendingItemIds.has(item.id)}
                            renderCard={renderCard}
                            onDetailClick={onCardDetailClick}
                        />
                    ))}
                </SortableContext>
                {column.items.length === 0 ? (
                    <p className="m-0 px-1 py-3 text-center text-[0.6875rem] text-base-content/35">
                        {emptyColumnLabel}
                    </p>
                ) : null}
            </div>
        </section>
    );
}

export function KanbanBoard<TItem extends KanbanItem = KanbanItem>({
    columns,
    onItemMove,
    renderCard,
    onCardDetailClick,
    pendingItemIds,
    emptyColumnLabel = "Nenhum item",
    className,
}: KanbanBoardProps<TItem>) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        }),
    );
    const [activeDrag, setActiveDrag] = useState<ActiveDragState | null>(null);
    const pendingSet = useMemo(() => toPendingSet(pendingItemIds), [pendingItemIds]);

    const activeItem = useMemo(() => {
        if (!activeDrag) return null;
        const column = columns.find((c) => c.id === activeDrag.columnId);
        return column?.items.find((item) => item.id === activeDrag.itemId) ?? null;
    }, [activeDrag, columns]);

    const activeColumn = useMemo(() => {
        if (!activeDrag) return null;
        return columns.find((c) => c.id === activeDrag.columnId) ?? null;
    }, [activeDrag, columns]);

    const resolveTargetColumnId = (overId: string | number | undefined): string | null => {
        if (overId == null) return null;
        const id = String(overId);
        if (id.startsWith("column:")) return id.slice("column:".length);
        return findColumnIdByItemId(columns, id);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const itemId = String(event.active.id);
        const columnId =
            (event.active.data.current?.columnId as string | undefined) ??
            findColumnIdByItemId(columns, itemId);
        if (!columnId) return;
        setActiveDrag({ itemId, columnId });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDrag(null);
        if (!over) return;

        const itemId = String(active.id);
        const fromColumnId =
            (active.data.current?.columnId as string | undefined) ??
            findColumnIdByItemId(columns, itemId);
        const toColumnId = resolveTargetColumnId(over.id);
        if (!fromColumnId || !toColumnId) return;

        const fromColumn = columns.find((c) => c.id === fromColumnId);
        const toColumn = columns.find((c) => c.id === toColumnId);
        if (!fromColumn || !toColumn) return;

        const fromIndex = fromColumn.items.findIndex((item) => item.id === itemId);
        if (fromIndex < 0) return;

        let toIndex = toColumn.items.findIndex((item) => item.id === String(over.id));
        if (toIndex < 0) toIndex = toColumn.items.length;
        if (fromColumnId === toColumnId && fromIndex === toIndex) return;
        if (fromColumnId === toColumnId && fromIndex < toIndex) {
            toIndex -= 1;
        }

        const movedItem = fromColumn.items[fromIndex];
        if (onItemMove) {
            onItemMove({ itemId, fromColumnId, toColumnId, fromIndex, toIndex });
        }
        if (fromColumnId !== toColumnId && toColumn.onDrop) {
            toColumn.onDrop(movedItem);
        }
    };

    const activePending = activeDrag ? pendingSet.has(activeDrag.itemId) : false;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveDrag(null)}
        >
            <div
                className={clsx(
                    "flex h-full min-h-0 items-stretch gap-3 overflow-x-auto overflow-y-hidden p-3",
                    className,
                )}
            >
                {columns.map((column) => (
                    <KanbanColumnPanel
                        key={column.id}
                        column={column}
                        pendingItemIds={pendingSet}
                        renderCard={renderCard}
                        onCardDetailClick={onCardDetailClick}
                        emptyColumnLabel={emptyColumnLabel}
                    />
                ))}
            </div>
            <DragOverlay dropAnimation={null}>
                {activeItem && activeColumn ? (
                    <article
                        className={clsx(
                            "cursor-grabbing rounded-lg border shadow-lg",
                            activePending
                                ? "border-base-content/8 bg-base-content/[0.03] opacity-50"
                                : "border-base-content/10 bg-base-100",
                        )}
                    >
                        {renderCard ? (
                            renderCard(activeItem, activeColumn, activePending)
                        ) : (
                            <DefaultKanbanCard item={activeItem} pending={activePending} />
                        )}
                    </article>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
