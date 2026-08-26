import React from 'react';

export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="h-screen w-screen bg-[#000000] flex overflow-hidden font-sans">
      {/* Sidebar Skeleton */}
      <div className="w-[300px] border-r border-[#1a1a1a] bg-[#0a0a0a] flex flex-col p-4 space-y-6">
        <div className="h-8 w-3/4 bg-[#1a1a1a] rounded animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 w-full bg-[#1a1a1a] rounded animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col bg-black p-8 space-y-8 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div className="h-10 w-1/4 bg-[#1a1a1a] rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-[#1a1a1a] rounded animate-pulse"></div>
        </div>

        {/* Top Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg animate-pulse"></div>
          ))}
        </div>

        {/* List Skeleton */}
        <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6 space-y-4">
          <div className="h-6 w-48 bg-[#1a1a1a] rounded animate-pulse mb-6"></div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex justify-between items-center border-b border-[#1a1a1a] pb-4">
              <div className="flex space-x-4 w-1/2">
                <div className="h-10 w-10 bg-[#1a1a1a] rounded-full animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-[#1a1a1a] rounded animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-[#1a1a1a] rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-8 w-24 bg-[#1a1a1a] rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
