interface DataTableProps{
    data: Record<string, unknown>[]
}

const DataTable: React.FC<DataTableProps> = ({data}) => {
    if (!data || data.length === 0) return null
    const columns =Object.keys(data[0])
    return (
        <div className="overflow-x-auto max-h-[500px] overflow-y-scroll">
        <table className="table-auto border-collapse border border-gray-400">
            <thead>
                <tr>
                    {columns.map((col)=>(
                        <th key={col} className="border border-gray-400 px-2 py-1">{col}</th>
                    ))}
                </tr>
            </thead>
            <tbody> 
                {data.map((raws, index) => (
                    <tr key={index}>
                        {columns.map((value) => (
                            <td key={value}>{String(raws[value])}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    )
    }
export default DataTable
