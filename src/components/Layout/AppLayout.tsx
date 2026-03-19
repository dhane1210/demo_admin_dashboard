import { Box, Flex, Text, IconButton, useDisclosure, Tooltip } from '@chakra-ui/react'
import { FiBell, FiInfo, FiLogOut } from 'react-icons/fi'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useEffect, useState } from 'react'
import { alertApi } from '../../api/alerts'
import InstructionsModal from '../InstructionsModal'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/shipments': 'Shipments',
  '/search': 'Search',
  '/calendar': 'Calendar',
  '/pricing': 'Pricing',
  '/alerts': 'Alerts',
  '/users': 'Users',
}

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const pageTitle = pageTitles[location.pathname] || 'Envio Logistics'
  const [unreadAlerts, setUnreadAlerts] = useState(0)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    alertApi.getAll({ status: 'OPEN', limit: 1 }).then(res => {
      setUnreadAlerts(res.pagination?.total || 0)
    }).catch(console.error)
  }, [location.pathname]) // Refresh count on navigation

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    navigate('/login')
  }

  return (
    <Flex minH="100vh">
      <Sidebar />
      <Box flex="1" ml="240px">
        {/* Top Header */}
        <Flex
          as="header"
          align="center"
          justify="space-between"
          px={8}
          py={4}
          borderBottom="1px solid"
          borderColor="surface.border"
          bg="rgba(15,17,23,0.8)"
          backdropFilter="blur(12px)"
          position="sticky"
          top={0}
          zIndex={10}
        >
          <Box>
            <Text fontSize="xl" fontWeight="700" color="white">{pageTitle}</Text>
            <Text fontSize="xs" color="#64748b">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </Box>
          <Flex align="center" gap={3}>
            <Tooltip label="How to use this dashboard" openDelay={500}>
              <IconButton
                aria-label="Dashboard Instructions"
                icon={<FiInfo />}
                variant="ghost"
                borderRadius="10px"
                fontSize="lg"
                onClick={onOpen}
              />
            </Tooltip>

            <Box position="relative">
              <IconButton
                aria-label="Notifications"
                icon={<FiBell />}
                variant="ghost"
                borderRadius="10px"
                fontSize="lg"
                onClick={() => navigate('/alerts')}
              />
              {unreadAlerts > 0 && (
                <Box
                  position="absolute"
                  top="6px"
                  right="8px"
                  w="8px"
                  h="8px"
                  bg="red.500"
                  borderRadius="full"
                  boxShadow="0 0 0 2px rgba(15,17,23,0.8)"
                />
              )}
            </Box>
            <Flex
              align="center" gap={2} px={3} py={2}
              borderRadius="10px" bg="surface.card" border="1px solid" borderColor="surface.border"
            >
              <Box w="32px" h="32px" borderRadius="full" bg="brand.500" display="flex" alignItems="center" justifyContent="center">
                <Text fontSize="sm" fontWeight="700" color="white">A</Text>
              </Box>
              <Box mr={2}>
                <Text fontSize="sm" fontWeight="600" color="white">Admin</Text>
                <Text fontSize="xs" color="#64748b">{import.meta.env.VITE_SUPPORT_EMAIL || 'admin@envio.lk'}</Text>
              </Box>
              <Tooltip label="Logout">
                <IconButton
                  aria-label="Logout"
                  icon={<FiLogOut />}
                  variant="ghost"
                  size="sm"
                  color="#f87171"
                  onClick={handleLogout}
                  borderRadius="8px"
                />
              </Tooltip>
            </Flex>
          </Flex>
        </Flex>

        {/* Page Content */}
        <Box px={8} py={6} minH="calc(100vh - 73px)">
          <Outlet />
        </Box>
      </Box>

      <InstructionsModal isOpen={isOpen} onClose={onClose} />
    </Flex>
  )
}
