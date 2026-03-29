"use client";

import { create } from "zustand";
import { Role, KanbanCard, CardStatus } from "@/types";
import { cards as initialCards } from "@/data/cards";

interface BoardState {
  role: Role;
  cards: KanbanCard[];
  myTasksFilter: boolean;
  epicFilter: string | null;

  setRole: (role: Role) => void;
  moveCard: (cardId: string, newStatus: CardStatus) => void;
  toggleBlocker: (cardId: string, reason: string | null) => void;
  toggleSubtask: (cardId: string, subtaskId: string) => void;
  assignCard: (cardId: string, memberId: string) => void;
  setMyTasksFilter: (on: boolean) => void;
  setEpicFilter: (epic: string | null) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  role: "product-owner",
  cards: initialCards,
  myTasksFilter: false,
  epicFilter: null,

  setRole: (role) => set({ role, myTasksFilter: false, epicFilter: null }),

  moveCard: (cardId, newStatus) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId
          ? {
              ...c,
              status: newStatus,
              movedAt: { ...c.movedAt, [newStatus]: new Date().toISOString() },
            }
          : c
      ),
    })),

  toggleBlocker: (cardId, reason) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId ? { ...c, blockedReason: reason } : c
      ),
    })),

  toggleSubtask: (cardId, subtaskId) =>
    set((state) => ({
      cards: state.cards.map((c) =>
        c.id === cardId
          ? {
              ...c,
              subtasks: c.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, completed: !s.completed } : s
              ),
            }
          : c
      ),
    })),

  assignCard: (cardId, memberId) =>
    set((state) => {
      const { team } = require("@/data/team");
      const member = team.find((t: { id: string }) => t.id === memberId) ?? null;
      return {
        cards: state.cards.map((c) =>
          c.id === cardId ? { ...c, assignee: member } : c
        ),
      };
    }),

  setMyTasksFilter: (on) => set({ myTasksFilter: on }),
  setEpicFilter: (epic) => set({ epicFilter: epic }),
}));
