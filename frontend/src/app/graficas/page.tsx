'use client'
import { useState, useEffect } from "react";
import ChartSelector from "../components/ChartSelector";
import DataChart from "../components/DataChart";
import DataTable from "../components/DataTable";

interface DataFrame {
  id: string;
  name: string;
  description: string;
  columns: string[];
  row_count: number;
  file_size: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function GraficasPage() {
  const [dataframes, setDataframes] = useState<DataFrame[]>([]);
  const [selectedDataframe, setSelectedDataframe] = useState<string>("");
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [chart, setChart] = useState({ xKey: "", yKey: "", chartType: "Bar" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cargar dataframes disponibles desde el backend
  useEffect(() => {
    const fetchDataframes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dataframes/`);
        if (response.ok) {
          const dataframesData = await response.json();
          setDataframes(dataframesData);
        } else {
          setError("Error cargando dataframes");
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Error de conexión con el servidor");
      }
    };

    fetchDataframes();
  }, []);

  const handleDataframeChange = async (dataframeId: string) => {
    setSelectedDataframe(dataframeId);
    setLoading(true);
    setError("");
    
    try {
      // Obtener datos del dataframe seleccionado desde el backend
      const response = await fetch(`${API_BASE_URL}/dataframes/${dataframeId}/preview?rows=50`);
      
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        setColumns(result.columns);
        
        if (result.columns.length >= 2) {
          setChart({
            xKey: result.columns[0],
            yKey: result.columns[1],
            chartType: "Bar"
          });
        }
      } else {
        setError("Error cargando datos del dataframe");
        setData([]);
        setColumns([]);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      setError("Error de conexión");
      setData([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Gráficas de Datos</h1>
        <p className="text-gray-600">
          Selecciona un dataframe y visualiza los datos con gráficas interactivas.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Selector de DataFrame */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar DataFrame</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataframes.map((df) => (
            <button
              key={df.id}
              onClick={() => handleDataframeChange(df.id)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedDataframe === df.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <h3 className="font-medium text-gray-900">{df.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{df.description}</p>
              <div className="mt-2 text-xs text-gray-500">
                <span>{df.row_count} filas • {df.file_size}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando datos...</span>
        </div>
      )}

      {!loading && data.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <ChartSelector
              columns={columns}
              onConfigChange={(xKey, yKey, chartType) => setChart({ xKey, yKey, chartType })}
              data={data}
              xKey={chart.xKey}
              yKey={chart.yKey}
              chartType={chart.chartType}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Visualización</h2>
            <DataChart
              data={data}
              xKey={chart.xKey}
              yKey={chart.yKey}
              chartType={chart.chartType}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tabla de Datos</h2>
            <DataTable data={data} />
          </div>
        </>
      )}

      {!loading && selectedDataframe && data.length === 0 && !error && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">No se encontraron datos para el dataframe seleccionado.</p>
        </div>
      )}
    </div>
  );
}
