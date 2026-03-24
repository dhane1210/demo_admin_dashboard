import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, VStack, Button,
} from '@chakra-ui/react'
import { FiNavigation } from 'react-icons/fi'

interface TrackShipmentModalProps {
  isOpen: boolean
  onClose: () => void
  trackNumber: string
  onTrackNumberChange: (v: string) => void
  trackSealine: string
  onTrackSealineChange: (v: string) => void
  isLoading: boolean
  onSubmit: () => void
}

/**
 * Modal for tracking a new shipment by container/BL/booking number.
 */
export default function TrackShipmentModal({
  isOpen, onClose,
  trackNumber, onTrackNumberChange,
  trackSealine, onTrackSealineChange,
  isLoading, onSubmit,
}: TrackShipmentModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
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
                onChange={(e) => onTrackNumberChange(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" color="#94a3b8">Sealine (optional)</FormLabel>
              <Input
                placeholder="e.g. MSC, MAEU, HLCU"
                value={trackSealine}
                onChange={(e) => onTrackSealineChange(e.target.value)}
              />
            </FormControl>
            <Button
              w="full"
              leftIcon={<FiNavigation />}
              isLoading={isLoading}
              onClick={onSubmit}
            >
              Track Now
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
