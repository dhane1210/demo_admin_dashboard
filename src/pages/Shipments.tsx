import { useEffect, useState, useCallback } from 'react'
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Text,
  IconButton, Button, useToast, useDisclosure, HStack, Flex,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
} from '@chakra-ui/react'
import { FiRefreshCw, FiEye, FiTrash2, FiNavigation, FiChevronLeft, FiChevronRight, FiUserPlus } from 'react-icons/fi'
import { shipmentApi } from '../api/shipments'
import { assignmentApi } from '../api/assignments'
import { customerApi } from '../api/customers'
import { alertApi } from '../api/alerts'
import type { Shipment, Customer, Alert } from '../types'
import { fmtDate } from '../utils/formatters'

import { PageHeader, DataTableCard, EmptyStateRow } from '../components/common'
import StatusBadge from '../components/StatusBadge'
import EtaProgressBar from '../components/EtaProgressBar'
import {
  ShipmentDetail,
  TrackShipmentModal,
  AssignCustomerModal,
  type AssignFormState,
} from '../components/shipments'

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
  const [assignForm, setAssignForm] = useState<AssignFormState>({ customer_id: '', customer_name: '', customer_email: '', notes: '' })
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

  /* ── Pagination Footer ──────────────────────────── */
  const paginationFooter = (
    <Flex justify="center" align="center" gap={3} px={5} py={3} borderTop="1px solid" borderColor="surface.border">
      <IconButton aria-label="Previous" icon={<FiChevronLeft />} variant="ghost" size="sm" isDisabled={page <= 1} onClick={() => setPage(p => p - 1)} />
      <Text fontSize="sm" color="#94a3b8">Page {page} of {totalPages}</Text>
      <IconButton aria-label="Next" icon={<FiChevronRight />} variant="ghost" size="sm" isDisabled={page >= totalPages} onClick={() => setPage(p => p + 1)} />
    </Flex>
  )

  return (
    <Box>
      <PageHeader
        title="All Shipments"
        actions={
          <>
            <Button leftIcon={<FiNavigation />} size="sm" variant="outline" borderRadius="8px" onClick={trackModal.onOpen}>
              Track Shipment
            </Button>
            <IconButton aria-label="Refresh" icon={<FiRefreshCw />} variant="ghost" size="sm" borderRadius="8px" onClick={load} />
          </>
        }
      />

      {/* Table */}
      <DataTableCard loading={loading} footer={paginationFooter}>
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
              <EmptyStateRow colSpan={10} message="No shipments found." />
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
      </DataTableCard>

      {/* Detail Modal */}
      <Modal isOpen={detailModal.isOpen} onClose={detailModal.onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent bg="#1a1d2e" borderColor="#2d3148" borderWidth="1px" borderRadius="16px">
          <ModalHeader borderBottom="1px solid" borderColor="#2d3148" color="white">
            Shipment Detail
          </ModalHeader>
          <ModalCloseButton color="#94a3b8" />
          <ModalBody py={6}>
            {selectedShipment && <ShipmentDetail shipment={selectedShipment} alerts={shipmentAlerts} />}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Track Modal */}
      <TrackShipmentModal
        isOpen={trackModal.isOpen}
        onClose={trackModal.onClose}
        trackNumber={trackNumber}
        onTrackNumberChange={setTrackNumber}
        trackSealine={trackSealine}
        onTrackSealineChange={setTrackSealine}
        isLoading={tracking}
        onSubmit={handleTrack}
      />

      {/* Assign Modal */}
      <AssignCustomerModal
        isOpen={assignModal.isOpen}
        onClose={assignModal.onClose}
        shipmentNumber={selectedShipment?.shipment_number || null}
        customers={allCustomers}
        form={assignForm}
        onFormChange={setAssignForm}
        isLoading={assigning}
        onSubmit={handleAssign}
      />
    </Box>
  )
}
