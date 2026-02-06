"use client";

import HomeDashboard from "@/core/feature/dashboard/HomeDashboard";

export default function StatsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold font-serif text-gray-900 mb-8">Stats</h1>
      {/* Reusing the existing dashboard component for stats */}
      <HomeDashboard />
    </div>
  );
}
