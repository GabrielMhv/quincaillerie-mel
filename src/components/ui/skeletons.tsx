import { Skeleton } from "./skeleton";
import React from "react";

export function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
        </div>
        <Skeleton className="h-10 w-48 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-112.5 rounded-[2.5rem]" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="lg:col-span-2 h-100 rounded-3xl" />
        <Skeleton className="h-100 rounded-3xl" />
      </div>
    </div>
  );
}

export function OrdersTableSkeleton() {
  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-112.5 rounded-[2.5rem]" />
      ))}
    </div>
  );
}

export function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {[...Array(10)].map((_, i) => (
        <Skeleton key={i} className="h-87.5 rounded-2xl" />
      ))}
    </div>
  );
}
