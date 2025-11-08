"use client"

interface DataTableProps {
  data: any[]
}

export function DataTable({ data }: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data to display
      </div>
    )
  }

  const columns = Object.keys(data[0])

  return (
    <div className="rounded-md border overflow-auto max-h-96">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 py-3 text-left font-medium text-muted-foreground uppercase tracking-wider"
              >
                {column.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-border">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-muted/50">
              {columns.map((column) => (
                <td key={column} className="px-4 py-3 whitespace-nowrap">
                  {row[column] !== null && row[column] !== undefined
                    ? String(row[column])
                    : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
