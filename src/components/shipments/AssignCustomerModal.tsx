import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, Select, Textarea, VStack, Text, Button,
} from '@chakra-ui/react'
import { FiUserPlus } from 'react-icons/fi'
import type { Customer } from '../../types'

export interface AssignFormState {
  customer_id: string
  customer_name: string
  customer_email: string
  notes: string
}

interface AssignCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  shipmentNumber: string | null
  customers: Customer[]
  form: AssignFormState
  onFormChange: (form: AssignFormState) => void
  isLoading: boolean
  onSubmit: () => void
}

/**
 * Modal for assigning a customer to a shipment and generating a tracking ID.
 */
export default function AssignCustomerModal({
  isOpen, onClose,
  shipmentNumber, customers,
  form, onFormChange,
  isLoading, onSubmit,
}: AssignCustomerModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
      <ModalContent bg="#1a1d2e" borderColor="#2d3148" borderWidth="1px" borderRadius="16px">
        <ModalHeader borderBottom="1px solid" borderColor="#2d3148" color="white">
          Assign Customer & Generate ID
        </ModalHeader>
        <ModalCloseButton color="#94a3b8" />
        <ModalBody py={6}>
          <VStack spacing={4}>
            <Text fontSize="sm" color="#cbd5e1" w="full">
              Assigning Shipment: <b>{shipmentNumber || 'Unknown'}</b>
            </Text>
            <FormControl>
              <FormLabel fontSize="sm" color="#94a3b8">Select Existing Customer</FormLabel>
              <Select
                placeholder="Choose customer..."
                value={form.customer_id}
                onChange={(e) => {
                  const c = customers.find(x => x.id === e.target.value)
                  if (c) onFormChange({ ...form, customer_id: c.id, customer_name: c.name, customer_email: c.email || '' })
                  else onFormChange({ ...form, customer_id: '' })
                }}
              >
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </Select>
            </FormControl>
            <Text fontSize="xs" color="#64748b" w="full" textAlign="center">— OR ENTER MANUALLY —</Text>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="#94a3b8">Customer Name</FormLabel>
              <Input
                value={form.customer_name}
                onChange={(e) => onFormChange({ ...form, customer_name: e.target.value })}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="#94a3b8">Customer Email</FormLabel>
              <Input
                type="email"
                value={form.customer_email}
                onChange={(e) => onFormChange({ ...form, customer_email: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" color="#94a3b8">Additional Notes (Optional)</FormLabel>
              <Textarea
                value={form.notes}
                onChange={(e) => onFormChange({ ...form, notes: e.target.value })}
                rows={2}
              />
            </FormControl>
            <Button w="full" leftIcon={<FiUserPlus />} isLoading={isLoading} onClick={onSubmit}>
              Assign & Send Email
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
