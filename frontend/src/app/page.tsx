'use client'
import { useState } from "react";
import FileUpload from "./components/FileUpload";
import DataTable from "./components/DataTable";
import ChartSelector from "./components/ChartSelector";
import DataChart from "./components/DataChart";
import { inferColumnTypes } from "./lib/utils/InferColumnTypes";

export default function Home() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [chart, setChart] = useState({xKey:"", yKey:"", chartType:"Bar"});

  const handleUploadResult =(res: { columns: string[]; preview: Record<string, unknown>[] })=>{
    setColumns(res.columns)
    setData(res.preview)
    const types= inferColumnTypes(res.preview)
    const stringColumn =types.find(col=> col.type === "string")?.name || ""
    const numberColumn =types.find(col=> col.type === "number")?.name  || ""
    setChart({ xKey: stringColumn, yKey: numberColumn, chartType: "Bar" });
  }
  console.log(data, "data");
  
  
  return(
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Data Dashboard</h1>
      <FileUpload onResult={handleUploadResult} />
      {data.length > 0 && (
        <>
          <ChartSelector
            columns={columns}
            onConfigChange={(xKey, yKey, chartType) => setChart({ xKey, yKey, chartType })} data={data} xKey={chart.xKey} yKey={chart.yKey} chartType={chart.chartType}/>
          <DataChart data={data} xKey={chart.xKey} yKey={chart.yKey} chartType={chart.chartType} />
          <DataTable data={data} />
        </>
      )}
    </main>
  )
}