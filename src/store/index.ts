"use client";

import { create } from "zustand";
import { Role, KanbanCard, CardStatus, TeamMember } from "@/types";
import { cards as initialCards } from "@/data/cards";
import { team } from "@/data/team";

interface BoardState {
  role: Role;
  cards: KanbanCard[];
  currentDevId: string;
  myTasksFilter: boolean;
  epicFilter: string | null;

  setRole: (role: Role) => void;
  setCurrentDev: (devId: string) => void;
  getCurrentDev: () => TeamMember;
  moveCard: (cardId: string, newStatus: CardStatus) => void;
  toggleBlocker: (cardId: string, reason: string | null) => void;
  toggleSubtask: (cardId: string, subtaskId: string) => void;
  assignCard: (cardId: string, memberId: string) => void;
  setMyTasksFilter: (on: boolean) => void;
  setEpicFilter: (epic: string | null) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  role: "product-owner",
  cards: initialCards,
  currentDevId: "tm-1",
  myTasksFilter: false,
  epicFilter: null,

  setRole: (role) => set({ role, myTasksFilter: false, epicFilter: null }),

  setCurrentDev: (devId) => set({ currentDevId: devId, myTasksFilter: false }),

  getCurrentDev: () => {
    const state = get();
    return team.find((t) => t.id === state.currentDevId) ?? team[0];
  },

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
    set(() => {
      const member = team.find((t) => t.id === memberId) ?? null;
      return {
        cards: get().cards.map((c) =>
          c.id === cardId ? { ...c, assignee: member } : c
        ),
      };
    }),

  setMyTasksFilter: (on) => set({ myTasksFilter: on }),
  setEpicFilter: (epic) => set({ epicFilter: epic }),
}));
