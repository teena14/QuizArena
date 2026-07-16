"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Plus, Trophy, LayoutDashboard, Settings } from "lucide-react";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!isOpen) return null;

  const actions = [
    { id: "dashboard", name: "Go to Dashboard", icon: LayoutDashboard, href: "/teacher" },
    { id: "create", name: "Create New Quiz", icon: Plus, href: "/teacher/quizzes/new" },
    { id: "quizzes", name: "Manage Quizzes", icon: BookOpen, href: "/teacher/quizzes" },
    { id: "results", name: "View Results", icon: Trophy, href: "/teacher/results" },
    { id: "settings", name: "Settings", icon: Settings, href: "/teacher/settings" },
  ];

  const filteredActions = actions.filter(
    (action) => action.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4 animate-fade-in">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative w-full max-w-lg bg-[#111111] border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center border-b border-border px-4 py-3 gap-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            autoFocus
            className="flex-1 bg-transparent border-none text-foreground text-sm focus:outline-none placeholder:text-muted-foreground"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium font-sans">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                Actions
              </div>
              {filteredActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    router.push(action.href);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors text-left focus:outline-none focus:bg-muted"
                >
                  <action.icon className="w-4 h-4 text-muted-foreground" />
                  {action.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t border-border px-4 py-3 bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Use</span>
            <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50 border border-border">↑</kbd>
            <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50 border border-border">↓</kbd>
            <span>to navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50 border border-border">Enter</kbd>
            <span>to select</span>
          </div>
        </div>
      </div>
    </div>
  );
}
