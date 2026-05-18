import * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="rounded-lg border p-4">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border p-4">
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="space-y-3">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
        </div>
      </div>
    </div>
  );
}

// Orders Table Skeleton
export function OrdersTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid gap-2 md:grid-cols-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
      </div>

      {/* Table Header */}
      <div className="rounded-lg border overflow-hidden">
        <div className="bg-muted p-4">
          <div className="grid gap-4 md:grid-cols-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-4">
                <div className="grid gap-4 md:grid-cols-6">
                  {Array(6)
                    .fill(0)
                    .map((_, j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// Products Grid Skeleton
export function ProductsGridSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid gap-2 md:grid-cols-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="rounded-lg border overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// Stocks Table Skeleton
export function StocksTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid gap-2 md:grid-cols-2">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <div className="bg-muted p-4">
          <div className="grid gap-4 md:grid-cols-5">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
          </div>
        </div>

        <div className="divide-y">
          {Array(10)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-4">
                <div className="grid gap-4 md:grid-cols-5">
                  {Array(5)
                    .fill(0)
                    .map((_, j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export { Skeleton };
