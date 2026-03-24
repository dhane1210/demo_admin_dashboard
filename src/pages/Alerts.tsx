import { useEffect, useState, useCallback } from 'react'
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Text,
  IconButton, useToast, HStack, Select,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  useDisclosure, Button, Textarea, FormControl, FormLabel, VStack, SimpleGrid,
} from '@chakra-ui/react'
import { FiRefreshCw, FiCheck, FiCheckCircle, FiEye } from 'react-icons/fi'
import { alertApi } from '../api/alerts'
import type { Alert } from '../types'
import { fmtDateTime } from '../utils/formatters'

import { PageHeader, DataTableCard, EmptyStateRow } from '../components/common'
import StatusBadge from '../components/StatusBadge'

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const toast = useToast()
  const detailModal = useDisclosure()
  const resolveModal = useDisclosure()
  const [resolveBy, setResolveBy] = useState('Admin')
  const [actionTaken, setActionTaken] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await alertApi.getAll({ status: statusFilter || undefined, severity: severityFilter || undefined })
      setAlerts(res.data || [])
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', status: 'error', duration: 4000 })
    } finally { setLoading(false) }
  }, [statusFilter, severityFilter, toast])

  useEffect(() => { load() }, [load])

  const acknowledge = async (id: string) => {
    try {
      await alertApi.acknowledge(id, 'Acknowledged by admin')
      toast({ title: 'Acknowledged', status: 'success', duration: 2000 }); load()
    } catch (e: unknown) { toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', status: 'error', duration: 4000 }) }
  }

  const openResolve = (a: Alert) => { setSelectedAlert(a); setActionTaken(''); resolveModal.onOpen() }

  const handleResolve = async () => {
    if (!selectedAlert) return
    try {
      await alertApi.resolve(selectedAlert.id, resolveBy, actionTaken || undefined)
      toast({ title: 'Resolved', status: 'success', duration: 2000 }); resolveModal.onClose(); load()
    } catch (e: unknown) { toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', status: 'error', duration: 4000 }) }
  }

  const viewDetail = async (id: string) => {
    try {
      const res = await alertApi.getDetail(id); setSelectedAlert(res.data); detailModal.onOpen()
    } catch (e: unknown) { toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', status: 'error', duration: 4000 }) }
  }

  return (
    <Box>
      <PageHeader
        title="Alerts & Notifications"
        actions={
          <>
            <Select placeholder="All Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} size="sm" w="auto" borderRadius="8px">
              <option value="OPEN">Open</option><option value="ACKNOWLEDGED">Acknowledged</option><option value="RESOLVED">Resolved</option>
            </Select>
            <Select placeholder="All Severity" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} size="sm" w="auto" borderRadius="8px">
              <option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
            </Select>
            <IconButton aria-label="Refresh" icon={<FiRefreshCw />} variant="ghost" size="sm" borderRadius="8px" onClick={load} />
          </>
        }
      />

      <DataTableCard loading={loading}>
        <Table variant="simple" size="sm">
          <Thead><Tr><Th>Type</Th><Th>Shipment</Th><Th>Info</Th><Th>Severity</Th><Th>Status</Th><Th>Detected</Th><Th>Actions</Th></Tr></Thead>
          <Tbody>
            {alerts.length === 0 ? <EmptyStateRow colSpan={7} message="No alerts found." /> : alerts.map(a => (
              <Tr key={a.id} _hover={{ bg: 'surface.cardHover' }}>
                <Td><StatusBadge status={a.alert_type} /></Td>
                <Td fontWeight="600" color="white">{a.shipment_number || '—'}</Td>
                <Td color="#cbd5e1" maxW="300px" isTruncated>{a.alert_info || '—'}</Td>
                <Td><StatusBadge status={a.severity} /></Td>
                <Td><StatusBadge status={a.status} /></Td>
                <Td color="#94a3b8" fontSize="xs">{fmtDateTime(a.detection_date)}</Td>
                <Td>
                  <HStack spacing={1}>
                    <IconButton aria-label="View" icon={<FiEye />} variant="ghost" size="xs" onClick={() => viewDetail(a.id)} />
                    {a.status === 'OPEN' && <IconButton aria-label="Ack" icon={<FiCheck />} variant="ghost" size="xs" color="#60a5fa" onClick={() => acknowledge(a.id)} />}
                    {a.status !== 'RESOLVED' && <IconButton aria-label="Resolve" icon={<FiCheckCircle />} variant="ghost" size="xs" color="#4ade80" onClick={() => openResolve(a)} />}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </DataTableCard>

      {/* Detail Modal */}
      <Modal isOpen={detailModal.isOpen} onClose={detailModal.onClose} size="lg">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent bg="#1a1d2e" borderColor="#2d3148" borderWidth="1px" borderRadius="16px">
          <ModalHeader borderBottom="1px solid" borderColor="#2d3148" color="white">Alert Detail</ModalHeader>
          <ModalCloseButton color="#94a3b8" />
          <ModalBody py={6}>
            {selectedAlert && (
              <SimpleGrid columns={2} spacing={4}>
                <Box><Text fontSize="xs" color="#64748b" textTransform="uppercase">Type</Text><StatusBadge status={selectedAlert.alert_type} /></Box>
                <Box><Text fontSize="xs" color="#64748b" textTransform="uppercase">Severity</Text><StatusBadge status={selectedAlert.severity} /></Box>
                <Box><Text fontSize="xs" color="#64748b" textTransform="uppercase">Status</Text><StatusBadge status={selectedAlert.status} /></Box>
                <Box><Text fontSize="xs" color="#64748b" textTransform="uppercase">Shipment</Text><Text color="white" fontSize="sm">{selectedAlert.shipment_number || '—'}</Text></Box>
                <Box gridColumn="span 2"><Text fontSize="xs" color="#64748b" textTransform="uppercase">Info</Text><Text color="white" fontSize="sm">{selectedAlert.alert_info || '—'}</Text></Box>
                <Box><Text fontSize="xs" color="#64748b" textTransform="uppercase">Detected</Text><Text color="white" fontSize="sm">{fmtDateTime(selectedAlert.detection_date)}</Text></Box>
                <Box><Text fontSize="xs" color="#64748b" textTransform="uppercase">Action</Text><Text color="white" fontSize="sm">{selectedAlert.action_taken || '—'}</Text></Box>
              </SimpleGrid>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Resolve Modal */}
      <Modal isOpen={resolveModal.isOpen} onClose={resolveModal.onClose} size="md">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent bg="#1a1d2e" borderColor="#2d3148" borderWidth="1px" borderRadius="16px">
          <ModalHeader borderBottom="1px solid" borderColor="#2d3148" color="white">Resolve Alert</ModalHeader>
          <ModalCloseButton color="#94a3b8" />
          <ModalBody py={6}>
            <VStack spacing={4}>
              <FormControl><FormLabel fontSize="sm" color="#94a3b8">Resolved By</FormLabel>
                <Select value={resolveBy} onChange={e => setResolveBy(e.target.value)}><option value="Admin">Admin</option><option value="System">System</option></Select>
              </FormControl>
              <FormControl><FormLabel fontSize="sm" color="#94a3b8">Action Taken</FormLabel>
                <Textarea placeholder="Resolution details..." value={actionTaken} onChange={e => setActionTaken(e.target.value)} rows={3} />
              </FormControl>
              <Button w="full" leftIcon={<FiCheckCircle />} onClick={handleResolve}>Resolve</Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
