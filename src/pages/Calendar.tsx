import { useEffect, useState } from 'react'
import {
  Box, Text, Flex, Button, useToast,
  SimpleGrid, HStack, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, Textarea, Select, VStack,
  useDisclosure, Badge,
} from '@chakra-ui/react'
import { FiPlus, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import { calendarApi } from '../api/calendar'
import type { CalendarEvent } from '../types'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths } from 'date-fns'
import { WEEKDAYS, CALENDAR_EVENT_COLORS } from '../constants'
import { LoadingSpinner } from '../components/common'

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const toast = useToast()
  const createModal = useDisclosure()

  // Create form state
  const [newEvent, setNewEvent] = useState({
    title: '', event_type: 'CUSTOM', event_date: '', description: '', color: '#6366f1',
  })
  const [creating, setCreating] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await calendarApi.getEvents()
      setEvents(Array.isArray(res.data) ? res.data : [])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load'
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const syncShipments = async () => {
    try {
      await calendarApi.syncFromShipments()
      toast({ title: 'Events synced from shipments!', status: 'success', duration: 3000 })
      load()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sync failed'
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000 })
    }
  }

  const handleCreate = async () => {
    if (!newEvent.title || !newEvent.event_date) {
      toast({ title: 'Title and date required', status: 'warning', duration: 3000 })
      return
    }
    setCreating(true)
    try {
      await calendarApi.createEvent({
        title: newEvent.title,
        event_type: newEvent.event_type,
        event_date: newEvent.event_date,
        description: newEvent.description || undefined,
        color: newEvent.color,
      })
      toast({ title: 'Event created!', status: 'success', duration: 3000 })
      createModal.onClose()
      setNewEvent({ title: '', event_type: 'CUSTOM', event_date: '', description: '', color: '#6366f1' })
      load()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Create failed'
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000 })
    } finally {
      setCreating(false)
    }
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return
    try {
      await calendarApi.deleteEvent(id)
      toast({ title: 'Event deleted', status: 'success', duration: 2000 })
      load()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Delete failed'
      toast({ title: 'Error', description: msg, status: 'error', duration: 4000 })
    }
  }

  // Calendar grid
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart) // 0=Sun

  const getEventsForDay = (day: Date) =>
    events.filter(e => {
      try { return isSameDay(parseISO(e.event_date), day) } catch { return false }
    })

  if (loading) return <LoadingSpinner />

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={5}>
        <HStack>
          <IconButton aria-label="Prev" icon={<Text>‹</Text>} variant="ghost" size="sm" onClick={() => setCurrentDate(d => subMonths(d, 1))} />
          <Text fontSize="lg" fontWeight="700" color="white" minW="180px" textAlign="center">
            {format(currentDate, 'MMMM yyyy')}
          </Text>
          <IconButton aria-label="Next" icon={<Text>›</Text>} variant="ghost" size="sm" onClick={() => setCurrentDate(d => addMonths(d, 1))} />
        </HStack>
        <HStack>
          <Button size="sm" variant="outline" leftIcon={<FiRefreshCw />} onClick={syncShipments} borderRadius="8px">
            Sync Shipments
          </Button>
          <Button size="sm" leftIcon={<FiPlus />} onClick={createModal.onOpen} borderRadius="8px">
            Add Event
          </Button>
        </HStack>
      </Flex>

      {/* Calendar Grid */}
      <Box bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="14px" overflow="hidden">
        {/* Weekday headers */}
        <SimpleGrid columns={7} borderBottom="1px solid" borderColor="surface.border">
          {WEEKDAYS.map(d => (
            <Flex key={d} justify="center" py={3}>
              <Text fontSize="xs" fontWeight="700" color="#64748b" textTransform="uppercase">{d}</Text>
            </Flex>
          ))}
        </SimpleGrid>

        {/* Days Grid */}
        <SimpleGrid columns={7}>
          {/* Padding cells */}
          {Array.from({ length: startPad }).map((_, i) => (
            <Box key={`pad-${i}`} minH="100px" borderRight="1px solid" borderBottom="1px solid" borderColor="surface.border" bg="rgba(0,0,0,0.15)" />
          ))}
          {/* Day cells */}
          {days.map(day => {
            const dayEvents = getEventsForDay(day)
            const isToday = isSameDay(day, new Date())
            return (
              <Box
                key={day.toISOString()}
                minH="100px"
                p={2}
                borderRight="1px solid"
                borderBottom="1px solid"
                borderColor="surface.border"
                bg={isToday ? 'rgba(99,102,241,0.06)' : 'transparent'}
                _hover={{ bg: 'surface.cardHover' }}
                transition="background 0.15s"
              >
                <Text
                  fontSize="sm"
                  fontWeight={isToday ? '700' : '500'}
                  color={isToday ? 'brand.400' : '#cbd5e1'}
                  mb={1}
                >
                  {format(day, 'd')}
                </Text>
                <VStack align="stretch" spacing={1}>
                  {dayEvents.slice(0, 3).map(ev => (
                    <Flex
                      key={ev.id}
                      align="center"
                      justify="space-between"
                      px={2}
                      py={1}
                      borderRadius="4px"
                      bg={`${ev.color || CALENDAR_EVENT_COLORS[ev.event_type] || '#6366f1'}20`}
                      fontSize="xs"
                      cursor="pointer"
                      role="group"
                    >
                      <Text
                        color={ev.color || CALENDAR_EVENT_COLORS[ev.event_type] || '#818cf8'}
                        fontWeight="600"
                        noOfLines={1}
                        flex={1}
                      >
                        {ev.title}
                      </Text>
                      <IconButton
                        aria-label="Delete"
                        icon={<FiTrash2 />}
                        variant="ghost"
                        size="xs"
                        minW="auto"
                        h="auto"
                        p={0}
                        color="#f87171"
                        opacity={0}
                        _groupHover={{ opacity: 1 }}
                        onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id) }}
                      />
                    </Flex>
                  ))}
                  {dayEvents.length > 3 && (
                    <Text fontSize="xs" color="#64748b">+{dayEvents.length - 3} more</Text>
                  )}
                </VStack>
              </Box>
            )
          })}
        </SimpleGrid>
      </Box>

      {/* Upcoming Events List */}
      <Box bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="14px" p={5} mt={6}>
        <Text fontWeight="700" color="white" mb={4}>All Events ({events.length})</Text>
        {events.length === 0 ? (
          <Text color="#64748b" textAlign="center" py={4}>No events. Click "Sync Shipments" or "Add Event".</Text>
        ) : (
          <VStack align="stretch" spacing={2}>
            {events.sort((a, b) => a.event_date.localeCompare(b.event_date)).map(ev => (
              <Flex
                key={ev.id}
                align="center"
                gap={3}
                px={4} py={3}
                borderRadius="10px"
                bg="#12141f"
                border="1px solid"
                borderColor="surface.border"
                _hover={{ borderColor: 'surface.borderHover' }}
                transition="all 0.15s"
              >
                <Box w="4px" h="36px" borderRadius="2px" bg={ev.color || CALENDAR_EVENT_COLORS[ev.event_type] || '#6366f1'} />
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="600" color="white">{ev.title}</Text>
                  <Text fontSize="xs" color="#64748b">{ev.description || ev.event_type}</Text>
                </Box>
                <Badge bg="rgba(99,102,241,0.15)" color="#818cf8" fontSize="xs" px={2} py={1} borderRadius="4px">
                  {ev.event_type}
                </Badge>
                <Text fontSize="xs" color="#94a3b8" whiteSpace="nowrap">
                  {(() => { try { return format(parseISO(ev.event_date), 'dd MMM yyyy') } catch { return ev.event_date } })()}
                </Text>
                <IconButton
                  aria-label="Delete"
                  icon={<FiTrash2 />}
                  variant="ghost"
                  size="xs"
                  color="#f87171"
                  onClick={() => deleteEvent(ev.id)}
                />
              </Flex>
            ))}
          </VStack>
        )}
      </Box>

      {/* Create Event Modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.onClose} size="md">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent bg="#1a1d2e" borderColor="#2d3148" borderWidth="1px" borderRadius="16px">
          <ModalHeader borderBottom="1px solid" borderColor="#2d3148" color="white">Create Event</ModalHeader>
          <ModalCloseButton color="#94a3b8" />
          <ModalBody py={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="#94a3b8">Title</FormLabel>
                <Input value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} placeholder="Event title" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="#94a3b8">Date</FormLabel>
                <Input type="date" value={newEvent.event_date} onChange={e => setNewEvent(p => ({ ...p, event_date: e.target.value }))} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="#94a3b8">Type</FormLabel>
                <Select value={newEvent.event_type} onChange={e => setNewEvent(p => ({ ...p, event_type: e.target.value }))}>
                  <option value="CUSTOM">Custom</option>
                  <option value="ETD">ETD</option>
                  <option value="ETA">ETA</option>
                  <option value="CUTOFF">Cutoff</option>
                  <option value="DELIVERY">Delivery</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="#94a3b8">Description</FormLabel>
                <Textarea value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" rows={3} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="#94a3b8">Color</FormLabel>
                <Input type="color" value={newEvent.color} onChange={e => setNewEvent(p => ({ ...p, color: e.target.value }))} />
              </FormControl>
              <Button w="full" onClick={handleCreate} isLoading={creating} leftIcon={<FiPlus />}>Create Event</Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
