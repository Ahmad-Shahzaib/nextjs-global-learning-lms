import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export interface ColumnDef<T> {
  header: string;
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
  className?: string;
}

interface CommonTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  skeletonRows?: number;
  emptyMessage?: string;
  rowKey?: (row: T, index: number) => string | number;
}

function CommonTable<T>({
  columns,
  data,
  loading = false,
  skeletonRows = 5,
  emptyMessage = "No data available.",
  rowKey,
}: CommonTableProps<T>) {
  const getCellValue = (
    row: T,
    accessor: ColumnDef<T>["accessor"],
    index: number
  ) => {
    if (typeof accessor === "function") return accessor(row, index);
    const value = row[accessor as keyof T];
    if (value === null || value === undefined) return "—";
    return value as React.ReactNode;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-orange-200 bg-orange-50 shadow-sm dark:border-[#2e2218] dark:bg-[#1a1410]">
      <Table className="min-w-full divide-y divide-orange-200 dark:divide-[#2e2218]">
        <TableHeader className="bg-orange-100 dark:bg-[#0f0d0b]">
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead
                key={idx}
                className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-orange-800 dark:text-[#f5efe8] ${col.className || ""}`}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className="bg-orange-50 divide-y divide-orange-100 dark:bg-[#1a1410] dark:divide-[#2e2218]">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, rowIdx) => (
              <TableRow 
                key={rowIdx} 
                className="hover:bg-orange-100 transition-colors dark:hover:bg-[#0f0d0b]"
              >
                {columns.map((_, colIdx) => (
                  <TableCell key={colIdx} className="px-6 py-4">
                    <Skeleton className="h-4 w-full rounded-md bg-orange-200 dark:bg-[#2e2218]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-12 text-center text-orange-600 italic dark:text-[#a89880]"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIdx) => (
              <TableRow
                key={rowKey ? rowKey(row, rowIdx) : rowIdx}
                className="hover:bg-orange-100 transition-all duration-200 dark:hover:bg-[#0f0d0b]"
              >
                {columns.map((col, colIdx) => (
                  <TableCell
                    key={colIdx}
                    className={`px-6 py-4 text-sm text-orange-950 dark:text-[#f5efe8] ${col.className || ""}`}
                  >
                    {getCellValue(row, col.accessor, rowIdx)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default CommonTable;