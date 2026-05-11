"use client";

import { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Column {
  label: string;
  className?: string;
  align?: "left" | "right" | "center";
}

interface DataTableProps {
  columns: Column[];
  children: ReactNode;
  className?: string;
}

export function DataTable({ columns, children, className }: DataTableProps) {
  return (
    <div className={cn("card-brutalist p-0 overflow-x-auto", className)}>
      <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
        <thead>
          <tr className="border-b border-border bg-white/5">
            {columns.map((column, index) => (
              <th
                key={index}
                className={cn(
                  "px-6 py-4 text-[10px] font-mono tracking-widest text-muted-foreground uppercase",
                  column.align === "right" && "text-right",
                  column.align === "center" && "text-center",
                  column.className
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}
