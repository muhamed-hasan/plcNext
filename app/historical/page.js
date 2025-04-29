'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
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

export default function HistoricalDataPage() {
  const [historicalData, setHistoricalData] = useState({
    temperatures: [],
    humidity: [],
    airSpeed: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [darkMode, setDarkMode] = useState(false);
  const [customRange, setCustomRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showCustomRange, setShowCustomRange] = useState(false);

  // Fetch historical data based on time range
  const fetchHistoricalData = async (range = '24h', customDates = null) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `/api/history?timeRange=${range}`;
      
      // Add custom date parameters if using custom range
      if (range === 'custom' && customDates) {
        url += `&startDate=${customDates.startDate}&endDate=${customDates.endDate}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setHistoricalData(result.data);
    } catch (err) {
      setError(err.message || 'Error fetching historical data');
    } finally {
      setLoading(false);
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    
    if (range === 'custom') {
      setShowCustomRange(true);
    } else {
      setShowCustomRange(false);
      fetchHistoricalData(range);
    }
  };

  // Handle custom range submission
  const handleCustomRangeSubmit = (e) => {
    e.preventDefault();
    
    if (!customRange.startDate || !customRange.endDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    fetchHistoricalData('custom', customRange);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchHistoricalData(timeRange);
  }, []);

  // Chart options
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
          tooltipFormat: 'yyyy-MM-dd HH:mm',
          displayFormats: {
            hour: 'MM-dd HH:mm'
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

  // Chart data
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

  return (
    <main className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className="py-6 px-4 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-right mb-2">
            <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>البيانات التاريخية</span>
          </h1>
          
          {/* Dark mode toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} transition-all shadow`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>

        {/* Time range selector */}
        <div className={`mb-6 p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            اختر الفترة الزمنية
          </h2>
          
          <div className="flex flex-wrap gap-2 mb-4" dir="rtl">
            <button 
              onClick={() => handleTimeRangeChange('24h')}
              className={`px-4 py-2 rounded-md transition-all ${timeRange === '24h' 
                ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')}`}
            >
              24 ساعة
            </button>
            <button 
              onClick={() => handleTimeRangeChange('7d')}
              className={`px-4 py-2 rounded-md transition-all ${timeRange === '7d' 
                ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')}`}
            >
              7 أيام
            </button>
            <button 
              onClick={() => handleTimeRangeChange('30d')}
              className={`px-4 py-2 rounded-md transition-all ${timeRange === '30d' 
                ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')}`}
            >
              30 يوم
            </button>
            <button 
              onClick={() => handleTimeRangeChange('custom')}
              className={`px-4 py-2 rounded-md transition-all ${timeRange === 'custom' 
                ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') 
                : (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')}`}
            >
              فترة مخصصة
            </button>
          </div>
          
          {/* Custom date range form */}
          {showCustomRange && (
            <form onSubmit={handleCustomRangeSubmit} className="mt-4 p-4 rounded-md border border-gray-300 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
                <div>
                  <label className="block mb-2">تاريخ البداية</label>
                  <input 
                    type="datetime-local" 
                    className={`w-full p-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    value={customRange.startDate}
                    onChange={(e) => setCustomRange({...customRange, startDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">تاريخ النهاية</label>
                  <input 
                    type="datetime-local" 
                    className={`w-full p-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    value={customRange.endDate}
                    onChange={(e) => setCustomRange({...customRange, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="mt-4 text-left">
                <button 
                  type="submit" 
                  className={`px-4 py-2 rounded-md transition-all ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  عرض البيانات
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className={`mb-6 p-4 rounded-md border-l-4 border-red-500 ${darkMode ? 'bg-red-900/30 text-white' : 'bg-red-100'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mr-3">
                <p className={darkMode ? 'text-red-300' : 'text-red-700'}>{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="mb-6 p-6 rounded-lg shadow-md flex justify-center items-center">
            <svg className={`animate-spin h-8 w-8 mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>جاري تحميل البيانات...</span>
          </div>
        )}
        
        {/* Data display */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temperature Chart */}
            <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                درجات الحرارة
              </h3>
              <div className="h-80">
                <Line options={chartOptions} data={temperatureChartData} />
              </div>
            </div>
            
            {/* Humidity Chart */}
            <div className={`rounded-lg shadow-md p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                الرطوبة
              </h3>
              <div className="h-80">
                <Line options={chartOptions} data={humidityChartData} />
              </div>
            </div>
            
            {/* Air Speed Chart */}
            <div className={`rounded-lg shadow-md p-6 col-span-1 lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                سرعة الهواء
              </h3>
              <div className="h-80">
                <Line options={chartOptions} data={airSpeedChartData} />
              </div>
            </div>
            
            {/* Data Table */}
            <div className={`rounded-lg shadow-md p-6 col-span-1 lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                جدول البيانات
              </h3>
              
              <div className="overflow-x-auto">
                <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        الوقت
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        T1
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        T2
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        T3
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        H1
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        H2
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        سرعة الهواء
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {historicalData.temperatures.length > 0 ? (
                      historicalData.temperatures.map((item, index) => {
                        const humidityItem = historicalData.humidity[index] || {};
                        const airSpeedItem = historicalData.airSpeed[index] || {};
                        
                        return (
                          <tr key={index} className={index % 2 === 0 ? (darkMode ? 'bg-gray-900' : 'bg-white') : (darkMode ? 'bg-gray-800' : 'bg-gray-50')}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {new Date(item.time).toLocaleString('ar-SA')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {item.T1 !== null ? item.T1 : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {item.T2 !== null ? item.T2 : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {item.T3 !== null ? item.T3 : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {humidityItem.H1 !== null ? humidityItem.H1 : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {humidityItem.H2 !== null ? humidityItem.H2 : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {airSpeedItem.Air_Speed !== null ? airSpeedItem.Air_Speed : '-'}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm">
                          لا توجد بيانات متاحة
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
