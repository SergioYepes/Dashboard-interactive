'use client'
import { useState } from 'react'
import { inferColumnTypes } from '../lib/utils/InferColumnTypes';

type ChartSelectorProps = {
    columns: string[],
    data: Record<string, unknown>[],
    xKey: string,
    yKey: string,
    chartType: string,
    onConfigChange: (xKey: string, yKey: string, chartType: string) => void
};

export default function ChartSelector({data, xKey, yKey, chartType, onConfigChange }: ChartSelectorProps) {
    const[XKey, setxKey] = useState(xKey);
    const[YKey, setYKey] = useState(yKey)
    const [chartTypeSelected, setChartType] = useState(chartType)
    const columnTypes= inferColumnTypes(data)
    const stringColumns = columnTypes.filter(c=>c.type ==="string").map((c)=>c.name)
    const numberColumns = columnTypes.filter(c=>c.type ==="number").map((c)=>c.name)
    const handleApply=()=>{
        if (XKey && YKey) {
            onConfigChange(XKey, YKey, chartTypeSelected);
        }
    }

    return (
        <div className='space-y-2 mb-4'>
            <select value={XKey} onChange={(e)=>setxKey(e.target.value)} className='border p-1'>
                <option value="">Eje X</option>
                {stringColumns.map((column) => (
                    <option key={column} value={column}>
                        {column}
                    </option>
                ))}
            </select>
            <select value={YKey} onChange={(e)=>setYKey(e.target.value)} className='border p-1'>
                <option value="">Eje Y</option>
                {numberColumns.map((column) => (
                    <option key={column} value={column}>
                        {column}
                    </option>
                ))}
            </select>
            <select value={chartTypeSelected} onChange={(e)=>setChartType(e.target.value)} className='border p-1'>
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="pie">Pie</option>
            </select>
            <button onClick={handleApply} className='bg-blue-500 text-white px-4 py-2 rounded-md'>
                Aplicar
            </button>
        </div>
    )
}