"use client";

import { MessageSquare, FileText } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navigation() {
  return (
    <nav className="border-b">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">App</h1>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm font-medium hover:text-primary">
              <MessageSquare className="h-4 w-4" />
              Chat
            </button>
            <button className="flex items-center gap-2 text-sm font-medium hover:text-primary">
              <FileText className="h-4 w-4" />
              Documents
            </button>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}
