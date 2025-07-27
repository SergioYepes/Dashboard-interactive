'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid } from "recharts"

type Props = {
    data: Record<string, unknown>[]
    xKey: string
    yKey: string
    chartType: string
}



const COLORS=["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F"]

export default function DataChart({ data, xKey, yKey, chartType }: Props) {
  const filterData = data.filter(
    row =>
      (typeof row[xKey] === "string" || typeof row[xKey] === "number") &&
      typeof row[yKey] === "number"
  );

  if (filterData.length === 0) return <p>No hay datos disponibles</p>;

  const chartProps = {
    width: 600,
    height: 300,
    data: filterData,
  };
  console.log(chartType);
  

  return (
    <div style={{ width: "100%", height: "400px" }}>
        {chartType === "Line" && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart {...chartProps}>
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
          <BarChart {...chartProps}>
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
            <PieChart width={500} height={300}>
                <Tooltip />
                <Pie
                data={filterData}
                dataKey={yKey}
                nameKey={xKey}
                cx={"50%"}
                cy={"50%"}
                outerRadius={100}
                fill="#8884d8"
                label
                >
                {filterData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
        )}
    </div>
  );
}
