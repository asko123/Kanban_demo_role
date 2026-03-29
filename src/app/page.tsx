"use client";

import { BackgroundTexture } from "@/components/layout/BackgroundTexture";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { KanbanBoard } from "@/components/board/KanbanBoard";

export default function Home() {
  return (
    <>
      <BackgroundTexture />
      <Header />
      <main className="flex-1 flex gap-4 p-6 max-w-[1600px] mx-auto w-full">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <KanbanBoard />
        </div>
      </main>
    </>
  );
}
