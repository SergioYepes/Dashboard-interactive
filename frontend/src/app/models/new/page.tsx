"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewModelPage(){
    const[name, setName]= useState("")
    const[config, setConfig]= useState("{}")
    const[metrics, setMetrics] =useState("{}")
    const router= useRouter()

    const handleSubmit = async(e: React.FormEvent)=>{
        e.preventDefault()
        try{
            const res= await fetch("http://localhost:8000/models", {
                method:"POST",
                headers:{"Content-type": "application/json"},
                body: JSON.stringify({
                    name,
                    config: JSON.stringify(config),
                    metrics: JSON.stringify(metrics)
                })
            })
            if(res.ok){
                router.push("/models")
            } else{
                alert("Error al guardar el modelo")
            }
        }
        catch (err){
            alert(`JSON inválido o error en la conexión ${err}`)
        }
    }
    return (
        <main className="p-8 max-w-xl mx-auto">
            <h1 className="text-xl font-bold mb-4">Crear nuevo modelo</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Nombre del modelo" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border px-3 py-2 rounded" />
                <textarea placeholder="Config(JSON)" value={config} onChange={(e) => setConfig(e.target.value)} rows={4} className="w-full border px-3 py-2 rounded font-mono"></textarea>
                <textarea placeholder="Metrics(JSON)" value={metrics} onChange={(e)=> setMetrics(e.target.value)} rows={4} className="w-full border px-3 py-2 rounded font-mono"></textarea>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                    guardar
                </button>
            </form>
        </main>
    )
}