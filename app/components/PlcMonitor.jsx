'use client';

import { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

export default function PlcMonitor() {
  const [plcData, setPlcData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [historicalData, setHistoricalData] = useState({
    temperatures: [],
    humidity: [],
    airSpeed: []
  });
  const [timeRange, setTimeRange] = useState('24h');
  const [darkMode, setDarkMode] = useState(false);

  // Mock function to simulate fetching historical data from a database
  // Replace this with actual database connection
  const fetchHistoricalData = async (timeRange = '24h') => {
    try {
      const response = await fetch(`/api/history?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return {
        temperatures: [],
        humidity: [],
        airSpeed: []
      };
    }
  };

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

        // Also fetch historical data from database
        const historical = await fetchHistoricalData(timeRange);
        setHistoricalData(historical);
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

  // Fetch historical data when timeRange changes
  useEffect(() => {
    const fetchHistory = async () => {
      const historical = await fetchHistoricalData(timeRange);
      setHistoricalData(historical);
    };
    
    fetchHistory();
  }, [timeRange]);

  // Updated chart options with dark mode support
  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#e5e7eb' : '#374151'
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#1f2937' : '#fff',
        titleColor: darkMode ? '#e5e7eb' : '#111827',
        bodyColor: darkMode ? '#e5e7eb' : '#374151',
        borderColor: darkMode ? '#4b5563' : '#e5e7eb',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          tooltipFormat: 'HH:mm',
          displayFormats: {
            hour: 'HH:mm'
          }
        },
        title: {
          display: true,
          text: 'Time',
          color: darkMode ? '#e5e7eb' : '#374151'
        },
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: darkMode ? '#e5e7eb' : '#374151'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Value',
          color: darkMode ? '#e5e7eb' : '#374151'
        },
        grid: {
          color: darkMode ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: darkMode ? '#e5e7eb' : '#374151'
        }
      }
    }
  };

  // Temperature chart data
  const temperatureChartData = {
    datasets: [
      {
        label: 'T1',
        data: historicalData.temperatures.map(item => ({ x: new Date(item.time), y: item.T1 })),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'T2',
        data: historicalData.temperatures.map(item => ({ x: new Date(item.time), y: item.T2 })),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'T3',
        data: historicalData.temperatures.map(item => ({ x: new Date(item.time), y: item.T3 })),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }
    ],
  };

  // Humidity chart data
  const humidityChartData = {
    datasets: [
      {
        label: 'H1',
        data: historicalData.humidity.map(item => ({ x: new Date(item.time), y: item.H1 })),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'H2',
        data: historicalData.humidity.map(item => ({ x: new Date(item.time), y: item.H2 })),
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
      }
    ],
  };

  // Air Speed chart data
  const airSpeedChartData = {
    datasets: [
      {
        label: 'Air Speed',
        data: historicalData.airSpeed.map(item => ({ x: new Date(item.time), y: parseFloat(item.Air_Speed) })),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
      }
    ],
  };

  // Helper function to render appropriate icon for data type
  const getIcon = (key) => {
    if (key.startsWith('T')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    } else if (key.startsWith('H')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h7a2 2 0 012 2v7m0 0a2 2 0 01-2 2H5a2 2 0 01-2-2v-7m2-9h7a2 2 0 012 2v7m0 0a2 2 0 01-2 2H5" />
        </svg>
      );
    } else if (key.includes('Speed')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    }
    return null;
  };

  // Helper function for background styles - with dark mode support
  const getRowClassName = (key) => {
    if (darkMode) {
      if (key.startsWith('T')) return 'bg-gradient-to-r from-red-900/30 to-transparent';
      if (key.startsWith('H')) return 'bg-gradient-to-r from-blue-900/30 to-transparent';
      if (key.includes('Speed')) return 'bg-gradient-to-r from-green-900/30 to-transparent';
      return '';
    } else {
      if (key.startsWith('T')) return 'bg-gradient-to-r from-red-50 to-transparent';
      if (key.startsWith('H')) return 'bg-gradient-to-r from-blue-50 to-transparent';
      if (key.includes('Speed')) return 'bg-gradient-to-r from-green-50 to-transparent';
      return '';
    }
  };

  return (
    <div className={`w-full px-4 sm:px-6 space-y-6 ${darkMode ? 'text-white' : ''}`} dir="rtl">
      {/* Header with gradient background */}
      <div className={`${darkMode ? 'bg-gradient-to-l from-blue-800 to-blue-900' : 'bg-gradient-to-l from-blue-500 to-blue-700'} rounded-lg shadow-lg p-6`}>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold text-white">مراقبة بيانات PLC</h1>
          
          <div className="flex items-center mt-3 md:mt-0">
            {lastUpdate && (
              <p className="text-white/80">
                آخر تحديث: {lastUpdate.toLocaleString('ar-SA')}
              </p>
            )}
            
            {/* Dark mode toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="ml-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-200" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
          
          <button 
            onClick={fetchData}
            className={`mt-4 md:mt-0 py-2 px-4 rounded-md flex items-center transition-all shadow-md ${darkMode ? 'bg-blue-900 text-white hover:bg-blue-800' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            )}
            تحديث البيانات
          </button>
        </div>
      </div>
      
      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column - Current values */}
        <div className="lg:col-span-1 space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-md shadow dark:bg-red-900/30 dark:text-white">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mr-3">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Current PLC Data */}
          <div className={`rounded-lg shadow-md p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              القيم الحالية
            </h2>
            
            {loading && !plcData ? (
              <div className="flex justify-center items-center py-8">
                <svg className={`animate-spin h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="mr-2">جاري التحميل...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {plcData && Object.entries(plcData).map(([key, value]) => (
                  <div 
                    key={key} 
                    className={`p-3 rounded-lg border hover:shadow-md transition-all ${getRowClassName(key)} ${darkMode ? 'border-gray-700' : ''}`}
                  >
                    <div className="flex items-center">
                      {getIcon(key)}
                      <span className="font-semibold">{key}</span>
                    </div>
                    <div className={`mt-2 text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {typeof value === 'number' ? 
                        (key.includes('Speed') ? value.toFixed(2) : value) : 
                        value}
                      <span className={`text-sm mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                        {key.startsWith('T') ? '°C' : key.startsWith('H') ? '%' : key.includes('Speed') ? 'm/s' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - Charts */}
        <div className="lg:col-span-3 space-y-6">
          {/* Historical Charts */}
          <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <h2 className={`text-xl font-semibold flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                البيانات التاريخية
              </h2>
              
              <div className={`mt-4 md:mt-0 p-1 rounded-lg flex space-x-1 space-x-reverse ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <button 
                  onClick={() => setTimeRange('24h')}
                  className={`px-3 py-1 rounded transition-all ${timeRange === '24h' 
                    ? (darkMode ? 'bg-blue-700 text-white shadow-md' : 'bg-blue-600 text-white shadow-md') 
                    : (darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200')}`}
                >
                  24 ساعة
                </button>
                <button 
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 rounded transition-all ${timeRange === '7d' 
                    ? (darkMode ? 'bg-blue-700 text-white shadow-md' : 'bg-blue-600 text-white shadow-md') 
                    : (darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200')}`}
                >
                  7 أيام
                </button>
                <button 
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 rounded transition-all ${timeRange === '30d' 
                    ? (darkMode ? 'bg-blue-700 text-white shadow-md' : 'bg-blue-600 text-white shadow-md') 
                    : (darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200')}`}
                >
                  30 يوم
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Temperature Chart */}
              <div className={`rounded-lg border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm`}>
                <h3 className={`text-lg font-medium mb-4 flex items-center ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  درجات الحرارة
                </h3>
                {loading && historicalData.temperatures.length === 0 ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <svg className={`animate-spin h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p>جاري تحميل البيانات...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-80">
                    <Line options={chartOptions} data={temperatureChartData} />
                  </div>
                )}
              </div>
              
              {/* Humidity Chart */}
              <div className={`rounded-lg border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm`}>
                <h3 className={`text-lg font-medium mb-4 flex items-center ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h7a2 2 0 012 2v7m0 0a2 2 0 01-2 2H5a2 2 0 01-2-2v-7m2-9h7a2 2 0 012 2v7m0 0a2 2 0 01-2 2H5" />
                  </svg>
                  الرطوبة
                </h3>
                {loading && historicalData.humidity.length === 0 ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <svg className={`animate-spin h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p>جاري تحميل البيانات...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-80">
                    <Line options={chartOptions} data={humidityChartData} />
                  </div>
                )}
              </div>
              
              {/* Air Speed Chart - Full width on all screens */}
              <div className={`rounded-lg border p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm xl:col-span-2`}>
                <h3 className={`text-lg font-medium mb-4 flex items-center ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  سرعة الهواء
                </h3>
                {loading && historicalData.airSpeed.length === 0 ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <svg className={`animate-spin h-8 w-8 mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p>جاري تحميل البيانات...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-80">
                    <Line options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        y: {
                          ...chartOptions.scales.y,
                          title: {
                            display: true,
                            text: 'm/s',
                            color: darkMode ? '#e5e7eb' : '#374151'
                          }
                        }
                      }
                    }} data={airSpeedChartData} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 