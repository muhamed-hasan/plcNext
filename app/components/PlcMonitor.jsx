'use client';

import { useEffect, useState } from 'react';

export default function PlcMonitor() {
  const [plcData, setPlcData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/plc');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setPlcData(data.data);
        setLastUpdate(new Date());
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Error fetching PLC data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and then every 10 seconds
  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, 10000);
    
    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const getRowClassName = (key) => {
    if (key.startsWith('T')) return 'bg-red-50';
    if (key.startsWith('H')) return 'bg-blue-50';
    if (key.includes('Speed')) return 'bg-green-50';
    return '';
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md" dir="rtl">
      <h1 className="text-2xl font-bold text-center mb-6">مراقبة بيانات PLC</h1>
      
      {lastUpdate && (
        <p className="text-center text-gray-600 mb-4">
          آخر تحديث: {lastUpdate.toLocaleString('ar-SA')}
        </p>
      )}
      
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg text-center">
          {error}
        </div>
      )}
      
      {loading && !plcData ? (
        <div className="text-center p-4">جاري التحميل...</div>
      ) : (
        <div className="space-y-2">
          {plcData && Object.entries(plcData).map(([key, value]) => (
            <div 
              key={key} 
              className={`flex justify-between p-3 border-b ${getRowClassName(key)}`}
            >
              <span className="font-semibold">{key}</span>
              <span className="text-blue-600">
                {typeof value === 'number' ? 
                  (key.includes('Speed') ? value.toFixed(2) : value) : 
                  value}
              </span>
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={fetchData}
        className="mt-6 mx-auto block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
      >
        تحديث البيانات
      </button>
    </div>
  );
} 