import {
  LayoutGrid,
  Kanban,
  FileText,
  Clock,
  Settings,
  Crown,
  ClipboardList,
  GitBranch,
  Code,
  Search,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Bot,
} from "lucide-react";
import { useState } from "react";
import { clsx } from "../utils/clsx";
import { ProgressBar } from "../ui/ProgressBar";
import type { Screen } from "../../lib/navigation";

const navItems = [
  { id: "workspace", icon: LayoutGrid, label: "Workspace" },
  { id: "kanban", icon: Kanban, label: "Task Board" },
  { id: "files", icon: FileText, label: "Files" },
  { id: "timeline", icon: Clock, label: "Timeline" },
  { id: "agents", icon: Bot, label: "Agents" },
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "agent-ide", icon: Terminal, label: "Agent IDE" },
];

const agents = [
  {
    role: "Owner",
    icon: Crown,
    subtext: "You",
    color: "bg-zinc-900/60 border border-[#cca374]/30 text-[#cca374]",
  },
  {
    role: "Planner",
    icon: ClipboardList,
    subtext: "3 subtasks",
    color: "bg-zinc-900/40 border border-white/5 text-zinc-400",
  },
  {
    role: "Orchestrator",
    icon: GitBranch,
    subtext: "Step 4/8",
    color: "bg-zinc-900/40 border border-white/5 text-zinc-400",
  },
  {
    role: "Coder",
    icon: Code,
    subtext: "Writing auth.ts",
    color: "bg-zinc-900/40 border border-white/5 text-zinc-400",
  },
  {
    role: "Reviewer",
    icon: Search,
    subtext: "1 pending",
    color: "bg-zinc-900/40 border border-white/5 text-zinc-400",
  },
];

interface SidebarProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function Sidebar({
  activeScreen,
  onNavigate,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        "h-full bg-surface-glass backdrop-blur-lg border-r border-white/5 shadow-[5px_0_30px_rgba(0,0,0,0.35)] transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}

      <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
        {!collapsed && (
          <h1 className="text-lg font-bold text-white tracking-widest uppercase font-mono">
            AI-Agency
          </h1>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Navigation */}

      <nav className="mt-6 px-3 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as Screen)}
            className={clsx(
              "w-full flex items-center rounded-lg px-3.5 py-3 transition-all duration-300 relative overflow-hidden group cursor-pointer",
              activeScreen === item.id
                ? "bg-white/5 text-white font-medium border-l-[3px] border-[#cca374] pl-[11px]"
                : "text-slate-400 hover:bg-white/4 hover:text-white border-l-[3px] border-transparent pl-[14px]"
            )}
          >
            <item.icon size={20} className="transition-transform duration-300 group-hover:scale-110" />

            {!collapsed && (
              <span className="ml-3 tracking-wide">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Agents */}

      {!collapsed && (
        <>
          <div className="mt-8 px-5">
            <p className="text-xs uppercase text-zinc-500 tracking-wider mb-4 font-semibold">
              AI Agents
            </p>

            <div className="space-y-2.5">
              {agents.map((agent) => (
                <div
                  key={agent.role}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/4 cursor-pointer transition-all duration-300 border border-transparent hover:border-white/5 hover:translate-x-1"
                >
                  <div
                    className={clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center shadow-inner relative group-hover:scale-105 transition-transform duration-300",
                      agent.color
                    )}
                  >
                    <agent.icon
                      size={18}
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full" />
                  </div>

                  <div>
                    <p className="text-white text-sm font-medium">
                      {agent.role}
                    </p>

                    <p className="text-xs text-zinc-400">
                      {agent.subtext}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Stats */}

          <div className="mt-auto p-5 space-y-5">
            <ProgressBar
              label="Memory"
              value={6.2}
              max={10}
              valueLabel="6.2 / 10 GB"
              color="primary"
            />

            <ProgressBar
              label="CPU"
              value={34}
              max={100}
              valueLabel="34%"
              color="purple"
            />

            <div className="flex justify-between text-xs text-zinc-400">
              <span>Tokens</span>
              <span className="text-[#cca374] font-semibold font-mono">
                1,284 used
              </span>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}