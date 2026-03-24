import { useState } from 'react'
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Text,
  Button, Input, Select, SimpleGrid, HStack,
  FormControl, FormLabel, useToast, Flex, Spinner,
} from '@chakra-ui/react'
import { FiSearch, FiAlertCircle } from 'react-icons/fi'
import { shipmentApi } from '../api/shipments'
import { alertApi } from '../api/alerts'
import type { Shipment, ShipmentSearchParams } from '../types'
import { fmtDate } from '../utils/formatters'
import { EmptyStateRow } from '../components/common'
import StatusBadge from '../components/StatusBadge'

export default function Search() {
  const [params, setParams] = useState<ShipmentSearchParams>({ page: 1, limit: 20 })
  const [results, setResults] = useState<(Shipment & { activeAlerts?: number })[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const toast = useToast()

  const set = (key: keyof ShipmentSearchParams, value: string) =>
    setParams(p => ({ ...p, [key]: value }))

  const doSearch = async () => {
    setLoading(true); setSearched(true)
    try {
      const res = await shipmentApi.search(params)
      const shipments = res.data || []
      const withAlerts = await Promise.all(shipments.map(async (s) => {
        try {
          const alertRes = await alertApi.getAll({ shipment_id: s.id, status: 'OPEN' })
          const alertsList = (alertRes.data as any)?.data || (Array.isArray(alertRes.data) ? alertRes.data : [])
          return { ...s, activeAlerts: alertsList.length }
        } catch { return { ...s, activeAlerts: 0 } }
      }))
      setResults(withAlerts)
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Search failed', status: 'error', duration: 4000 })
    } finally { setLoading(false) }
  }

  const clearForm = () => { setParams({ page: 1, limit: 20 }); setResults([]); setSearched(false) }

  return (
    <Box>
      <Box bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="14px" p={6} mb={6}>
        <Text fontWeight="700" color="white" mb={4}>Search Shipments</Text>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
          <FormControl><FormLabel fontSize="xs" color="#64748b">Tracking ID</FormLabel><Input placeholder="Tracking ID (e.g. TRK-...)" value={params.tracking_id || ''} onChange={e => set('tracking_id', e.target.value)} size="sm" /></FormControl>
          <FormControl><FormLabel fontSize="xs" color="#64748b">General Search</FormLabel><Input placeholder="Search anything..." value={params.q || ''} onChange={e => set('q', e.target.value)} size="sm" /></FormControl>
          <FormControl><FormLabel fontSize="xs" color="#64748b">BL Number</FormLabel><Input placeholder="BL number" value={params.bl_number || ''} onChange={e => set('bl_number', e.target.value)} size="sm" /></FormControl>
          <FormControl><FormLabel fontSize="xs" color="#64748b">Container Number</FormLabel><Input placeholder="Container number" value={params.container_number || ''} onChange={e => set('container_number', e.target.value)} size="sm" /></FormControl>
          <FormControl><FormLabel fontSize="xs" color="#64748b">Vessel Name</FormLabel><Input placeholder="Vessel name" value={params.vessel_name || ''} onChange={e => set('vessel_name', e.target.value)} size="sm" /></FormControl>
          <FormControl><FormLabel fontSize="xs" color="#64748b">Customer Name</FormLabel><Input placeholder="Customer name" value={params.customer_name || ''} onChange={e => set('customer_name', e.target.value)} size="sm" /></FormControl>
          <FormControl><FormLabel fontSize="xs" color="#64748b">Status</FormLabel>
            <Select placeholder="All statuses" value={params.status || ''} onChange={e => set('status', e.target.value)} size="sm">
              <option value="PLANNED">Planned</option><option value="IN_TRANSIT">In Transit</option><option value="ON_SCHEDULE">On Schedule</option>
              <option value="DELAYED">Delayed</option><option value="ARRIVED">Arrived</option><option value="COMPLETED">Completed</option>
            </Select>
          </FormControl>
        </SimpleGrid>
        <HStack><Button leftIcon={<FiSearch />} size="sm" onClick={doSearch} isLoading={loading}>Search</Button><Button variant="ghost" size="sm" onClick={clearForm}>Clear</Button></HStack>
      </Box>

      {searched && (
        <Box bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="14px" overflow="hidden">
          <Flex align="center" justify="space-between" px={5} py={4} borderBottom="1px solid" borderColor="surface.border">
            <Text fontWeight="700" color="white">Results ({results.length})</Text>
          </Flex>
          {loading ? <Flex justify="center" py={12}><Spinner size="lg" color="brand.400" /></Flex> : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead><Tr><Th>Shipment #</Th><Th>Customer</Th><Th>Alerts</Th><Th>Vessel</Th><Th>POL → POD</Th><Th>ETD</Th><Th>ETA</Th><Th>Status</Th></Tr></Thead>
                <Tbody>
                  {results.length === 0 ? <EmptyStateRow colSpan={8} message="No results found. Try different search criteria." /> : results.map(s => (
                    <Tr key={s.id} _hover={{ bg: 'surface.cardHover' }}>
                      <Td fontWeight="600" color="white">{s.shipment_number || '—'}</Td>
                      <Td color="#cbd5e1"><Text fontWeight="500">{s.customer_name || '—'}</Text></Td>
                      <Td>{parseInt(String(s.activeAlerts || 0)) > 0 ? <HStack color="#ef4444" spacing={1}><FiAlertCircle /><Text fontSize="xs" fontWeight="bold">{s.activeAlerts}</Text></HStack> : <Text color="#64748b">—</Text>}</Td>
                      <Td color="#cbd5e1">{s.vessel_name || '—'}</Td>
                      <Td color="#cbd5e1">{(s.pol_name || '—')} → {(s.pod_name || '—')}</Td>
                      <Td color="#94a3b8" fontSize="xs">{fmtDate(s.etd)}</Td>
                      <Td color="#94a3b8" fontSize="xs">{fmtDate(s.eta)}</Td>
                      <Td><StatusBadge status={s.status} /></Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
