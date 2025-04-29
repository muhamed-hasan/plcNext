import Image from 'next/image'
import PlcMonitor from './components/PlcMonitor'

export default function Home() {
  return (
    <main className="min-h-screen p-4 bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8" dir="rtl">
          نظام مراقبة PLC S7-1200
        </h1>
        <PlcMonitor />
      </div>
    </main>
  )
}
