'use client'
import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";

interface TableInfo {
  table_name: string;
  filename: string;
  columns: string[];
  file_size: string;
}

export default function ConsultasPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);

  // Cargar tablas disponibles desde el backend
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('http://localhost:8000/sql/tables');
        if (response.ok) {
          const data = await response.json();
          setTables(data.tables);
        } else {
          setError("Error cargando tablas disponibles");
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Error de conexión con el servidor");
      }
    };

    fetchTables();
  }, []);

  // Consultas de ejemplo basadas en las tablas disponibles
  const getExampleQueries = () => {
    if (tables.length === 0) return [];
    
    const examples = [];
    
    // Ejemplo para cualquier tabla
    if (tables.length > 0) {
      const firstTable = tables[0];
      examples.push(`SELECT * FROM ${firstTable.table_name} LIMIT 10`);
      examples.push(`SELECT COUNT(*) as total_filas FROM ${firstTable.table_name}`);
    }
    
    // Ejemplos específicos si existen ciertas tablas
    const irisTable = tables.find(t => t.table_name.includes('iris'));
    if (irisTable) {
      examples.push(`SELECT * FROM ${irisTable.table_name} WHERE "Sepal_Length" > 5.0`);
    }
    
    const customersTable = tables.find(t => t.table_name.includes('customers'));
    if (customersTable) {
      examples.push(`SELECT "customer_state", COUNT(*) as total_clientes FROM ${customersTable.table_name} GROUP BY "customer_state"`);
    }
    
    const rideTable = tables.find(t => t.table_name.includes('ride'));
    if (rideTable) {
      examples.push(`SELECT "driver_id", COUNT(*) as total_viajes FROM ${rideTable.table_name} GROUP BY "driver_id" ORDER BY total_viajes DESC LIMIT 10`);
    }
    
    return examples;
  };

  const executeQuery = async () => {
    if (!query.trim()) {
      setError("Por favor ingresa una consulta SQL");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    
    try {
      const response = await fetch('http://localhost:8000/sql/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setResults(result.data);
        setExecutionTime(result.execution_time);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Error ejecutando la consulta");
        setResults([]);
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  const exportResults = () => {
    if (results.length === 0) return;
    
    const csvContent = [
      Object.keys(results[0]).join(','),
      ...results.map(row => Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'consulta_resultados.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Consultas SQL</h1>
        <p className="text-gray-600">
          Ejecuta consultas SQL personalizadas en los dataframes disponibles y visualiza los resultados.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Panel de consultas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Editor SQL</h2>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe tu consulta SQL aquí..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={executeQuery}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Ejecutando..." : "Ejecutar Consulta"}
              </button>
              
              {results.length > 0 && (
                <button
                  onClick={exportResults}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Exportar CSV
                </button>
              )}
            </div>
          </div>

          {/* Resultados */}
          {results.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Resultados</h2>
                <div className="text-sm text-gray-600">
                  <span>{results.length} fila{results.length !== 1 ? 's' : ''} encontrada{results.length !== 1 ? 's' : ''}</span>
                  {executionTime > 0 && (
                    <span className="ml-4">• {executionTime.toFixed(2)}s</span>
                  )}
                </div>
              </div>
              <DataTable data={results} />
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Ejecutando consulta...</p>
            </div>
          )}
        </div>

        {/* Panel lateral con ejemplos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Consultas de Ejemplo</h2>
            <div className="space-y-3">
              {getExampleQueries().map((exampleQuery, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(exampleQuery)}
                  className="w-full p-3 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <code className="text-blue-600 text-xs">{exampleQuery}</code>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tablas Disponibles</h2>
            <div className="space-y-2">
              {tables.map((table) => (
                <div key={table.table_name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium text-sm">{table.table_name}</span>
                    <div className="text-xs text-gray-600 mt-1">
                      {table.columns.length} columnas • {table.file_size}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
