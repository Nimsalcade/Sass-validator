"use client";

import { FileText } from "lucide-react";

export function DocumentWorkspace() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Document Workspace</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-4 text-center">
          <FileText className="h-16 w-16 text-muted-foreground" />
          <h3 className="text-2xl font-bold">No document selected</h3>
          <p className="text-muted-foreground">
            Select or create a document to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
