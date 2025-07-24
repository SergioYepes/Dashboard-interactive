'use client'
import { useState } from "react";
import FileUpload from "./components/FileUpload";
import DataTable from "./components/DataTable";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  const handleUploadResult =(res: { columns: string[]; preview: Record<string, unknown>[] })=>{
    setColumns(res.columns)
    setData(res.preview)
  }

  return(
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Data Dashboard</h1>
      <FileUpload onResult={handleUploadResult} />
      <DataTable data={data} />
    </main>
  )
}