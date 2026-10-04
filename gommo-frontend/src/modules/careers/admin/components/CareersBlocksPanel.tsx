"use client";

import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { ChevronDown, Copy, Eye, EyeOff, GripVertical, Lock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { CareersBlockFields } from "@/modules/careers/admin/components/CareersBlockFields";
import type { CareersEditorBlock } from "@/modules/careers/admin/lib/careers-editor";
import {
    CAREERS_CUSTOM_BLOCK_TYPES,
    type CareersCustomBlockType,
} from "@/modules/careers/shared/dto/careers.dto";
import { CAREERS_BLOCK_META, CAREERS_MAX_BLOCKS, createCustomBlock } from "@/modules/careers/shared/lib/careers-blocks";
import { Button } from "@/shared/components/ui/Button";

type CareersBlocksPanelProps = {
    blocks: CareersEditorBlock[];
    disabled?: boolean;
    onChange: (blocks: CareersEditorBlock[]) => void;
};

function SortableBlockRow({
    block,
    expanded,
    disabled,
    onToggleExpanded,
    onChange,
    onDuplicate,
    onRemove,
}: {
    block: CareersEditorBlock;
    expanded: boolean;
    disabled?: boolean;
    onToggleExpanded: () => void;
    onChange: (patch: Partial<CareersEditorBlock>) => void;
    onDuplicate: () => void;
    onRemove: () => void;
}) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
        id: block.key,
        disabled,
    });
    const meta = CAREERS_BLOCK_META[block.type];
    const Icon = meta.icon;
    const isSystem = block.systemBlock ?? false;
    const lockedVisible = block.type === "OPEN_VACANCIES";

    return (
        <li
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={clsx(
                "rounded-lg border bg-base-100 transition-shadow",
                expanded ? "border-primary/40 shadow-sm" : "border-(--gommo-border-subtle)",
                isDragging && "z-10 opacity-80 shadow-md",
                !block.visible && "bg-base-200/50",
            )}
        >
            <div className="flex items-center gap-1.5 px-2 py-2">
                <button
                    type="button"
                    ref={setActivatorNodeRef}
                    className="flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-base-content/35 hover:bg-base-200 hover:text-base-content/70 active:cursor-grabbing disabled:cursor-not-allowed"
                    aria-label={`Arrastar bloco ${meta.label}`}
                    disabled={disabled}
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="size-4" strokeWidth={2} />
                </button>
                <button type="button" onClick={onToggleExpanded} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                    <Icon
                        className={clsx("size-4 shrink-0", block.visible ? "text-primary" : "text-base-content/35")}
                        strokeWidth={1.75}
                    />
                    <span className="min-w-0">
                        <span
                            className={clsx(
                                "block truncate text-sm font-medium",
                                block.visible ? "text-base-content" : "text-base-content/45",
                            )}
                        >
                            {block.title?.trim() || meta.label}
                        </span>
                        <span className="block truncate text-xs text-base-content/45">
                            {meta.label}
                            {isSystem ? " · padrão" : ""}
                        </span>
                    </span>
                </button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-base-content/55"
                    aria-label={block.visible ? "Ocultar bloco" : "Mostrar bloco"}
                    title={lockedVisible ? "As vagas abertas sempre aparecem" : block.visible ? "Ocultar" : "Mostrar"}
                    disabled={disabled || lockedVisible}
                    onClick={() => onChange({ visible: !block.visible })}
                    leftIcon={
                        lockedVisible ? (
                            <Lock className="size-3.5" strokeWidth={2} />
                        ) : block.visible ? (
                            <Eye className="size-3.5" strokeWidth={2} />
                        ) : (
                            <EyeOff className="size-3.5" strokeWidth={2} />
                        )
                    }
                />
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-base-content/55"
                    aria-label={expanded ? "Recolher" : "Editar bloco"}
                    onClick={onToggleExpanded}
                    leftIcon={
                        <ChevronDown
                            className={clsx("size-3.5 transition-transform", expanded && "rotate-180")}
                            strokeWidth={2}
                        />
                    }
                />
            </div>
            {expanded ? (
                <div className="grid gap-3 border-t border-(--gommo-border-subtle) px-3 py-3">
                    <p className="text-xs text-base-content/50">{meta.description}</p>
                    <CareersBlockFields block={block} disabled={disabled} onChange={onChange} />
                    {!isSystem ? (
                        <div className="flex justify-end gap-2 pt-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={disabled}
                                onClick={onDuplicate}
                                leftIcon={<Copy className="size-3.5" strokeWidth={2} />}
                            >
                                Duplicar
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-error"
                                disabled={disabled}
                                onClick={onRemove}
                                leftIcon={<Trash2 className="size-3.5" strokeWidth={2} />}
                            >
                                Excluir bloco
                            </Button>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </li>
    );
}

export function CareersBlocksPanel({ blocks, disabled, onChange }: CareersBlocksPanelProps) {
    const [expandedKey, setExpandedKey] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );
    const canAdd = blocks.length < CAREERS_MAX_BLOCKS;

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;
        const from = blocks.findIndex((block) => block.key === active.id);
        const to = blocks.findIndex((block) => block.key === over.id);
        if (from < 0 || to < 0) return;
        onChange(arrayMove(blocks, from, to));
    };

    const updateBlock = (key: string, patch: Partial<CareersEditorBlock>) => {
        onChange(blocks.map((block) => (block.key === key ? { ...block, ...patch } : block)));
    };

    const addBlock = (type: CareersCustomBlockType) => {
        const block: CareersEditorBlock = { ...createCustomBlock(type), key: crypto.randomUUID() };
        const vacanciesIndex = blocks.findIndex((item) => item.type === "OPEN_VACANCIES");
        const next = [...blocks];
        next.splice(vacanciesIndex >= 0 ? vacanciesIndex : next.length, 0, block);
        onChange(next);
        setExpandedKey(block.key);
        setAdding(false);
    };

    return (
        <div className="grid gap-3">
            <p className="text-xs leading-relaxed text-base-content/55">
                Arraste para reordenar. Blocos padrão podem ser ocultados, mas não excluídos.
            </p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map((block) => block.key)} strategy={verticalListSortingStrategy}>
                    <ul className="grid gap-2">
                        {blocks.map((block) => (
                            <SortableBlockRow
                                key={block.key}
                                block={block}
                                disabled={disabled}
                                expanded={expandedKey === block.key}
                                onToggleExpanded={() => setExpandedKey((current) => (current === block.key ? null : block.key))}
                                onChange={(patch) => updateBlock(block.key, patch)}
                                onDuplicate={() => {
                                    if (!canAdd) return;
                                    const index = blocks.findIndex((item) => item.key === block.key);
                                    const copy: CareersEditorBlock = {
                                        ...block,
                                        id: null,
                                        key: crypto.randomUUID(),
                                        content: structuredClone(block.content),
                                        title: `${block.title ?? ""} (cópia)`.trim(),
                                    };
                                    const next = [...blocks];
                                    next.splice(index + 1, 0, copy);
                                    onChange(next);
                                    setExpandedKey(copy.key);
                                }}
                                onRemove={() => onChange(blocks.filter((item) => item.key !== block.key))}
                            />
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>

            {adding ? (
                <div className="grid gap-2 rounded-lg border border-(--gommo-border-subtle) bg-base-100 p-3">
                    <p className="text-sm font-semibold text-base-content">Novo bloco</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {CAREERS_CUSTOM_BLOCK_TYPES.map((type) => {
                            const meta = CAREERS_BLOCK_META[type];
                            const Icon = meta.icon;
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => addBlock(type)}
                                    className="flex items-start gap-2 rounded-lg border border-(--gommo-border-subtle) p-2.5 text-left hover:border-primary/50 hover:bg-primary/5"
                                >
                                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} />
                                    <span>
                                        <span className="block text-[13px] font-medium text-base-content">{meta.label}</span>
                                        <span className="block text-[11px] leading-snug text-base-content/50">{meta.description}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <Button variant="ghost" size="sm" className="justify-self-end" onClick={() => setAdding(false)}>
                        Cancelar
                    </Button>
                </div>
            ) : (
                <button
                    type="button"
                    disabled={disabled || !canAdd}
                    onClick={() => setAdding(true)}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-base-content/20 px-3 py-2.5 text-sm font-medium text-primary hover:border-primary disabled:opacity-50"
                >
                    <Plus className="size-4" strokeWidth={2} />
                    {canAdd ? "Adicionar bloco" : `Limite de ${CAREERS_MAX_BLOCKS} blocos`}
                </button>
            )}
        </div>
    );
}
