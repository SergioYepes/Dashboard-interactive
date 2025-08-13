"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

type Model = {
  id: number
  name: string
  config: Record<string, unknown>
  metrics: Record<string, unknown>
  created_at: string
}

export default function ModelDetail(){
    const params=useParams()
    const id= params?.id
    const [model, setModel] = useState<Model | null>(null)
    
    useEffect(()=>{
        fetch(`http://localhost:8000/${id}`)
        .then((res)=>res.json())
        .then(setModel)
    },[id])

    if(!model) return <p className="p-8">Cargando...</p>
    return(
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-4">{model.name}</h1>
            <p className="text-sm text-black-600 mb-4">Creado: {new Date(model.created_at).toLocaleString()}</p>
            <h2 className="font-semibold mt-4">config</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm">{JSON.stringify(model.config, null, 2)}</pre>
            <h2 className="font-semibold mt-4">metrics</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm">{JSON.stringify(model.metrics, null, 2)}</pre>
        </main>
    )
}