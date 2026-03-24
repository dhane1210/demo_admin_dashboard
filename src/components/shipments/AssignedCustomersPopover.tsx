import { useState } from 'react'
import {
  Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverArrow, PopoverCloseButton,
  IconButton, Flex, Spinner, Text, Box, VStack, useToast,
} from '@chakra-ui/react'
import { FiUsers, FiTrash2 } from 'react-icons/fi'
import { assignmentApi } from '../../api/assignments'
import type { Assignment } from '../../types'

interface AssignedCustomersPopoverProps {
  shipment_id: string
}

/**
 * Popover that displays and manages customers assigned to a specific shipment.
 * Used in the Dashboard's recent shipments table.
 */
export default function AssignedCustomersPopover({ shipment_id }: AssignedCustomersPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const loadAssignments = async () => {
    setLoading(true)
    try {
      const res = await assignmentApi.getAll(1, 50, undefined, shipment_id)
      setAssignments(res.data || [])
    } catch {
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
    } catch {
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
