import { Navigation } from "@/components/navigation";
import { ChatPanel } from "@/components/chat-panel";
import { DocumentWorkspace } from "@/components/document-workspace";

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      <Navigation />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-96 border-r">
          <ChatPanel />
        </div>
        <div className="flex-1">
          <DocumentWorkspace />
        </div>
      </div>
    </div>
  );
}
