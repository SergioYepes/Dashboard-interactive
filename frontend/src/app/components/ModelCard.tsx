import React from "react"

type ModelCardProps = {
    id:number
    name:string
    metrics: Record<string, unknown>
    created_at:string
}

const ModelCard: React.FC<ModelCardProps> = ({id, name,metrics, created_at})=>{
    return(
        <a href={`/models/${id}`} className="block p-4 border rounded-lg hover:shadow-md transition">
            <h3 className="font-semibold text-lg">{name}</h3>
            <p>Creado: {new Date(created_at).toLocaleString()}</p>
            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">{JSON.stringify(metrics, null, 2)}</pre>
        </a>
    )
}
export default ModelCard