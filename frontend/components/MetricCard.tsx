"use client"

import { Card, CardContent } from "@/components/ui/card"

interface MetricCardProps {
  data: any[]
}

export function MetricCard({ data }: MetricCardProps) {
  if (!data || data.length === 0) {
    return null
  }

  const metrics = data[0]
  const entries = Object.entries(metrics)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {entries.map(([key, value]) => (
        <Card key={key}>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              {key.replace(/_/g, ' ').toUpperCase()}
            </div>
            <div className="text-2xl font-bold">
              {typeof value === 'number'
                ? key.includes('revenue') || key.includes('total')
                  ? `$${Number(value).toLocaleString()}`
                  : Number(value).toLocaleString()
                : String(value)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
