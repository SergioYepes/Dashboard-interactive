import React from "react";
import axios from "axios"

interface Props {
    onResult: (data: { columns: string[]; preview: Record<string, unknown>[] }) => void
}
const FileUpload : React.FC<Props>=({onResult})=>{
    const handleFileChange = async(e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0]
        if(!file) return
        const formData = new FormData()
        formData.append('file', file)

        const res= await axios.post('http://backend:8000/upload', formData,{
            headers: {'Content-Type':"multipart/form-data"}
        })
        onResult(res.data)
    }
    return (
        <div className="mb4">
            <input type="file" accept=".csv"onChange={handleFileChange} />
        </div>
    )
}
export default FileUpload
