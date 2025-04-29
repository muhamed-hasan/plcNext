'use client';

import { useState } from 'react';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [refreshRate, setRefreshRate] = useState(10);
  const [connectionSettings, setConnectionSettings] = useState({
    plcIP: '192.168.1.10',
    plcPort: '102',
    timeout: '5000'
  });

  const handleConnectionChange = (e) => {
    const { name, value } = e.target;
    setConnectionSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    // Here you would save settings to backend/local storage
    alert('تم حفظ الإعدادات بنجاح');
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-right mb-2">
            <span className="text-blue-600">الإعدادات</span>
          </h1>
          <p className="text-gray-600 text-right">
            تخصيص إعدادات نظام مراقبة PLC
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-right">إعدادات واجهة المستخدم</h2>
          
          <div className="flex justify-end items-center mb-4">
            <label htmlFor="darkMode" className="mr-2 text-gray-700">الوضع الليلي</label>
            <div className="relative inline-block w-12 align-middle select-none transition duration-200 ease-in">
              <input 
                type="checkbox" 
                name="darkMode" 
                id="darkMode" 
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label 
                htmlFor="darkMode" 
                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
              ></label>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="refreshRate" className="block text-gray-700 text-right mb-2">معدل تحديث البيانات (ثواني)</label>
            <input 
              type="number" 
              id="refreshRate" 
              value={refreshRate}
              onChange={(e) => setRefreshRate(Number(e.target.value))}
              className="shadow border rounded w-full py-2 px-3 text-right text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              min="1"
              max="60"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-right">إعدادات الاتصال بـ PLC</h2>
          
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="mb-4">
              <label htmlFor="plcIP" className="block text-gray-700 text-right mb-2">عنوان IP لجهاز PLC</label>
              <input 
                type="text" 
                id="plcIP" 
                name="plcIP"
                value={connectionSettings.plcIP}
                onChange={handleConnectionChange}
                className="shadow border rounded w-full py-2 px-3 text-right text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="plcPort" className="block text-gray-700 text-right mb-2">المنفذ</label>
              <input 
                type="text" 
                id="plcPort" 
                name="plcPort"
                value={connectionSettings.plcPort}
                onChange={handleConnectionChange}
                className="shadow border rounded w-full py-2 px-3 text-right text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="timeout" className="block text-gray-700 text-right mb-2">مدة انتهاء الاتصال (ميلي ثانية)</label>
              <input 
                type="text" 
                id="timeout" 
                name="timeout"
                value={connectionSettings.timeout}
                onChange={handleConnectionChange}
                className="shadow border rounded w-full py-2 px-3 text-right text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
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
      </div>
    </main>
  );
}
