import { useEffect, useState } from 'react'
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Text, Flex, Spinner,
  IconButton, Button, useToast, useDisclosure, HStack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea, VStack, SimpleGrid,
} from '@chakra-ui/react'
import { FiPlus, FiRefreshCw, FiEdit2, FiTrash2, FiAlertCircle } from 'react-icons/fi'
import { customerApi } from '../api/customers'
import { assignmentApi } from '../api/assignments'
import { alertApi } from '../api/alerts'
import { shipmentApi } from '../api/shipments'
import type { Customer, Assignment, Alert, Shipment } from '../types'
import StatusBadge from '../components/StatusBadge'
import { format } from 'date-fns'

function fmtDate(d: string | null) {
  if (!d) return '—'
  try { return format(new Date(d), 'dd MMM yyyy') } catch { return d }
}

const emptyForm = { name: '', email: '', company: '', phone: '', address: '', contact_person: '', notes: '' }

export default function Users() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const formModal = useDisclosure()

  const load = async () => {
    setLoading(true)
    try {
      const [res, assignmentsRes, alertsRes, shipmentsRes] = await Promise.all([
        customerApi.getAll(),
        assignmentApi.getAll(1, 1000).catch(() => ({ data: [] })),
        alertApi.getAll({ status: 'ACTIVE', limit: 1000 }).catch(() => ({ data: [] })),
        shipmentApi.getAll(1, 1000).catch(() => ({ data: [] }))
      ])
      // CustomerService.getAllCustomers returns { data: [...], total }, so res.data is wrapped
      const list = (res.data as any)?.data || (Array.isArray(res.data) ? res.data : [])
      setCustomers(list)
      setAssignments(assignmentsRes.data || [])
      setAlerts((alertsRes.data as any) || [])
      setShipments((shipmentsRes as any).data || [])
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', status: 'error', duration: 4000 })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditId(null); setForm(emptyForm); formModal.onOpen() }
  const openEdit = (c: Customer) => {
    setEditId(c.id)
    setForm({ name: c.name, email: c.email || '', company: c.company || '', phone: c.phone || '', address: c.address || '', contact_person: c.contact_person || '', notes: c.notes || '' })
    formModal.onOpen()
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: 'Name is required', status: 'warning', duration: 3000 }); return }
    setSaving(true)
    try {
      const d = { name: form.name, email: form.email || undefined, company: form.company || undefined, phone: form.phone || undefined, address: form.address || undefined, contact_person: form.contact_person || undefined, notes: form.notes || undefined }
      if (editId) { await customerApi.update(editId, d) } else { await customerApi.create(d) }
      toast({ title: editId ? 'Customer updated' : 'Customer created', status: 'success', duration: 2000 })
      formModal.onClose(); load()
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', status: 'error', duration: 4000 })
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return
    try { await customerApi.delete(id); toast({ title: 'Deleted', status: 'success', duration: 2000 }); load() }
    catch (e: unknown) { toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', status: 'error', duration: 4000 }) }
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={5}>
        <Text fontSize="lg" fontWeight="700" color="white">Customers / Users</Text>
        <HStack>
          <Button size="sm" leftIcon={<FiPlus />} onClick={openCreate} borderRadius="8px">Add Customer</Button>
          <IconButton aria-label="Refresh" icon={<FiRefreshCw />} variant="ghost" size="sm" borderRadius="8px" onClick={load} />
        </HStack>
      </Flex>

      <Box bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="14px" overflow="hidden">
        {loading ? <Flex justify="center" py={16}><Spinner size="lg" color="brand.400" /></Flex> : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead><Tr><Th>Name</Th><Th>Email</Th><Th>Company</Th><Th>Tracking IDs</Th><Th>Shipment Status</Th><Th>Alerts</Th><Th>Phone</Th><Th>Contact Person</Th><Th>Created</Th><Th></Th></Tr></Thead>
              <Tbody>
                {customers.length === 0 ? <Tr><Td colSpan={10} textAlign="center" color="#64748b" py={8}>No customers found.</Td></Tr> : customers.map(c => {
                  const customerAssignments = assignments.filter(a => a.customer_id === c.id)
                  const trackingIds = [...new Set(customerAssignments.map(a => a.tracking_id))]
                  const assignedShipmentIds = customerAssignments.map(a => a.shipment_id)
                  const customerAlerts = alerts.filter(al => assignedShipmentIds.includes(al.shipment_id || ''))
                  const customerShipments = shipments.filter(s => assignedShipmentIds.includes(s.id))
                  const statusSet = [...new Set(customerShipments.map(s => s.status).filter(Boolean))]

                  return (
                  <Tr key={c.id} _hover={{ bg: 'surface.cardHover' }}>
                    <Td fontWeight="600" color="white">{c.name}</Td>
                    <Td color="#cbd5e1">{c.email || '—'}</Td>
                    <Td color="#cbd5e1">{c.company || '—'}</Td>
                    <Td color="#cbd5e1">
                        {trackingIds.length > 0 ? (
                            <Flex flexWrap="wrap" gap={1}>
                                {trackingIds.map(id => (
                                    <Text key={id} fontSize="xs" bg="#312e81" color="#a5b4fc" px={2} py={0.5} borderRadius="4px">{id}</Text>
                                ))}
                            </Flex>
                        ) : '—'}
                    </Td>
                    <Td>
                        {statusSet.length > 0 ? (
                            <Flex flexWrap="wrap" gap={1}>
                                {statusSet.map(st => (
                                    <StatusBadge key={st} status={st} />
                                ))}
                            </Flex>
                        ) : '—'}
                    </Td>
                    <Td>
                        {customerAlerts.length > 0 ? (
                             <Flex align="center" gap={1} color="#f87171">
                                <FiAlertCircle />
                                <Text fontSize="xs" fontWeight="bold">{customerAlerts.length} Active</Text>
                             </Flex>
                        ) : <Text color="#64748b" fontSize="xs">None</Text>}
                    </Td>
                    <Td color="#cbd5e1">{c.phone || '—'}</Td>
                    <Td color="#cbd5e1">{c.contact_person || '—'}</Td>
                    <Td color="#94a3b8" fontSize="xs">{fmtDate(c.created_at)}</Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton aria-label="Edit" icon={<FiEdit2 />} variant="ghost" size="xs" onClick={() => openEdit(c)} />
                        <IconButton aria-label="Delete" icon={<FiTrash2 />} variant="ghost" size="xs" color="#f87171" onClick={() => handleDelete(c.id)} />
                      </HStack>
                    </Td>
                  </Tr>
                )})}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      <Modal isOpen={formModal.isOpen} onClose={formModal.onClose} size="xl">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent bg="#1a1d2e" borderColor="#2d3148" borderWidth="1px" borderRadius="16px">
          <ModalHeader borderBottom="1px solid" borderColor="#2d3148" color="white">{editId ? 'Edit' : 'Create'} Customer</ModalHeader>
          <ModalCloseButton color="#94a3b8" />
          <ModalBody py={6}>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired><FormLabel fontSize="sm" color="#94a3b8">Name</FormLabel>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></FormControl>
                <FormControl><FormLabel fontSize="sm" color="#94a3b8">Email</FormLabel>
                  <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></FormControl>
                <FormControl><FormLabel fontSize="sm" color="#94a3b8">Company</FormLabel>
                  <Input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} /></FormControl>
                <FormControl><FormLabel fontSize="sm" color="#94a3b8">Phone</FormLabel>
                  <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></FormControl>
                <FormControl><FormLabel fontSize="sm" color="#94a3b8">Contact Person</FormLabel>
                  <Input value={form.contact_person} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} /></FormControl>
                <FormControl><FormLabel fontSize="sm" color="#94a3b8">Address</FormLabel>
                  <Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></FormControl>
              </SimpleGrid>
              <FormControl><FormLabel fontSize="sm" color="#94a3b8">Notes</FormLabel>
                <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} /></FormControl>
              <Button w="full" onClick={handleSave} isLoading={saving} leftIcon={editId ? <FiEdit2 /> : <FiPlus />}>
                {editId ? 'Update' : 'Create'} Customer
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
