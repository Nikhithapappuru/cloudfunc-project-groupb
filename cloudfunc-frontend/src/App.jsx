import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar         from './components/shared/Navbar'
import Dashboard      from './pages/Dashboard'
import FunctionsPage  from './pages/FunctionsPage'
import InvokePage     from './pages/InvokePage'
import JobStatusPage  from './pages/JobStatusPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"            element={<Dashboard />}     />
        <Route path="/functions"   element={<FunctionsPage />} />
        <Route path="/invoke"      element={<InvokePage />}    />
        <Route path="/jobs/:jobId" element={<JobStatusPage />} />
      </Routes>
    </BrowserRouter>
  )
}