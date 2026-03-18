import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import theme from './theme'
import AppLayout from './components/Layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Shipments from './pages/Shipments'
import Search from './pages/Search'
import Calendar from './pages/Calendar'
import Pricing from './pages/Pricing'
import Alerts from './pages/Alerts'
import Users from './pages/Users'
import Mail from './pages/Mail'
import Login from './pages/Login'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('auth_token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode="dark" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/search" element={<Search />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/users" element={<Users />} />
            <Route path="mail" element={<Mail />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  )
}

export default App
