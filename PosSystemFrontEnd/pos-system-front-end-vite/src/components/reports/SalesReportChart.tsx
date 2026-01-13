import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { DateTime } from "luxon";

interface SalesReportChartProps {
  data: Array<{
    date: string
    totalAmount: number
    transactionCount: number
  }>
}

export function SalesReportChart({ data }: SalesReportChartProps) {
  // Format data for chart
  const chartData = data.map(item => ({
    
    date: DateTime.fromISO(item.date, { zone: "Asia/Singapore" }).toFormat("LLL d"),
    revenue: item.totalAmount,
    transactions: item.transactionCount,
    average: item.transactionCount > 0 ? item.totalAmount / item.transactionCount : 0
  }))

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center border rounded-lg">
        <div className="text-center">
          <p className="text-gray-500">No sales data available for the selected period</p>
          <p className="text-sm text-gray-400 mt-2">Try selecting a different date range</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#666' }}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: '#666' }}
            axisLine={{ stroke: '#e0e0e0' }}
            label={{ 
              value: 'Revenue ($)', 
              angle: -90, 
              position: 'insideLeft',
              offset: -10,
              style: { fill: '#666' }
            }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#666' }}
            axisLine={{ stroke: '#e0e0e0' }}
            label={{ 
              value: 'Transactions', 
              angle: 90, 
              position: 'insideRight',
              offset: -10,
              style: { fill: '#666' }
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value, name) => {
              if (name === 'revenue') return [`$${Number(value).toFixed(2)}`, 'Revenue']
              if (name === 'transactions') return [value, 'Transactions']
              if (name === 'average') return [`$${Number(value).toFixed(2)}`, 'Avg. per Sale']
              return [value, name]
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            name="Revenue"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="transactions"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            name="Transactions"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="average"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
            activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
            name="Avg. per Sale"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}