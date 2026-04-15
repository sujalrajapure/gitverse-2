"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Activity } from "lucide-react"

// Health Score Chart
export function HealthScoreChart({ score }: { score: number }) {
  const data = [
    { name: "Score", value: score },
    { name: "Remaining", value: 100 - score },
  ]

  const COLORS = ["#10b981", "#1f2937"]

  return (
    <div className="relative h-48 w-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold">{score}</div>
        <div className="text-sm text-gray-400">Health Score</div>
      </div>
    </div>
  )
}

// Contributors Chart
export function ContributorsChart({ data }: { data: any[] }) {
  // Sort contributors by contributions
  const sortedData = [...data]
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, 10)
    .map((contributor) => ({
      name: contributor.login,
      value: contributor.contributions,
    }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sortedData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" />
        <XAxis type="number" stroke="#9ca3af" />
        <YAxis dataKey="name" type="category" width={100} stroke="#9ca3af" tick={{ fill: "#d1d5db" }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", borderRadius: "0.375rem" }}
          itemStyle={{ color: "#d1d5db" }}
          labelStyle={{ color: "#f9fafb", fontWeight: "bold" }}
        />
        <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Issues Chart
export function IssuesChart({ data }: { data: any[] }) {
  // Group issues by month
  const issuesByMonth: Record<string, { open: number; closed: number }> = {}

  data.forEach((issue) => {
    const date = new Date(issue.created_at)
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`

    if (!issuesByMonth[monthYear]) {
      issuesByMonth[monthYear] = { open: 0, closed: 0 }
    }

    if (issue.state === "open") {
      issuesByMonth[monthYear].open++
    } else {
      issuesByMonth[monthYear].closed++
    }
  })

  const chartData = Object.entries(issuesByMonth).map(([month, counts]) => ({
    month,
    open: counts.open,
    closed: counts.closed,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="month" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", borderRadius: "0.375rem" }}
          itemStyle={{ color: "#d1d5db" }}
          labelStyle={{ color: "#f9fafb", fontWeight: "bold" }}
        />
        <Legend />
        <Line type="monotone" dataKey="open" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Pull Requests Chart
export function PullRequestsChart({ data }: { data: any[] }) {
  // Group PRs by month
  const prsByMonth: Record<string, { opened: number; merged: number }> = {}

  data.forEach((pr) => {
    const date = new Date(pr.created_at)
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`

    if (!prsByMonth[monthYear]) {
      prsByMonth[monthYear] = { opened: 0, merged: 0 }
    }

    prsByMonth[monthYear].opened++

    if (pr.merged_at) {
      prsByMonth[monthYear].merged++
    }
  })

  const chartData = Object.entries(prsByMonth).map(([month, counts]) => ({
    month,
    opened: counts.opened,
    merged: counts.merged,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="month" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", borderRadius: "0.375rem" }}
          itemStyle={{ color: "#d1d5db" }}
          labelStyle={{ color: "#f9fafb", fontWeight: "bold" }}
        />
        <Legend />
        <Bar dataKey="opened" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="merged" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Activity Heatmap
export function ActivityHeatmap({ data }: { data: string[] }) {
  // Process commit dates into heatmap format
  const processHeatmapData = (commitDates: string[]) => {
    const dateCount: Record<string, number> = {}

    commitDates.forEach(date => {
      dateCount[date] = (dateCount[date] || 0) + 1
    })

    const weeks = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 52 * 7) // 52 weeks ago

    for (let week = 0; week < 52; week++) {
      const weekData = []
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + week * 7 + day)
        const dateStr = date.toISOString().split("T")[0]
        const count = dateCount[dateStr] || 0
        weekData.push({ date: dateStr, count })
      }
      weeks.push(weekData)
    }

    return weeks
  }

  const heatmapData = processHeatmapData(data)

  const getColor = (count: number) => {
    if (count === 0) return "#1f2937"
    if (count === 1) return "#065f46"
    if (count === 2) return "#047857"
    if (count === 3) return "#059669"
    return "#10b981"
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {heatmapData.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getColor(day.count) }}
                title={`${day.date}: ${day.count} commits`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-700"></div>
          <div className="w-3 h-3 rounded-sm bg-green-900"></div>
          <div className="w-3 h-3 rounded-sm bg-green-800"></div>
          <div className="w-3 h-3 rounded-sm bg-green-700"></div>
          <div className="w-3 h-3 rounded-sm bg-green-500"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

// Star Growth Chart
export function StarGrowthChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip
          contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", borderRadius: "0.375rem" }}
          itemStyle={{ color: "#d1d5db" }}
          labelStyle={{ color: "#f9fafb", fontWeight: "bold" }}
        />
        <Line type="monotone" dataKey="stars" stroke="#fbbf24" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Predicted Activity Chart
export function PredictedActivityChart({ prediction }: { prediction: string }) {
  return (
    <div className="flex items-center justify-center h-full bg-gray-900 rounded-lg p-6">
      <div className="text-center">
        <Activity className="h-16 w-16 text-emerald-500 opacity-20 mx-auto mb-4" />
        <p className="text-gray-300 text-sm">{prediction}</p>
      </div>
    </div>
  )
}

