import { useEffect, useState } from 'react'
import {
  Box, SimpleGrid, Table, Thead, Tbody, Tr, Th, Td,
  Text, Flex, Spinner, IconButton, useToast, Button,
  Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverArrow, PopoverCloseButton,
  VStack
} from '@chakra-ui/react'
import { FiPackage, FiTruck, FiCheckCircle, FiAlertTriangle, FiRefreshCw, FiUsers, FiTrash2 } from 'react-icons/fi'
import { shipmentApi } from '../api/shipments'
import { assignmentApi } from '../api/assignments'
import { alertApi } from '../api/alerts'
import type { Shipment, Assignment, Alert } from '../types'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import ShipmentMap from '../components/ShipmentMap'
import EtaProgressBar from '../components/EtaProgressBar'

export default function Dashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [stats, setStats] = useState({ total: 0, inTransit: 0, arrived: 0, delayed: 0 })
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const [listRes, statsRes, alertsRes] = await Promise.all([
        shipmentApi.getAll(1, 10),
        shipmentApi.getDashboardStats().catch(() => ({ data: {} })),
        alertApi.getAll({ status: 'ACTIVE', limit: 100 }).catch(() => ({ data: [] }))
      ])
      setShipments(listRes.data || [])
      setAlerts((alertsRes.data as any) || [])

      const sd = statsRes.data as Record<string, number> || {}
      setStats({
        total: sd.total || 0,
        inTransit: sd.in_transit || 0,
        arrived: (sd.arrived || 0) + (sd.completed || 0),
        delayed: sd.delayed || 0,
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load'
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="brand.400" thickness="3px" />
      </Flex>
    )
  }

  return (
    <Box>
      {/* Stats */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5} mb={8}>
        <StatCard label="Total Shipments" value={stats.total} icon={FiPackage} accentColor="#6366f1" />
        <StatCard label="In Transit" value={stats.inTransit} icon={FiTruck} accentColor="#4ade80" />
        <StatCard label="Arrived / Completed" value={stats.arrived} icon={FiCheckCircle} accentColor="#60a5fa" />
        <StatCard label="Delayed" value={stats.delayed} icon={FiAlertTriangle} accentColor="#f87171" />
      </SimpleGrid>

      {/* Master Map */}
      <Box mb={8}>
        <Text fontWeight="700" fontSize="lg" color="white" mb={4}>Live Global Tracking Overview</Text>
        <Box bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="14px" overflow="hidden" p={2}>
            <ShipmentMap 
                height="450px"
                shipmentsData={shipments.map(s => s.raw_api_response).filter(Boolean)}
                shipments={shipments}
                alerts={alerts}
            />
        </Box>
      </Box>

      {/* Bottom Grids */}
      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={8}>
        {/* Recent Shipments (takes 2 columns on xl screens) */}
        <Box gridColumn={{ xl: 'span 2' }} bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="14px" overflow="hidden">
          <Flex align="center" justify="space-between" px={5} py={4} borderBottom="1px solid" borderColor="surface.border">
            <Text fontWeight="700" fontSize="md" color="white">Recent Shipments</Text>
            <IconButton
              aria-label="Refresh"
              icon={<FiRefreshCw />}
              variant="ghost"
              size="sm"
              borderRadius="8px"
              onClick={load}
            />
          </Flex>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Shipment #</Th>
                  <Th>Customer</Th>
                  <Th>Vessel</Th>
                  <Th>POL</Th>
                  <Th>POD</Th>
                  <Th>ETA Progress</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {shipments.length === 0 ? (
                  <Tr><Td colSpan={7} textAlign="center" color="#64748b" py={8}>No shipments found. Use Shipments tab to track one.</Td></Tr>
                ) : (
                  shipments.map((s) => (
                    <Tr key={s.id} _hover={{ bg: 'surface.cardHover' }} transition="background 0.15s">
                      <Td fontWeight="600" color="white">{s.shipment_number || '—'}</Td>
                      <Td>
                        <AssignedCustomersPopover shipment_id={s.id} />
                      </Td>
                      <Td color="#cbd5e1">{s.vessel_name || '—'}</Td>
                      <Td color="#cbd5e1">{s.pol_name || '—'}</Td>
                      <Td color="#cbd5e1">{s.pod_name || '—'}</Td>
                      <Td>
                        <EtaProgressBar etd={s.etd} eta={s.eta} ata={s.last_event_date} status={s.status} />
                      </Td>
                      <Td><StatusBadge status={s.status} /></Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Live Alerts Widget (takes 1 column on xl screens) */}
        <Box gridColumn={{ xl: 'span 1' }} bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="14px" overflow="hidden">
          <Flex align="center" justify="space-between" px={5} py={4} borderBottom="1px solid" borderColor="surface.border">
            <Text fontWeight="700" fontSize="md" color="white">Live Alerts</Text>
            <StatusBadge status={alerts.filter(a => a.status === 'OPEN').length > 0 ? 'OPEN' : 'RESOLVED'} />
          </Flex>
          <Box p={4}>
            {alerts.length === 0 ? (
              <Text color="#64748b" fontSize="sm" textAlign="center" py={8}>No active alerts.</Text>
            ) : (
              <Box display="flex" flexDirection="column" gap={3}>
                {alerts.slice(0, 5).map((a) => (
                  <Flex key={a.id} bg="rgba(15,17,23,0.4)" p={3} borderRadius="10px" border="1px solid" borderColor="surface.border" direction="column" gap={2}>
                    <Flex justify="space-between" align="center">
                      <Text color="white" fontWeight="600" fontSize="sm">{a.shipment_number}</Text>
                      <StatusBadge status={a.alert_type} />
                    </Flex>
                    <Text color="#cbd5e1" fontSize="xs" noOfLines={2}>
                      {a.alert_info}
                    </Text>
                    <Flex justify="space-between" align="center" mt={1}>
                      <Text color="#64748b" fontSize="10px">
                        {new Date(a.detection_date || '').toLocaleDateString()}
                      </Text>
                      <StatusBadge status={a.severity} />
                    </Flex>
                  </Flex>
                ))}
              </Box>
            )}
            {alerts.length > 5 && (
              <Button w="full" variant="ghost" size="sm" mt={4} color="brand.400" as="a" href="/alerts">
                View All Alerts
              </Button>
            )}
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  )
}

function AssignedCustomersPopover({ shipment_id }: { shipment_id: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const loadAssignments = async () => {
    setLoading(true)
    try {
      const res = await assignmentApi.getAll(1, 50, undefined, shipment_id)
      setAssignments(res.data || [])
    } catch (e) {
      toast({ title: 'Failed to load customers', status: 'error', duration: 2000 })
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen) loadAssignments()
  }

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this customer assignment?')) return
    try {
      await assignmentApi.delete(id)
      toast({ title: 'Removed', status: 'success', duration: 2000 })
      loadAssignments()
    } catch (e) {
      toast({ title: 'Failed to remove', status: 'error', duration: 2000 })
    }
  }

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="right" preventOverflow>
      <PopoverTrigger>
        <IconButton 
          aria-label="View Customers" 
          icon={<FiUsers />} 
          size="sm" 
          variant="ghost" 
          color="#a5b4fc"
          onClick={handleOpen}
        />
      </PopoverTrigger>
      <PopoverContent bg="#1e2133" borderColor="#2d3148" w="300px">
        <PopoverArrow bg="#1e2133" />
        <PopoverCloseButton color="white" />
        <PopoverBody p={4}>
          <Text fontWeight="600" color="white" mb={3} fontSize="sm">Assigned Customers</Text>
          {loading ? (
            <Flex justify="center" p={4}><Spinner size="sm" color="brand.400" /></Flex>
          ) : assignments.length === 0 ? (
            <Text fontSize="sm" color="text.muted">No customers assigned yet.</Text>
          ) : (
            <VStack align="stretch" spacing={3}>
              {assignments.map(a => (
                <Flex key={a.id} justify="space-between" align="center" bg="#12141f" p={2} borderRadius="8px" border="1px solid" borderColor="surface.border">
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="white">{a.customer_name}</Text>
                    {a.customer_email && <Text fontSize="xs" color="#94a3b8">{a.customer_email}</Text>}
                    <Text fontSize="xs" color="#6366f1" mt={1}>ID: {a.tracking_id}</Text>
                  </Box>
                  <IconButton 
                    aria-label="Remove" 
                    icon={<FiTrash2 />} 
                    size="xs" 
                    variant="ghost" 
                    color="#f87171" 
                    onClick={() => handleRemove(a.id)}
                  />
                </Flex>
              ))}
            </VStack>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
