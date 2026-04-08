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
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader className="bg-gray-50">
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead
                key={idx}
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider ${col.className}`}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody className="bg-white divide-y divide-gray-100">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, rowIdx) => (
              <TableRow key={rowIdx} className="hover:bg-gray-50 transition-colors">
                {columns.map((_, colIdx) => (
                  <TableCell key={colIdx} className="px-4 py-3">
                    <Skeleton className="h-4 w-full rounded-md" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-10 text-center text-gray-400 italic"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIdx) => (
              <TableRow
                key={rowKey ? rowKey(row, rowIdx) : rowIdx}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((col, colIdx) => (
                  <TableCell
                    key={colIdx}
                    className={`px-4 py-3 text-sm text-gray-700 ${col.className}`}
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