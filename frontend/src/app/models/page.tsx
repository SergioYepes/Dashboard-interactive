'use client'
import { useEffect, useState } from "react"
import ModelCard from "../components/ModelCard"
import Link  from "next/link"

type Model ={
    id: number
    name: string
    metrics: Record<string, unknown>
    created_at: string
}

export default function ModelsPage(){
    const[models, setModels] =useState<Model[]>([])

    useEffect(()=>{
        fetch("http://backend:8000/models")
        .then((res)=> res.json())
        .then(setModels)
    },[])
    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-4">Modelos entrenados</h1>
            <Link href="/models/new" className="bg-brown-600 text-white px-4 py-2 rounded mb-6 inline-block">
                Crear modelo nuevo
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {models.map((model)=>(
                    <ModelCard key={model.id} {...model}/>
                ))}
            </div>
        </main>
    )
}   