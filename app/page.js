import Image from 'next/image'
import PlcMonitor from './components/PlcMonitor'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 mb-6">
          <h1 className="text-3xl font-bold text-center lg:text-right mb-2" dir="rtl">
            <span className="text-blue-600">نظام مراقبة</span> PLC S7-1200
          </h1>
          <p className="text-gray-600 text-center lg:text-right" dir="rtl">
            مراقبة وتحليل البيانات من جهاز Siemens S7-1200 PLC
          </p>
        </div>
        <PlcMonitor />
      </div>
    </main>
  )
}
