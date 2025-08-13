'use client'
import {
  BarChart, Bar,
  XAxis, YAxis,
  Tooltip, Legend,
  LineChart, Line,
  PieChart, Pie, Cell,
  ResponsiveContainer, CartesianGrid
} from "recharts"

type Props = {
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  chartType: string
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F"]

function isNumber(val: unknown): boolean {
  return typeof val === "number" || (!isNaN(Number(val)) && typeof val !== "object")
}

function groupCategorical(data: Record<string, unknown>[], xKey: string, yKey: string) {
  const grouped: Record<string, number> = {}
  data.forEach(row => {
    const xVal = String(row[xKey])
    grouped[xVal] = (grouped[xVal] || 0) + 1
  })
  return Object.entries(grouped).map(([key, count]) => ({
    [xKey]: key,
    [yKey]: count
  }))
}

function groupNumerical(data: Record<string, unknown>[], xKey: string, yKey: string) {
  const grouped: Record<string, number> = {}
  data.forEach(row => {
    const xVal = String(row[xKey])
    const yVal = Number(row[yKey])
    if (!isNaN(yVal)) {
      grouped[xVal] = (grouped[xVal] || 0) + yVal
    }
  })
  return Object.entries(grouped).map(([key, total]) => ({
    [xKey]: key,
    [yKey]: total
  }))
}

export default function DataChart({ data, xKey, yKey, chartType }: Props) {
  // Limpiar datos (evitar undefined o null)
  const cleaned = data.filter(row => row[xKey] !== undefined && row[yKey] !== undefined)

  let processed: Record<string, unknown>[] = []

  const isXNum = cleaned.every(row => isNumber(row[xKey]))
  const isYNum = cleaned.every(row => isNumber(row[yKey]))

  if (!isXNum && !isYNum) {
    // Categórica vs categórica → contar ocurrencias
    processed = groupCategorical(cleaned, xKey, yKey)
  } else if (!isXNum && isYNum) {
    // Categórica vs numérica → sumar
    processed = groupNumerical(cleaned, xKey, yKey)
  } else {
    // Numérica vs numérica o algo mezclado → convertir valores
    processed = cleaned.map(row => ({
      ...row,
      [xKey]: isNumber(row[xKey]) ? Number(row[xKey]) : row[xKey],
      [yKey]: isNumber(row[yKey]) ? Number(row[yKey]) : row[yKey]
    })).filter(row => !isNaN(Number(row[yKey])))
  }

  if (processed.length === 0) {
    return <p>No hay datos disponibles para {xKey} vs {yKey}</p>
  }

  return (
    <div style={{ width: "100%", height: "400px" }}>
      {chartType === "Line" && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processed}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yKey} stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      )}

      {chartType === "Bar" && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processed}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yKey} fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      )}

      {chartType === "Pie" && (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie
              data={processed}
              dataKey={yKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {processed.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
