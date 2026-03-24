import { useEffect, useState } from 'react'
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Text,
  Button, IconButton, useToast, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea, Select, VStack, SimpleGrid,
  Divider, Stat, StatLabel, StatNumber,
} from '@chakra-ui/react'
import { FiPlus, FiRefreshCw, FiEye, FiDollarSign } from 'react-icons/fi'
import { pricingApi } from '../api/pricing'
import type { Job, Pricing, PricingInput } from '../types'
import { fmtDate } from '../utils/formatters'

import { PageHeader, DataTableCard, EmptyStateRow } from '../components/common'
import StatusBadge from '../components/StatusBadge'

export default function PricingPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [pricing, setPricing] = useState<Pricing | null>(null)

  const toast = useToast()
  const createModal = useDisclosure()
  const detailModal = useDisclosure()

  // Create form
  const [newJob, setNewJob] = useState({
    shipper: '', consignee: '', commodity: '', package_type: '',
    weight: '', cbm: '', incoterm: 'CIF', pickup: '', delivery: '',
    additional_notes: '', date_needed: '',
  })
  const [creating, setCreating] = useState(false)

  // Pricing form
  const [priceInput, setPriceInput] = useState<PricingInput>({
    agent_rate: 0, clearance_charges: 0, delivery_order: 0, vat: 0, markup_percent: 15,
  })
  const [calculating, setCalculating] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await pricingApi.getJobs()
      setJobs(res.data || [])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load'
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const viewDetail = async (job: Job) => {
    setSelectedJob(job)
    setPricing(null)
    try {
      const res = await pricingApi.getPricing(job.id)
      setPricing(res.data || null)
    } catch {
      // No pricing yet
    }
    detailModal.onOpen()
  }

  const handleCreate = async () => {
    if (!newJob.shipper && !newJob.consignee) {
      toast({ title: 'Shipper or consignee required', status: 'warning', duration: 3000 })
      return
    }
    setCreating(true)
    try {
      await pricingApi.createJob({
        shipper: newJob.shipper || undefined,
        consignee: newJob.consignee || undefined,
        commodity: newJob.commodity || undefined,
        package_type: newJob.package_type || undefined,
        weight: newJob.weight ? Number(newJob.weight) : undefined,
        cbm: newJob.cbm ? Number(newJob.cbm) : undefined,
        incoterm: newJob.incoterm || undefined,
        pickup: newJob.pickup || undefined,
        delivery: newJob.delivery || undefined,
        additional_notes: newJob.additional_notes || undefined,
        date_needed: newJob.date_needed || undefined,
      } as Partial<Job>)
      toast({ title: 'Job created!', status: 'success', duration: 3000 })
      createModal.onClose()
      setNewJob({ shipper: '', consignee: '', commodity: '', package_type: '', weight: '', cbm: '', incoterm: 'CIF', pickup: '', delivery: '', additional_notes: '', date_needed: '' })
      load()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Create failed'
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000 })
    } finally {
      setCreating(false)
    }
  }

  const calculatePricing = async () => {
    if (!selectedJob) return
    setCalculating(true)
    try {
      const res = await pricingApi.calculatePricing(selectedJob.id, priceInput)
      setPricing(res.data)
      toast({ title: 'Pricing calculated!', status: 'success', duration: 3000 })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Calculation failed'
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000 })
    } finally {
      setCalculating(false)
    }
  }

  return (
    <Box>
      <PageHeader
        title="Jobs & Pricing"
        actions={
          <>
            <Button size="sm" leftIcon={<FiPlus />} onClick={createModal.onOpen} borderRadius="8px">New Job</Button>
            <IconButton aria-label="Refresh" icon={<FiRefreshCw />} variant="ghost" size="sm" borderRadius="8px" onClick={load} />
          </>
        }
      />

      {/* Jobs Table */}
      <DataTableCard loading={loading}>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Shipper</Th>
              <Th>Consignee</Th>
              <Th>Commodity</Th>
              <Th>Incoterm</Th>
              <Th>Weight</Th>
              <Th>CBM</Th>
              <Th>Date Needed</Th>
              <Th>Status</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {jobs.length === 0 ? (
              <EmptyStateRow colSpan={9} message="No jobs found." />
            ) : jobs.map(j => (
              <Tr key={j.id} _hover={{ bg: 'surface.cardHover' }}>
                <Td fontWeight="600" color="white">{j.shipper || '—'}</Td>
                <Td color="#cbd5e1">{j.consignee || '—'}</Td>
                <Td color="#cbd5e1">{j.commodity || '—'}</Td>
                <Td color="#cbd5e1">{j.incoterm || '—'}</Td>
                <Td color="#94a3b8">{j.weight ? `${j.weight} kg` : '—'}</Td>
                <Td color="#94a3b8">{j.cbm || '—'}</Td>
                <Td color="#94a3b8" fontSize="xs">{fmtDate(j.date_needed)}</Td>
                <Td><StatusBadge status={j.status} /></Td>
                <Td>
                  <IconButton aria-label="View" icon={<FiEye />} variant="ghost" size="xs" borderRadius="6px" onClick={() => viewDetail(j)} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </DataTableCard>

      {/* Detail + Pricing Modal */}
      <Modal isOpen={detailModal.isOpen} onClose={detailModal.onClose} size="3xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent bg="#1a1d2e" borderColor="#2d3148" borderWidth="1px" borderRadius="16px">
          <ModalHeader borderBottom="1px solid" borderColor="#2d3148" color="white">
            Job Detail & Pricing
          </ModalHeader>
          <ModalCloseButton color="#94a3b8" />
          <ModalBody py={6}>
            {selectedJob && (
              <Box>
                <SimpleGrid columns={3} spacing={4} mb={6}>
                  <Box><Text fontSize="xs" color="#64748b" textTransform="uppercase">Shipper</Text><Text color="white" fontSize="sm">{selectedJob.shipper || '—'}</Text></Box>
                  <Box><Text fontSize="xs" color="#64748b" textTransform="uppercase">Consignee</Text><Text color="white" fontSize="sm">{selectedJob.consignee || '—'}</Text></Box>
                  <Box><Text fontSize="xs" color="#64748b" textTransform="uppercase">Commodity</Text><Text color="white" fontSize="sm">{selectedJob.commodity || '—'}</Text></Box>
                  <Box><Text fontSize="xs" color="#64748b" textTransform="uppercase">Pickup</Text><Text color="white" fontSize="sm">{selectedJob.pickup || '—'}</Text></Box>
                  <Box><Text fontSize="xs" color="#64748b" textTransform="uppercase">Delivery</Text><Text color="white" fontSize="sm">{selectedJob.delivery || '—'}</Text></Box>
                  <Box><Text fontSize="xs" color="#64748b" textTransform="uppercase">Incoterm</Text><Text color="white" fontSize="sm">{selectedJob.incoterm || '—'}</Text></Box>
                </SimpleGrid>

                <Divider borderColor="#2d3148" mb={6} />

                {/* Pricing Calculator */}
                <Text fontWeight="700" color="white" mb={4}>Pricing Calculator</Text>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3} mb={4}>
                  <FormControl>
                    <FormLabel fontSize="xs" color="#64748b">Agent Rate (USD)</FormLabel>
                    <Input type="number" size="sm" value={priceInput.agent_rate} onChange={e => setPriceInput(p => ({ ...p, agent_rate: Number(e.target.value) }))} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs" color="#64748b">Clearance Charges</FormLabel>
                    <Input type="number" size="sm" value={priceInput.clearance_charges} onChange={e => setPriceInput(p => ({ ...p, clearance_charges: Number(e.target.value) }))} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs" color="#64748b">Delivery Order</FormLabel>
                    <Input type="number" size="sm" value={priceInput.delivery_order} onChange={e => setPriceInput(p => ({ ...p, delivery_order: Number(e.target.value) }))} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs" color="#64748b">VAT (%)</FormLabel>
                    <Input type="number" size="sm" value={priceInput.vat} onChange={e => setPriceInput(p => ({ ...p, vat: Number(e.target.value) }))} />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs" color="#64748b">Markup (%)</FormLabel>
                    <Input type="number" size="sm" value={priceInput.markup_percent} onChange={e => setPriceInput(p => ({ ...p, markup_percent: Number(e.target.value) }))} />
                  </FormControl>
                </SimpleGrid>
                <Button leftIcon={<FiDollarSign />} size="sm" onClick={calculatePricing} isLoading={calculating} mb={5}>
                  Calculate
                </Button>

                {/* Pricing Results */}
                {pricing && (
                  <Box bg="#12141f" border="1px solid" borderColor="surface.border" borderRadius="12px" p={5}>
                    <SimpleGrid columns={4} spacing={4}>
                      <Stat>
                        <StatLabel color="#64748b" fontSize="xs">Total Cost</StatLabel>
                        <StatNumber color="#f87171" fontSize="lg">${pricing.total_cost?.toFixed(2)}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel color="#64748b" fontSize="xs">Selling Price</StatLabel>
                        <StatNumber color="#60a5fa" fontSize="lg">${pricing.selling_price?.toFixed(2)}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel color="#64748b" fontSize="xs">Profit</StatLabel>
                        <StatNumber color="#4ade80" fontSize="lg">${pricing.profit_value?.toFixed(2)}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel color="#64748b" fontSize="xs">Margin</StatLabel>
                        <StatNumber color="#818cf8" fontSize="lg">{pricing.profit_margin_percent?.toFixed(1)}%</StatNumber>
                      </Stat>
                    </SimpleGrid>
                  </Box>
                )}
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Create Job Modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose} size="xl">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent bg="#1a1d2e" borderColor="#2d3148" borderWidth="1px" borderRadius="16px">
          <ModalHeader borderBottom="1px solid" borderColor="#2d3148" color="white">Create New Job</ModalHeader>
          <ModalCloseButton color="#94a3b8" />
          <ModalBody py={6}>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm" color="#94a3b8">Shipper</FormLabel>
                  <Input value={newJob.shipper} onChange={e => setNewJob(p => ({ ...p, shipper: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="#94a3b8">Consignee</FormLabel>
                  <Input value={newJob.consignee} onChange={e => setNewJob(p => ({ ...p, consignee: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="#94a3b8">Commodity</FormLabel>
                  <Input value={newJob.commodity} onChange={e => setNewJob(p => ({ ...p, commodity: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="#94a3b8">Package Type</FormLabel>
                  <Input value={newJob.package_type} onChange={e => setNewJob(p => ({ ...p, package_type: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="#94a3b8">Weight (kg)</FormLabel>
                  <Input type="number" value={newJob.weight} onChange={e => setNewJob(p => ({ ...p, weight: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="#94a3b8">CBM</FormLabel>
                  <Input type="number" value={newJob.cbm} onChange={e => setNewJob(p => ({ ...p, cbm: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="#94a3b8">Incoterm</FormLabel>
                  <Select value={newJob.incoterm} onChange={e => setNewJob(p => ({ ...p, incoterm: e.target.value }))}>
                    <option value="CIF">CIF</option>
                    <option value="FOB">FOB</option>
                    <option value="EXW">EXW</option>
                    <option value="DDP">DDP</option>
                    <option value="DAP">DAP</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="#94a3b8">Date Needed</FormLabel>
                  <Input type="date" value={newJob.date_needed} onChange={e => setNewJob(p => ({ ...p, date_needed: e.target.value }))} />
                </FormControl>
              </SimpleGrid>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel fontSize="sm" color="#94a3b8">Pickup Location</FormLabel>
                  <Input value={newJob.pickup} onChange={e => setNewJob(p => ({ ...p, pickup: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="#94a3b8">Delivery Location</FormLabel>
                  <Input value={newJob.delivery} onChange={e => setNewJob(p => ({ ...p, delivery: e.target.value }))} />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel fontSize="sm" color="#94a3b8">Additional Notes</FormLabel>
                <Textarea value={newJob.additional_notes} onChange={e => setNewJob(p => ({ ...p, additional_notes: e.target.value }))} rows={3} />
              </FormControl>
              <Button w="full" onClick={handleCreate} isLoading={creating} leftIcon={<FiPlus />}>Create Job</Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
