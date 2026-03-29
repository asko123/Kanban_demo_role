"use client";

import { useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { COLUMN_ORDER, CardStatus } from "@/types";
import { useBoardStore } from "@/store";
import { currentDeveloper } from "@/data/team";
import { KanbanColumn } from "./KanbanColumn";

export function KanbanBoard() {
  const cards = useBoardStore((s) => s.cards);
  const role = useBoardStore((s) => s.role);
  const myTasksFilter = useBoardStore((s) => s.myTasksFilter);
  const epicFilter = useBoardStore((s) => s.epicFilter);
  const moveCard = useBoardStore((s) => s.moveCard);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const cardId = active.id as string;
      const overId = over.id as string;

      const isColumn = COLUMN_ORDER.includes(overId as CardStatus);
      const targetStatus = isColumn
        ? (overId as CardStatus)
        : (cards.find((c) => c.id === overId)?.status ?? null);

      if (targetStatus) {
        moveCard(cardId, targetStatus);
      }
    },
    [cards, moveCard]
  );

  let filteredCards = cards;
  if (myTasksFilter && role === "developer") {
    filteredCards = filteredCards.filter(
      (c) => c.assignee?.id === currentDeveloper.id
    );
  }
  if (epicFilter) {
    filteredCards = filteredCards.filter((c) => c.epic === epicFilter);
  }

  const cardsByStatus = COLUMN_ORDER.reduce(
    (acc, status) => {
      acc[status] = filteredCards.filter((c) => c.status === status);
      return acc;
    },
    {} as Record<CardStatus, typeof filteredCards>
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 px-1">
        {COLUMN_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            cards={cardsByStatus[status]}
            role={role}
          />
        ))}
      </div>
    </DndContext>
  );
}
