import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Search,
  Menu,
} from "lucide-react";
import { ModelSelector } from "./ModelSelector";

export function Header() {
  const [showModels, setShowModels] = useState(false);

  return (
    <header className="h-16 shrink-0 bg-surface-glass backdrop-blur-lg border-b border-white/5 flex items-center justify-between px-6 relative z-30 shadow-[0_4px_30px_rgba(0,0,0,0.15)]">

      {/* Left */}
      <div className="flex items-center gap-4">

        <button className="lg:hidden text-zinc-400 hover:text-white cursor-pointer">
          <Menu size={22} />
        </button>

        <div>
          <h1 className="text-white text-base font-semibold tracking-wide">
            AI Agency Dashboard
          </h1>

          <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
            Workspace / AI Agents
          </p>
        </div>

      </div>

      {/* Center */}
      <div className="hidden md:flex flex-1 max-w-lg mx-10">

        <div className="relative w-full">

          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            type="text"
            placeholder="Search agents, files, tasks..."
            className="w-full rounded-lg bg-white/3 border border-white/8 py-2 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#cca374]/50 focus:bg-white/5 focus:shadow-[0_0_15px_rgba(204,163,116,0.15)] transition-all duration-300 text-sm"
          />

        </div>

      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Model Selector */}
        <div className="relative">

          <button
            onClick={() => setShowModels(!showModels)}
            className="flex items-center gap-2 rounded-lg bg-white/3 border border-white/8 px-4 py-2 hover:border-white/15 hover:bg-white/6 transition-all duration-200 cursor-pointer text-sm"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

            <span className="text-white text-sm font-medium">
              GPT-4o
            </span>

            <ChevronDown
              size={14}
              className="text-zinc-400"
            />
          </button>

          {showModels && (
            <ModelSelector
              onClose={() => setShowModels(false)}
            />
          )}

        </div>

        {/* Notifications */}

        <button className="relative p-2 rounded-lg hover:bg-white/5 hover:text-white transition-all duration-200 cursor-pointer">

          <Bell
            size={18}
            className="text-zinc-300"
          />

          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#cca374] px-1 text-[9px] font-bold text-black shadow-[0_0_8px_rgba(204,163,116,0.4)]">
            3
          </span>

        </button>

        {/* User */}

        <button className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/3 px-3 py-1.5 hover:border-white/15 hover:bg-white/6 transition-all duration-200 cursor-pointer">

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-[#cca374]/30 font-semibold text-[#cca374] text-sm shadow-[0_0_10px_rgba(204,163,116,0.15)]">
            JD
          </div>

          <div className="hidden lg:block text-left">

            <div className="text-xs font-semibold text-white">
              John Doe
            </div>

            <div className="text-[10px] text-zinc-400">
              Administrator
            </div>

          </div>

        </button>

      </div>

    </header>
  );
}