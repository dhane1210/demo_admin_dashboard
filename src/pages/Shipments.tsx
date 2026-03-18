import { useEffect, useState, useCallback } from 'react'
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Text, Flex, Spinner,
  IconButton, Button, useToast, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, SimpleGrid, VStack,
  HStack, Select, Textarea
} from '@chakra-ui/react'
import { FiRefreshCw, FiEye, FiTrash2, FiNavigation, FiChevronLeft, FiChevronRight, FiUserPlus } from 'react-icons/fi'
import { shipmentApi } from '../api/shipments'
import { assignmentApi } from '../api/assignments'
import { customerApi } from '../api/customers'
import { alertApi } from '../api/alerts'
import type { Shipment, Customer, Alert } from '../types'
import StatusBadge from '../components/StatusBadge'
import ShipmentMap from '../components/ShipmentMap'
import EtaProgressBar from '../components/EtaProgressBar'
import { format } from 'date-fns'

function fmtDate(d: string | null) {
  if (!d) return '—'
  try { return format(new Date(d), 'dd MMM yyyy') } catch { return d }
}

export default function Shipments() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [shipmentAlerts, setShipmentAlerts] = useState<Alert[]>([])

  const toast = useToast()
  const detailModal = useDisclosure()
  const trackModal = useDisclosure()

  // Track form
  const [trackNumber, setTrackNumber] = useState('')
  const [trackSealine, setTrackSealine] = useState('')
  const [tracking, setTracking] = useState(false)

  // Assign form
  const assignModal = useDisclosure()
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [assignForm, setAssignForm] = useState({ customer_id: '', customer_name: '', customer_email: '', notes: '' })
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    customerApi.getAll().then(res => {
      const list = (res.data as any)?.data || (Array.isArray(res.data) ? res.data : [])
      setAllCustomers(list)
    }).catch()
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await shipmentApi.getAll(page, 20)
      setShipments(res.data || [])
      setTotalPages(res.pagination?.totalPages || 1)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load'
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000 })
    } finally {
      setLoading(false)
    }
  }, [page, toast])

  useEffect(() => { load() }, [load])

  const viewDetail = async (id: string) => {
    try {
      const [res, alertsRes] = await Promise.all([
        shipmentApi.getDetail(id),
        alertApi.getAll({ shipment_id: id, status: 'ACTIVE' }).catch(() => ({ data: [] }))
      ])
      setSelectedShipment(res.data)
      setShipmentAlerts((alertsRes.data as any) || [])
      detailModal.onOpen()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load detail'
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000 })
    }
  }

  const deleteShipment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipment?')) return
    try {
      await shipmentApi.delete(id)
      toast({ title: 'Deleted', status: 'success', duration: 2000 })
      load()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Delete failed'
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000 })
    }
  }

  const handleTrack = async () => {
    if (!trackNumber.trim()) {
      toast({ title: 'Enter a container/BL number', status: 'warning', duration: 3000 })
      return
    }
    setTracking(true)
    try {
      await shipmentApi.track(trackNumber.trim(), trackSealine.trim() || undefined)
      toast({ title: 'Shipment tracked & stored!', status: 'success', duration: 3000 })
      trackModal.onClose()
      setTrackNumber('')
      setTrackSealine('')
      load()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Track failed'
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000 })
    } finally {
      setTracking(false)
    }
  }

  const openAssign = (s: Shipment) => {
    setSelectedShipment(s)
    setAssignForm({ customer_id: '', customer_name: '', customer_email: '', notes: '' })
    assignModal.onOpen()
  }

  const handleAssign = async () => {
    if (!selectedShipment) return
    if (!assignForm.customer_id && !assignForm.customer_name) {
      toast({ title: 'Select or enter a customer', status: 'warning', duration: 3000 })
      return
    }
    setAssigning(true)
    try {
      const res = await assignmentApi.create({
        shipment_id: selectedShipment.id,
        customer_id: assignForm.customer_id || undefined,
        customer_name: assignForm.customer_name,
        customer_email: assignForm.customer_email,
        notes: assignForm.notes || undefined
      })
      await assignmentApi.sendEmail(res.data.id)
      toast({ title: 'Assigned and email sent!', status: 'success', duration: 3000 })
      assignModal.onClose()
      load()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Assignment failed'
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000 })
    } finally {
      setAssigning(false)
    }
  }

  return (
    <Box>
      {/* Header actions */}
      <Flex justify="space-between" align="center" mb={5}>
        <Text fontSize="lg" fontWeight="700" color="white">All Shipments</Text>
        <HStack>
          <Button leftIcon={<FiNavigation />} size="sm" variant="outline" borderRadius="8px" onClick={trackModal.onOpen}>
            Track Shipment
          </Button>
          <IconButton aria-label="Refresh" icon={<FiRefreshCw />} variant="ghost" size="sm" borderRadius="8px" onClick={load} />
        </HStack>
      </Flex>

      {/* Table */}
      <Box bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="14px" overflow="hidden">
        {loading ? (
          <Flex justify="center" py={16}><Spinner size="lg" color="brand.400" /></Flex>
        ) : (
          <>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Shipment #</Th>
                    <Th>Vessel</Th>
                    <Th>POL</Th>
                    <Th>POD</Th>
                    <Th>ETA Progress</Th>
                    <Th>Status</Th>
                    <Th>Last Synced</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {shipments.length === 0 ? (
                    <Tr><Td colSpan={10} textAlign="center" color="#64748b" py={8}>No shipments found.</Td></Tr>
                  ) : (
                    shipments.map((s) => (
                      <Tr key={s.id} _hover={{ bg: 'surface.cardHover' }} transition="background 0.15s">
                        <Td fontWeight="600" color="white">{s.shipment_number || '—'}</Td>
                        <Td color="#cbd5e1">{s.vessel_name || '—'}</Td>
                        <Td color="#cbd5e1">{s.pol_name || '—'}</Td>
                        <Td color="#cbd5e1">{s.pod_name || '—'}</Td>
                        <Td>
                          <EtaProgressBar etd={s.etd} eta={s.eta} ata={s.last_event_date} status={s.status} />
                        </Td>
                        <Td><StatusBadge status={s.status} /></Td>
                        <Td color="#64748b" fontSize="xs">{fmtDate(s.last_synced_at)}</Td>
                        <Td>
                          <HStack spacing={1}>
                            <IconButton aria-label="Assign" icon={<FiUserPlus />} variant="ghost" size="xs" borderRadius="6px" color="#60a5fa" onClick={() => openAssign(s)} />
                            <IconButton aria-label="View" icon={<FiEye />} variant="ghost" size="xs" borderRadius="6px" onClick={() => viewDetail(s.id)} />
                            <IconButton aria-label="Delete" icon={<FiTrash2 />} variant="ghost" size="xs" borderRadius="6px" color="#f87171" onClick={() => deleteShipment(s.id)} />
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>

            {/* Pagination */}
            <Flex justify="center" align="center" gap={3} px={5} py={3} borderTop="1px solid" borderColor="surface.border">
              <IconButton aria-label="Previous" icon={<FiChevronLeft />} variant="ghost" size="sm" isDisabled={page <= 1} onClick={() => setPage(p => p - 1)} />
              <Text fontSize="sm" color="#94a3b8">Page {page} of {totalPages}</Text>
              <IconButton aria-label="Next" icon={<FiChevronRight />} variant="ghost" size="sm" isDisabled={page >= totalPages} onClick={() => setPage(p => p + 1)} />
            </Flex>
          </>
        )}
      </Box>

      {/* Detail Modal */}
      <Modal isOpen={detailModal.isOpen} onClose={detailModal.onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent bg="#1a1d2e" borderColor="#2d3148" borderWidth="1px" borderRadius="16px">
          <ModalHeader borderBottom="1px solid" borderColor="#2d3148" color="white">
            Shipment Detail
          </ModalHeader>
          <ModalCloseButton color="#94a3b8" />
          <ModalBody py={6}>
            {selectedShipment && <ShipmentDetail s={selectedShipment} alerts={shipmentAlerts} />}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Track Modal */}
      <Modal isOpen={trackModal.isOpen} onClose={trackModal.onClose} size="md">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent bg="#1a1d2e" borderColor="#2d3148" borderWidth="1px" borderRadius="16px">
          <ModalHeader borderBottom="1px solid" borderColor="#2d3148" color="white">
            Track New Shipment
          </ModalHeader>
          <ModalCloseButton color="#94a3b8" />
          <ModalBody py={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="#94a3b8">Container / BL / Booking Number</FormLabel>
                <Input
                  placeholder="e.g. MSDU5213740"
                  value={trackNumber}
                  onChange={(e) => setTrackNumber(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="#94a3b8">Sealine (optional)</FormLabel>
                <Input
                  placeholder="e.g. MSC, MAEU, HLCU"
                  value={trackSealine}
                  onChange={(e) => setTrackSealine(e.target.value)}
                />
              </FormControl>
              <Button
                w="full"
                leftIcon={<FiNavigation />}
                isLoading={tracking}
                onClick={handleTrack}
              >
                Track Now
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={assignModal.isOpen} onClose={assignModal.onClose} size="md">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent bg="#1a1d2e" borderColor="#2d3148" borderWidth="1px" borderRadius="16px">
          <ModalHeader borderBottom="1px solid" borderColor="#2d3148" color="white">
            Assign Customer & Generate ID
          </ModalHeader>
          <ModalCloseButton color="#94a3b8" />
          <ModalBody py={6}>
            <VStack spacing={4}>
              <Text fontSize="sm" color="#cbd5e1" w="full">
                Assigning Shipment: <b>{selectedShipment?.shipment_number || 'Unknown'}</b>
              </Text>
              <FormControl>
                <FormLabel fontSize="sm" color="#94a3b8">Select Existing Customer</FormLabel>
                <Select
                  placeholder="Choose customer..."
                  value={assignForm.customer_id}
                  onChange={(e) => {
                    const c = allCustomers.find(x => x.id === e.target.value)
                    if (c) setAssignForm({ ...assignForm, customer_id: c.id, customer_name: c.name, customer_email: c.email || '' })
                    else setAssignForm({ ...assignForm, customer_id: '' })
                  }}
                >
                  {allCustomers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </Select>
              </FormControl>
              <Text fontSize="xs" color="#64748b" w="full" textAlign="center">— OR ENTER MANUALLY —</Text>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="#94a3b8">Customer Name</FormLabel>
                <Input
                  value={assignForm.customer_name}
                  onChange={(e) => setAssignForm({ ...assignForm, customer_name: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="#94a3b8">Customer Email</FormLabel>
                <Input
                  type="email"
                  value={assignForm.customer_email}
                  onChange={(e) => setAssignForm({ ...assignForm, customer_email: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="#94a3b8">Additional Notes (Optional)</FormLabel>
                <Textarea
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  rows={2}
                />
              </FormControl>
              <Button w="full" leftIcon={<FiUserPlus />} isLoading={assigning} onClick={handleAssign}>
                Assign & Send Email
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

/* ── Shipment Detail Sub-Component ──────────────────── */

function ShipmentDetail({ s, alerts = [] }: { s: Shipment, alerts?: Alert[] }) {
  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={6}>
        <DetailField label="Shipment Number" value={s.shipment_number} />
        <DetailField label="Status" value={<StatusBadge status={s.status} />} />
        <DetailField label="Sealine" value={s.sealine_name || s.sealine} />
        <DetailField label="POL" value={s.pol_name} />
        <DetailField label="POD" value={s.pod_name} />
        <DetailField label="Vessel" value={s.vessel_name} />
        <DetailField label="ETD" value={fmtDate(s.etd)} />
        <DetailField label="ETA" value={fmtDate(s.eta)} />
        <DetailField label="Last Event" value={s.last_event} />
        <DetailField label="Shipper" value={s.shipper} />
        <DetailField label="Consignee" value={s.consignee} />
        <DetailField label="Customer" value={s.customer_name} />
      </SimpleGrid>

      {/* Containers */}
      {s.containers && s.containers.length > 0 && (
        <Box mb={6}>
          <Text fontWeight="700" color="white" mb={3}>Containers ({s.containers.length})</Text>
          <Box overflowX="auto" bg="#12141f" borderRadius="10px" border="1px solid" borderColor="surface.border">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr><Th>Number</Th><Th>ISO</Th><Th>Size/Type</Th><Th>Status</Th></Tr>
              </Thead>
              <Tbody>
                {s.containers.map((c) => (
                  <Tr key={c.id}>
                    <Td fontWeight="600" color="white">{c.number}</Td>
                    <Td color="#cbd5e1">{c.iso_code || '—'}</Td>
                    <Td color="#cbd5e1">{c.size_type || '—'}</Td>
                    <Td color="#cbd5e1">{c.status || '—'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
      
      {/* Map View */}
      <Box mb={6}>
        <Text fontWeight="700" color="white" mb={3}>Live Tracking Map</Text>
        <Box borderRadius="12px" overflow="hidden" border="1px solid" borderColor="surface.border">
            <ShipmentMap 
                height="300px"
                shipmentsData={s.raw_api_response ? [s.raw_api_response] : []}
                shipments={[s]}
                alerts={alerts}
            />
        </Box>
      </Box>

      {/* Events Timeline */}
      {s.events && s.events.length > 0 && (
        <Box>
          <Text fontWeight="700" color="white" mb={3}>Events ({s.events.length})</Text>
          <VStack align="stretch" spacing={0} pl={4} borderLeft="2px solid" borderColor="surface.border">
            {s.events.slice(0, 20).map((e, i) => (
              <Box key={e.id || i} position="relative" py={2} pl={4}>
                <Box
                  position="absolute" left="-9px" top="14px"
                  w="12px" h="12px" borderRadius="full"
                  bg={e.is_actual ? '#4ade80' : '#6366f1'}
                  border="3px solid #1a1d2e"
                />
                <Flex justify="space-between" align="flex-start">
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="white">
                      {e.description || e.event_type || 'Event'}
                    </Text>
                    <Text fontSize="xs" color="#64748b">
                      {[e.location_name, e.location_country].filter(Boolean).join(', ')}
                      {e.vessel_name ? ` · ${e.vessel_name}` : ''}
                    </Text>
                  </Box>
                  <Text fontSize="xs" color="#64748b" whiteSpace="nowrap" ml={3}>
                    {fmtDate(e.date)}
                  </Text>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  )
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Text fontSize="0.7rem" color="#64748b" textTransform="uppercase" letterSpacing="0.05em" mb={1}>{label}</Text>
      <Text fontSize="sm" color="white">{value || '—'}</Text>
    </Box>
  )
}
