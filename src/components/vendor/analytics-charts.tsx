'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart as BarChart2,
} from 'recharts'
import { CHART_COLORS } from '@/lib/constants'
import { formatPrice } from '@/lib/utils/format'

interface MonthData {
  label: string
  revenue: number
}

interface OrderData {
  label: string
  orders: number
}

interface TopProduct {
  name: string
  revenue: number
  units: number
}

function RevenueTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length || !payload[0]) return null
  return (
    <div className="rounded-lg border border-[#E8DDD4] bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-[#1A1410]">{label}</p>
      <p className="text-[#C2692A]">{formatPrice(payload[0].value)}</p>
    </div>
  )
}

function OrderTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length || !payload[0]) return null
  return (
    <div className="rounded-lg border border-[#E8DDD4] bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-[#1A1410]">{label}</p>
      <p className="text-[#2B6B4A]">{payload[0].value} order{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  )
}

export function RevenueChart({ data }: { data: MonthData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.15} />
            <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD4" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#8C7B6E' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatPrice(v)}
          tick={{ fontSize: 11, fill: '#8C7B6E' }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<RevenueTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={CHART_COLORS[0]}
          strokeWidth={2}
          fill="url(#revenueGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function OrderVolumeChart({ data }: { data: OrderData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD4" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#8C7B6E' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#8C7B6E' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<OrderTooltip />} />
        <Bar
          dataKey="orders"
          fill={CHART_COLORS[1]}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TopProductsChart({ data }: { data: TopProduct[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
      <BarChart2
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD4" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => formatPrice(v)}
          tick={{ fontSize: 11, fill: '#8C7B6E' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 11, fill: '#8C7B6E' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [
            typeof value === 'number' ? formatPrice(value) : String(value),
            'Revenue',
          ]}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #E8DDD4',
            fontSize: 12,
          }}
        />
        <Bar dataKey="revenue" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
      </BarChart2>
    </ResponsiveContainer>
  )
}
