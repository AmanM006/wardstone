'use client';

import React, { useState } from 'react';
import {
  Search,
  LayoutDashboard,
  Layers,
  BarChart3,
  Network,
  Users,
  ChevronsUpDown,
  Bell,
  MoreHorizontal,
  Check,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Sliders,
  LogOut,
  RefreshCw,
  X
} from 'lucide-react';
import { ForensicIncidentReport, AP2PaymentMandate } from '@/types';

interface VercelSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  highCount: number;
  totalCount: number;
  incidents: ForensicIncidentReport[];
  mandates: AP2PaymentMandate[];
}

export const VercelSidebar: React.FC<VercelSidebarProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  highCount,
  totalCount,
  incidents,
  mandates
}) => {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState('Base Sepolia Live');

  const envs = [
    { id: 'base-sepolia', name: 'wardstone-ap2', tag: 'Base Sepolia Live', active: true }
  ];

  const navItems = [
    {
      id: 'OVERVIEW',
      path: '/dashboard',
      label: 'Overview',
      icon: LayoutDashboard
    },
    {
      id: 'MANDATES',
      path: '/dashboard?tab=mandates',
      label: 'Mandates Stream',
      icon: Layers,
      badge: totalCount
    },
    {
      id: 'RADAR',
      path: '/dashboard?tab=radar',
      label: 'Blast Radar',
      icon: BarChart3
    },
    {
      id: 'TRACES',
      path: '/dashboard?tab=traces',
      label: 'Nexus Traces',
      icon: Network
    },
    {
      id: 'MEMORY_BANK',
      path: '/dashboard?tab=memory-bank',
      label: 'Memory Bank',
      icon: Users
    }
  ];

  // Filtered preview for the search box
  const searchResults = searchTerm.trim()
    ? mandates.filter((m) => {
        const q = searchTerm.toLowerCase();
        const id = (m.mandate_id || m.raw_payload?.mandate_id || '').toLowerCase();
        const name = (m.buyer_agent?.agent_name || m.raw_payload?.buyer_agent?.agent_name || '').toLowerCase();
        return id.includes(q) || name.includes(q);
      }).slice(0, 5)
    : [];

  return (
    <aside className="w-60 h-screen sticky top-0 bg-[#000000] border-r border-[#151515] flex flex-col shrink-0 text-xs z-30 font-sans select-none relative">
      {/* 1. Project / Workspace Switcher */}
      <div className="relative">
        <div
          onClick={() => {
            setIsProjectDropdownOpen(!isProjectDropdownOpen);
            setIsNotificationsOpen(false);
            setIsSettingsOpen(false);
          }}
          className="p-3 border-b border-[#151515] flex items-center justify-between hover:bg-[#0a0a0a] transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
              W
            </div>
            <span className="font-semibold text-white text-[13px] tracking-tight truncate">
              wardstone-ap2
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-900 font-mono">
              Fleet
            </span>
            <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-500 hover:text-white transition" />
          </div>
        </div>

        {/* Project Switcher Popover */}
        {isProjectDropdownOpen && (
          <div className="absolute left-2 right-2 top-13 bg-[#0a0a0a] border border-[#222222] rounded-xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 text-[10px] font-mono uppercase text-zinc-500">
              Fleet Workspace
            </div>
            {envs.map((env) => (
              <div
                key={env.id}
                onClick={() => {
                  setSelectedEnv(env.tag);
                  setIsProjectDropdownOpen(false);
                }}
                className={`p-2 rounded-lg flex items-center justify-between cursor-pointer transition text-xs ${
                  selectedEnv === env.tag
                    ? 'bg-[#181818] text-white font-medium border border-[#282828]'
                    : 'text-zinc-400 hover:text-white hover:bg-[#121212]'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold">{env.name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">{env.tag}</div>
                </div>
                {selectedEnv === env.tag && <Check className="w-3.5 h-3.5 text-sky-400" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Interactive Search Box */}
      <div className="p-3 border-b border-[#151515] relative">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Find..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-[#080808] border border-[#1a1a1a] rounded-md text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 text-zinc-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <kbd className="absolute right-2 text-[10px] font-mono text-zinc-500 bg-[#141414] px-1 py-0.2 rounded border border-[#222222]">
              F
            </kbd>
          )}
        </div>

        {/* Live Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-2 right-2 top-14 bg-[#0a0a0a] border border-[#222222] rounded-xl shadow-2xl z-50 p-2 space-y-1">
            <div className="text-[10px] font-mono uppercase text-zinc-500 px-2 py-0.5">
              Matching Mandates ({searchResults.length})
            </div>
            {searchResults.map((m) => (
              <div
                key={m.mandate_id || m.raw_payload?.mandate_id}
                onClick={() => {
                  setActiveTab('MANDATES');
                  window.history.pushState(null, '', '/dashboard?tab=mandates');
                  setSearchTerm('');
                }}
                className="p-2 rounded hover:bg-[#181818] cursor-pointer transition text-xs flex items-center justify-between"
              >
                <div className="truncate font-mono text-zinc-300">
                  {m.mandate_id || m.raw_payload?.mandate_id}
                </div>
                <span className="text-[10px] font-bold text-white font-mono shrink-0">
                  ${Number(m.total_amount_usdc || m.raw_payload?.total_amount_usdc || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Navigation Links (Always staying within /dashboard) */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.history.pushState(null, '', item.path);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-normal transition ${
                isActive
                  ? 'bg-[#181818] text-white font-medium shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#080808]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500'}`}
                  strokeWidth={1.5}
                />
                <span className="whitespace-nowrap truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#141414] text-zinc-400 shrink-0 ml-2">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Bottom User Profile & Popovers Placed Directly ABOVE it */}
      <div className="p-3 border-t border-[#151515] flex items-center justify-between text-zinc-400 relative">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            FC
          </div>
          <div className="truncate">
            <span className="text-xs text-white font-medium truncate block leading-tight">
              AI Fleet Controller
            </span>
            <span className="text-[9px] text-zinc-500 font-mono">Google Cloud Run</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Notification Bell */}
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsSettingsOpen(false);
              setIsProjectDropdownOpen(false);
            }}
            className="p-1.5 hover:text-white rounded hover:bg-[#141414] transition relative"
            title="Live Circuit Breaker Notifications"
          >
            <Bell className="w-3.5 h-3.5 text-zinc-400" />
            {incidents.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1 animate-pulse" />
            )}
          </button>

          {/* 3 Dots Menu */}
          <button
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
              setIsNotificationsOpen(false);
              setIsProjectDropdownOpen(false);
            }}
            className="p-1.5 hover:text-white rounded hover:bg-[#141414] transition"
            title="Fleet Settings & Diagnostics"
          >
            <MoreHorizontal className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>

        {/* Notifications Popover */}
        {isNotificationsOpen && (
          <div className="absolute left-2 right-2 bottom-14 bg-[#0a0a0a] border border-[#222222] rounded-xl shadow-2xl z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#1a1a1a]">
              <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-sky-400" />
                <span>Live Notifications</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">{incidents.length} Alerts</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 select-text">
              {incidents.length === 0 ? (
                <div className="text-zinc-500 text-xs py-3 text-center">
                  Zero active threats. Circuit breaker nominal.
                </div>
              ) : (
                incidents.map((inc) => (
                  <div
                    key={inc.incident_id}
                    className="p-2 bg-[#050505] border border-[#1f1f1f] rounded-lg text-xs space-y-1 cursor-pointer hover:border-zinc-700 transition"
                    onClick={() => {
                      setActiveTab('MANDATES');
                      window.history.pushState(null, '', '/dashboard?tab=mandates');
                      setIsNotificationsOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Hold: ${inc.attempted_amount_usdc}</span>
                      </span>
                      <span className="text-[9px] font-mono px-1 rounded bg-rose-950 text-rose-300">
                        {inc.risk_score}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 leading-tight truncate">
                      {inc.anomaly_summary}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Settings Popover */}
        {isSettingsOpen && (
          <div className="absolute left-2 right-2 bottom-14 bg-[#0a0a0a] border border-[#222222] rounded-xl shadow-2xl z-50 p-3.5 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="pb-2 border-b border-[#1a1a1a]">
              <div className="font-semibold text-white text-xs">Runtime Diagnostics</div>
              <div className="text-[10px] text-zinc-500 font-mono">Wardstone AP2 v1.0.1</div>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-zinc-400">
              <div className="flex justify-between">
                <span>Cloud Run:</span>
                <span className="text-emerald-400">us-central1</span>
              </div>
              <div className="flex justify-between">
                <span>Base Sepolia:</span>
                <span className="text-sky-400">#84532</span>
              </div>
              <div className="flex justify-between">
                <span>Gemini Scribe:</span>
                <span className="text-purple-400">3.5 Flash</span>
              </div>
            </div>

            <div className="border-t border-[#1a1a1a] pt-2">
              <button
                onClick={() => {
                  alert('Flushed memory bank caches.');
                  setIsSettingsOpen(false);
                }}
                className="w-full py-1.5 px-2 text-center text-xs text-zinc-300 hover:text-white bg-[#141414] hover:bg-[#1f1f1f] rounded-lg transition font-medium"
              >
                ↻ Flush Memory Bank
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
