import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from './components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'نظام مراقبة PLC',
  description: 'نظام مراقبة وتحليل بيانات من جهاز Siemens S7-1200 PLC',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <div className="flex">
          <div className="flex-grow min-h-screen mr-16 md:mr-64">
            {children}
          </div>
          <Sidebar />
        </div>
      </body>
    </html>
  )
}
