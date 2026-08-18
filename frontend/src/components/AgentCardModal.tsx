'use client';

import React from 'react';
import { X, Copy, Check, Shield } from 'lucide-react';

interface AgentCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: any;
}

export const AgentCardModal: React.FC<AgentCardModalProps> = ({
  isOpen,
  onClose,
  cardData
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(cardData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans select-text">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#222222] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-white text-sm">
              Wardstone A2A Agent Card (JSON-LD Protocol)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-[#141414] hover:bg-[#1f1f1f] text-zinc-300 rounded-md text-xs transition flex items-center gap-1.5 border border-[#222222]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-zinc-500 hover:text-white rounded-md transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* JSON Preview */}
        <div className="p-4 flex-1 overflow-y-auto">
          <pre className="p-4 bg-[#050505] border border-[#171717] rounded-xl text-xs font-mono text-zinc-300 leading-relaxed overflow-x-auto select-text">
            {JSON.stringify(cardData || { protocol: 'a2a-v1.0', name: 'Wardstone Gatekeeper' }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
