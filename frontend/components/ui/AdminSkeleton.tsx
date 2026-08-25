
import React from 'react';

export default function AdminSkeleton() {
  return (
    <div id="admin-skeleton-root" className="max-w-7xl mx-auto px-4 py-16 space-y-8 animate-pulse font-sans text-left">
      <div id="admin-skeleton-header" className="h-24 bg-gray-200 rounded-3xl w-full" />
      <div id="admin-skeleton-strip" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div id="admin-skeleton-card-1" className="h-20 bg-gray-200 rounded-2xl" />
        <div id="admin-skeleton-card-2" className="h-20 bg-gray-200 rounded-2xl" />
        <div id="admin-skeleton-card-3" className="h-20 bg-gray-200 rounded-2xl" />
        <div id="admin-skeleton-card-4" className="h-20 bg-gray-200 rounded-2xl" />
      </div>
      <div id="admin-skeleton-tabs" className="h-10 bg-gray-200 rounded-xl max-w-xl" />
      <div id="admin-skeleton-body" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div id="admin-skeleton-col-1" className="lg:col-span-12 h-64 bg-gray-200 rounded-3xl" />
      </div>
    </div>
  );
}
