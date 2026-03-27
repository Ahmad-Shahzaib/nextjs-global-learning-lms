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
  /** Column header label */
  header: string;
  /** Key of the row data object, or a custom render function */
  accessor: keyof T | ((row: T, index: number) => React.ReactNode);
  /** Optional class names for the <th> / <td> */
  className?: string;
}

interface CommonTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  /** Number of skeleton rows shown while loading */
  skeletonRows?: number;
  /** Message displayed when data is empty and not loading */
  emptyMessage?: string;
  /** Optional row key — defaults to index */
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
  const getCellValue = (row: T, accessor: ColumnDef<T>["accessor"], index: number) => {
    if (typeof accessor === "function") return accessor(row, index);
    const value = row[accessor as keyof T];
    if (value === null || value === undefined) return "—";
    return value as React.ReactNode;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col, idx) => (
            <TableHead key={idx} className={col.className}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {loading ? (
          Array.from({ length: skeletonRows }).map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {columns.map((_, colIdx) => (
                <TableCell key={colIdx}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="py-10 text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, rowIdx) => (
            <TableRow key={rowKey ? rowKey(row, rowIdx) : rowIdx}>
              {columns.map((col, colIdx) => (
                <TableCell key={colIdx} className={col.className}>
                  {getCellValue(row, col.accessor, rowIdx)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export default CommonTable;
