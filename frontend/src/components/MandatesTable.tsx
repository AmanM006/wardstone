'use client';

import React, { useState } from 'react';
import { AP2PaymentMandate } from '@/types';
import { Search, Filter, ExternalLink, ChevronDown, ChevronRight, ShieldAlert, ShieldCheck } from 'lucide-react';

interface MandatesTableProps {
  mandates: AP2PaymentMandate[];
  onRefresh: () => void;
}

export const MandatesTable: React.FC<MandatesTableProps> = ({
  mandates,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'QUARANTINED'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter mandates
  const filtered = mandates.filter((m) => {
    const raw: any = m.raw_payload || m;
    const dec: any = m.governance_decision || {};
    const isApproved = m.status === 'APPROVED' || dec.status === 'APPROVED';

    if (statusFilter === 'APPROVED' && !isApproved) return false;
    if (statusFilter === 'QUARANTINED' && isApproved) return false;

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const id = (m.mandate_id || raw.mandate_id || '').toLowerCase();
      const name = (m.buyer_agent?.agent_name || raw.buyer_agent?.agent_name || '').toLowerCase();
      const tx = (dec.tx_hash || '').toLowerCase();
      return id.includes(q) || name.includes(q) || tx.includes(q);
    }
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg flex flex-col overflow-hidden h-full">
      {/* Header & Controls */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white">Real-Time Mandates & Governance Stream</h2>
          <span className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-300 rounded-full border border-slate-700">
            {filtered.length} / {mandates.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search agent, ID, or tx..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-44 sm:w-56"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-md transition ${
                statusFilter === 'ALL' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`px-2.5 py-1 rounded-md transition ${
                statusFilter === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('QUARANTINED')}
              className={`px-2.5 py-1 rounded-md transition ${
                statusFilter === 'QUARANTINED' ? 'bg-rose-950 text-rose-300 font-semibold' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Quarantined
            </button>
          </div>

          <button
            onClick={onRefresh}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[580px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 sticky top-0 z-10">
              <th className="p-3 w-8"></th>
              <th className="p-3">Mandate ID</th>
              <th className="p-3">Buyer Agent</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Blast Risk</th>
              <th className="p-3">Governance Status</th>
              <th className="p-3">On-Chain Tx (BaseScan)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No matching payment mandates found.
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const raw: any = m.raw_payload || m;
                const dec: any = m.governance_decision || {};
                const risk: any = m.risk_analysis || {};
                const amount = Number(m.total_amount_usdc || raw.total_amount_usdc || 0);
                const score = Number(risk.risk_score || 0);
                const isApproved = m.status === 'APPROVED' || dec.status === 'APPROVED';
                const id = m.mandate_id || raw.mandate_id;
                const isExpanded = expandedId === id;

                let riskBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                if (score >= 60) riskBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
                else if (score >= 35) riskBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';

                return (
                  <React.Fragment key={id}>
                    <tr
                      onClick={() => toggleExpand(id)}
                      className="hover:bg-slate-800/40 transition cursor-pointer"
                    >
                      <td className="p-3 text-slate-500">
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </td>
                      <td className="p-3 font-mono text-slate-300 font-medium">
                        {id}
                      </td>
                      <td className="p-3 font-medium text-white">
                        {m.buyer_agent?.agent_name || raw.buyer_agent?.agent_name || 'Unknown Agent'}
                      </td>
                      <td className="p-3 font-mono font-semibold text-white">
                        ${amount.toFixed(2)}{' '}
                        <span className="text-[10px] text-slate-400 font-sans">USDC</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded border text-[11px] font-mono font-semibold ${riskBadgeColor}`}>
                          {score > 0 ? `${score.toFixed(1)}/100` : '--'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${
                            isApproved
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {isApproved ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          {isApproved ? 'APPROVED' : 'QUARANTINED'}
                        </span>
                      </td>
                      <td className="p-3 font-mono" onClick={(e) => e.stopPropagation()}>
                        {dec.tx_hash ? (
                          <a
                            href={`https://sepolia.basescan.org/tx/${dec.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 underline inline-flex items-center gap-1"
                          >
                            <span>
                              {String(dec.tx_hash).substring(0, 8)}...{String(dec.tx_hash).substring(String(dec.tx_hash).length - 6)}
                            </span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-500 italic">N/A (Held Pre-Settlement)</span>
                        )}
                      </td>
                    </tr>

                    {/* Expandable JSON & Cart Details */}
                    {isExpanded && (
                      <tr className="bg-slate-950/80">
                        <td colSpan={7} className="p-4 border-b border-slate-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                            <div>
                              <div className="font-sans font-bold text-sky-400 mb-1">🛒 AP2 Cart Breakdown:</div>
                              <ul className="space-y-1 text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                                {(m.cart_items || raw.cart_items || []).map((it: any, idx: number) => (
                                  <li key={idx}>
                                    • {it.description} &times; {it.quantity} (${it.unit_price_usdc} USDC)
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <div className="font-sans font-bold text-sky-400 mb-1">🔍 Risk Flags & Velocity:</div>
                              <div className="text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                                <div>Variance: {risk.velocity_variance_ratio ? `${risk.velocity_variance_ratio.toFixed(1)}x baseline` : 'Normal'}</div>
                                <div className="text-rose-400 mt-1">
                                  Flags: {risk.anomaly_flags && risk.anomaly_flags.length > 0 ? risk.anomaly_flags.join(', ') : 'None (Safe)'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
