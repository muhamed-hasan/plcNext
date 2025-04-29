'use client';

import { useState } from 'react';

export default function Reports() {
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    // Here you would generate and download the report
    alert(`جاري إنشاء تقرير ${reportType} من ${dateRange.startDate} إلى ${dateRange.endDate}`);
  };

  const reportTypes = [
    { id: 'daily', label: 'تقرير يومي' },
    { id: 'weekly', label: 'تقرير أسبوعي' },
    { id: 'monthly', label: 'تقرير شهري' },
    { id: 'custom', label: 'تقرير مخصص' }
  ];

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="py-6 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-right mb-2">
            <span className="text-blue-600">التقارير</span>
          </h1>
          <p className="text-gray-600 text-right">
            إنشاء وتحميل تقارير مفصلة عن بيانات PLC
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-right">إنشاء تقرير جديد</h2>
          
          <form onSubmit={handleGenerateReport} className="space-y-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-right mb-2">نوع التقرير</label>
              <div className="flex flex-wrap justify-end gap-4">
                {reportTypes.map(type => (
                  <div key={type.id} className="flex items-center">
                    <label htmlFor={type.id} className="mr-2 text-gray-700">{type.label}</label>
                    <input 
                      type="radio" 
                      id={type.id} 
                      name="reportType"
                      value={type.id}
                      checked={reportType === type.id}
                      onChange={() => setReportType(type.id)}
                      className="form-radio text-blue-600"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="startDate" className="block text-gray-700 text-right mb-2">من تاريخ</label>
                <input 
                  type="date" 
                  id="startDate" 
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  className="shadow border rounded w-full py-2 px-3 text-right text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-gray-700 text-right mb-2">إلى تاريخ</label>
                <input 
                  type="date" 
                  id="endDate" 
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  className="shadow border rounded w-full py-2 px-3 text-right text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-right mb-2">البيانات المراد تضمينها</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-end">
                  <label htmlFor="includeTemp" className="mr-2 text-gray-700">درجة الحرارة</label>
                  <input 
                    type="checkbox" 
                    id="includeTemp" 
                    defaultChecked={true}
                    className="form-checkbox text-blue-600"
                  />
                </div>
                
                <div className="flex items-center justify-end">
                  <label htmlFor="includeHumidity" className="mr-2 text-gray-700">الرطوبة</label>
                  <input 
                    type="checkbox" 
                    id="includeHumidity" 
                    defaultChecked={true}
                    className="form-checkbox text-blue-600"
                  />
                </div>
                
                <div className="flex items-center justify-end">
                  <label htmlFor="includeAirSpeed" className="mr-2 text-gray-700">سرعة الهواء</label>
                  <input 
                    type="checkbox" 
                    id="includeAirSpeed" 
                    defaultChecked={true}
                    className="form-checkbox text-blue-600"
                  />
                </div>
                
                <div className="flex items-center justify-end">
                  <label htmlFor="includeAlerts" className="mr-2 text-gray-700">التنبيهات</label>
                  <input 
                    type="checkbox" 
                    id="includeAlerts" 
                    defaultChecked={true}
                    className="form-checkbox text-blue-600"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-right mb-2">تنسيق التقرير</label>
              <div className="flex justify-end gap-4">
                <div className="flex items-center">
                  <label htmlFor="formatPDF" className="mr-2 text-gray-700">PDF</label>
                  <input 
                    type="radio" 
                    id="formatPDF" 
                    name="reportFormat"
                    defaultChecked={true}
                    className="form-radio text-blue-600"
                  />
                </div>
                
                <div className="flex items-center">
                  <label htmlFor="formatExcel" className="mr-2 text-gray-700">Excel</label>
                  <input 
                    type="radio" 
                    id="formatExcel" 
                    name="reportFormat"
                    className="form-radio text-blue-600"
                  />
                </div>
                
                <div className="flex items-center">
                  <label htmlFor="formatCSV" className="mr-2 text-gray-700">CSV</label>
                  <input 
                    type="radio" 
                    id="formatCSV" 
                    name="reportFormat"
                    className="form-radio text-blue-600"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                إنشاء التقرير
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-right">التقارير الأخيرة</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-right">نوع التقرير</th>
                  <th className="px-4 py-2 text-right">النطاق الزمني</th>
                  <th className="px-4 py-2 text-right">تاريخ الإنشاء</th>
                  <th className="px-4 py-2 text-right">التنزيل</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2 text-right">تقرير يومي</td>
                  <td className="px-4 py-2 text-right">2025-04-28</td>
                  <td className="px-4 py-2 text-right">2025-04-29</td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-blue-600 hover:text-blue-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-right">تقرير أسبوعي</td>
                  <td className="px-4 py-2 text-right">2025-04-21 - 2025-04-27</td>
                  <td className="px-4 py-2 text-right">2025-04-28</td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-blue-600 hover:text-blue-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-right">تقرير شهري</td>
                  <td className="px-4 py-2 text-right">2025-03-01 - 2025-03-31</td>
                  <td className="px-4 py-2 text-right">2025-04-01</td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-blue-600 hover:text-blue-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
