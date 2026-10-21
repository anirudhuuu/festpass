import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { PageShell } from '@/components/page-shell'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/components/ui/toast'
import { LiveCheckPage } from '@/demo/live-check'
import { StudentProvider } from '@/lib/student'
import { BookingsPage } from '@/pages/bookings'
import { EventsPage } from '@/pages/events'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <StudentProvider>
          <BrowserRouter>
            <PageShell>
              <Routes>
                <Route path="/" element={<EventsPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/check" element={<LiveCheckPage />} />
              </Routes>
            </PageShell>
          </BrowserRouter>
        </StudentProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
