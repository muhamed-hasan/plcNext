'use client';

import { useState } from 'react';

export default function Alerts() {
  const [alertFilters, setAlertFilters] = useState({
    severity: 'all',
    timeRange: '24h',
    status: 'all'
  });
  
  const [alertThresholds, setAlertThresholds] = useState({
    tempHigh: 30,
    tempLow: 15,
    humidityHigh: 70,
    humidityLow: 30,
    airSpeedHigh: 10
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setAlertFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThresholdChange = (e) => {
    const { name, value } = e.target;
    setAlertThresholds(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleSaveThresholds = (e) => {
    e.preventDefault();
    // Here you would save thresholds to backend/local storage
    alert('تم حفظ إعدادات التنبيهات بنجاح');
  };

  // Sample alerts data
  const alerts = [
    {
      id: 1,
      type: 'temperature',
      message: 'ارتفاع درجة الحرارة فوق الحد المسموح',
      value: '32.5°C',
      threshold: '30°C',
      timestamp: '2025-04-29 04:45:23',
      severity: 'high',
      status: 'active'
    },
    {
      id: 2,
      type: 'humidity',
      message: 'انخفاض مستوى الرطوبة تحت الحد المسموح',
      value: '25%',
      threshold: '30%',
      timestamp: '2025-04-29 02:32:10',
      severity: 'medium',
      status: 'active'
    },
    {
      id: 3,
      type: 'airSpeed',
      message: 'ارتفاع سرعة الهواء فوق الحد المسموح',
      value: '12.3 m/s',
      threshold: '10 m/s',
      timestamp: '2025-04-28 23:15:47',
      severity: 'low',
      status: 'resolved'
    },
    {
      id: 4,
      type: 'connection',
      message: 'انقطاع الاتصال بجهاز PLC',
      value: 'غير متصل',
      threshold: 'N/A',
      timestamp: '2025-04-28 22:05:33',
      severity: 'critical',
      status: 'resolved'
    }
  ];

  // Filter alerts based on current filters
  const filteredAlerts = alerts.filter(alert => {
    if (alertFilters.severity !== 'all' && alert.severity !== alertFilters.severity) {
      return false;
    }
    if (alertFilters.status !== 'all' && alert.status !== alertFilters.status) {
      return false;
    }
    // For timeRange we would typically filter by timestamp, but this is simplified
    return true;
  });

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusStyle = (status) => {
    return status === 'active' 
      ? 'bg-red-100 text-red-800 border-red-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'temperature':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v7.95l3.97 3.97a1 1 0 11-1.41 1.41l-4.27-4.26a1 1 0 01-.3-.71V3a1 1 0 011-1z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M10 18a4 4 0 10-4-4 4 4 0 004 4zm0-6a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" />
          </svg>
        );
      case 'humidity':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.07 0 1 1 0 00-.002 1.415z" />
          </svg>
        );
      case 'airSpeed':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        );
      case 'connection':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-right mb-2">
            <span className="text-blue-600">التنبيهات</span>
          </h1>
          <p className="text-gray-600 text-right">
            إدارة ومراقبة تنبيهات النظام
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center justify-center p-2 bg-green-100 text-green-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <h3 className="text-lg font-medium text-right">
                تنبيهات نشطة
              </h3>
            </div>
            <p className="text-3xl font-bold text-right">
              {alerts.filter(a => a.status === 'active').length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center justify-center p-2 bg-red-100 text-red-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              <h3 className="text-lg font-medium text-right">
                تنبيهات حرجة
              </h3>
            </div>
            <p className="text-3xl font-bold text-right">
              {alerts.filter(a => a.severity === 'critical' && a.status === 'active').length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center justify-center p-2 bg-blue-100 text-blue-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              <h3 className="text-lg font-medium text-right">
                إجمالي التنبيهات
              </h3>
            </div>
            <p className="text-3xl font-bold text-right">
              {alerts.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-right">إعدادات التنبيهات</h2>
          
          <form onSubmit={handleSaveThresholds} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="tempHigh" className="block text-gray-700 text-right mb-2">الحد الأقصى لدرجة الحرارة (°C)</label>
                <input 
                  type="number" 
                  id="tempHigh" 
                  name="tempHigh"
                  value={alertThresholds.tempHigh}
                  onChange={handleThresholdChange}
                  className="shadow border rounded w-full py-2 px-3 text-right text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div>
                <label htmlFor="tempLow" className="block text-gray-700 text-right mb-2">الحد الأدنى لدرجة الحرارة (°C)</label>
                <input 
                  type="number" 
                  id="tempLow" 
                  name="tempLow"
                  value={alertThresholds.tempLow}
                  onChange={handleThresholdChange}
                  className="shadow border rounded w-full py-2 px-3 text-right text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div>
                <label htmlFor="humidityHigh" className="block text-gray-700 text-right mb-2">الحد الأقصى للرطوبة (%)</label>
                <input 
                  type="number" 
                  id="humidityHigh" 
                  name="humidityHigh"
                  value={alertThresholds.humidityHigh}
                  onChange={handleThresholdChange}
                  className="shadow border rounded w-full py-2 px-3 text-right text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div>
                <label htmlFor="humidityLow" className="block text-gray-700 text-right mb-2">الحد الأدنى للرطوبة (%)</label>
                <input 
                  type="number" 
                  id="humidityLow" 
                  name="humidityLow"
                  value={alertThresholds.humidityLow}
                  onChange={handleThresholdChange}
                  className="shadow border rounded w-full py-2 px-3 text-right text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div>
                <label htmlFor="airSpeedHigh" className="block text-gray-700 text-right mb-2">الحد الأقصى لسرعة الهواء (m/s)</label>
                <input 
                  type="number" 
                  id="airSpeedHigh" 
                  name="airSpeedHigh"
                  value={alertThresholds.airSpeedHigh}
                  onChange={handleThresholdChange}
                  className="shadow border rounded w-full py-2 px-3 text-right text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                حفظ الإعدادات
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-right">قائمة التنبيهات</h2>
            <div className="flex flex-wrap items-center space-x-4 space-x-reverse mt-2 sm:mt-0">
              <div className="flex items-center">
                <select 
                  name="severity" 
                  value={alertFilters.severity}
                  onChange={handleFilterChange}
                  className="border rounded py-1 px-2 ml-2 text-right"
                >
                  <option value="all">جميع المستويات</option>
                  <option value="critical">حرج</option>
                  <option value="high">مرتفع</option>
                  <option value="medium">متوسط</option>
                  <option value="low">منخفض</option>
                </select>
                <label className="text-sm text-gray-600">المستوى:</label>
              </div>
              
              <div className="flex items-center">
                <select 
                  name="timeRange" 
                  value={alertFilters.timeRange}
                  onChange={handleFilterChange}
                  className="border rounded py-1 px-2 ml-2 text-right"
                >
                  <option value="24h">24 ساعة</option>
                  <option value="7d">7 أيام</option>
                  <option value="30d">30 يوم</option>
                  <option value="all">الكل</option>
                </select>
                <label className="text-sm text-gray-600">الفترة:</label>
              </div>
              
              <div className="flex items-center">
                <select 
                  name="status" 
                  value={alertFilters.status}
                  onChange={handleFilterChange}
                  className="border rounded py-1 px-2 ml-2 text-right"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="resolved">تم حله</option>
                </select>
                <label className="text-sm text-gray-600">الحالة:</label>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {filteredAlerts.length > 0 ? (
              <div className="space-y-4">
                {filteredAlerts.map(alert => (
                  <div key={alert.id} className={`border rounded-lg p-4 ${alert.status === 'active' ? 'border-red-200' : 'border-gray-200'}`}>
                    <div className="flex flex-wrap justify-between items-start">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center p-2 rounded-full ${getStatusStyle(alert.status)}`}>
                          {alert.status === 'active' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0">
                        <span className={`text-xs px-2 py-1 rounded ${getSeverityStyle(alert.severity)}`}>
                          {alert.severity === 'critical' && 'حرج'}
                          {alert.severity === 'high' && 'مرتفع'}
                          {alert.severity === 'medium' && 'متوسط'}
                          {alert.severity === 'low' && 'منخفض'}
                        </span>
                        <span className="text-sm text-gray-500 mr-2 text-right">
                          {alert.timestamp}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center mb-1">
                        <span className="text-blue-600 ml-2">
                          {getTypeIcon(alert.type)}
                        </span>
                        <h3 className="text-lg font-medium text-right">
                          {alert.message}
                        </h3>
                      </div>
                      <div className="flex text-sm text-gray-600">
                        <span className="mr-4">القيمة: {alert.value}</span>
                        <span>الحد: {alert.threshold}</span>
                      </div>
                    </div>
                    
                    {alert.status === 'active' && (
                      <div className="mt-3 flex justify-end">
                        <button className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded focus:outline-none focus:shadow-outline">
                          تأكيد الإصلاح
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="mt-2 text-gray-500">لا توجد تنبيهات تطابق معايير التصفية</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
