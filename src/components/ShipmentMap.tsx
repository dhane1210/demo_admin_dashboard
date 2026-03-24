import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import { Box, Text, Flex } from '@chakra-ui/react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default Leaflet icon not showing up in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom DivIcons for better aesthetics
const createMapIcon = (type: 'vessel' | 'port' | 'history', status?: string, alertCount: number = 0) => {
  let bgColor = '#6366f1' // default indigo
  if (type === 'vessel') {
    if (alertCount > 0) bgColor = '#f87171' // red for alerts
    else if (status === 'ARRIVED' || status === 'COMPLETED') bgColor = '#4ade80' // green for arrived
    else if (status === 'DELAYED') bgColor = '#f87171'
    else bgColor = '#60a5fa' // light blue for transit
  }

  const isVessel = type === 'vessel'
  const isHistory = type === 'history'
  
  const size = isVessel ? 24 : isHistory ? 8 : 14
  const pulseHtml = isVessel ? `<div style="position:absolute;top:-4px;left:-4px;width:32px;height:32px;background:${bgColor};border-radius:50%;opacity:0.4;animation:pulse 2s infinite;"></div>` : ''
  const alertBadge = alertCount > 0 && isVessel ? `<div style="position:absolute;top:-8px;right:-8px;background:#ef4444;color:white;font-size:10px;font-weight:bold;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #1a1d2e;z-index:10;">${alertCount}</div>` : ''

  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulseHtml}
        <div style="position:absolute;top:0;left:0;width:${size}px;height:${size}px;background:${isHistory ? '#64748b' : bgColor};border-radius:50%;border:2px solid ${isHistory ? '#334155' : '#1a1d2e'};box-shadow:0 0 10px rgba(0,0,0,0.5);z-index:2;"></div>
        ${alertBadge}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  })
}

interface MapProps {
  shipmentsData?: any[] // Array of raw_api_response objects from Sinay
  alerts?: any[] // Optional array of alerts
  shipments?: any[] // The actual shipment objects to map statuses and names
  height?: string
}

function MapUpdater({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap()
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [bounds, map])
  return null
}

export default function ShipmentMap({ shipmentsData = [], alerts = [], shipments = [], height = '400px' }: MapProps) {
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null)
  
  // Aggregate data from all shipments
  const allLocations: any[] = []
  const allHistory: any[] = []
  const allRoutes: any[][] = []
  const allVessels: any[] = []

  // Ensure shipmentsData is an array
  const safeData = Array.isArray(shipmentsData) ? shipmentsData : []

  safeData.forEach((inputData, index) => {
    if (!inputData) return;

    // Sometimes the backend stores JSON as a string if its column is text/varchar instead of jsonb
    let data: any = inputData
    if (typeof inputData === 'string') {
      try {
        data = JSON.parse(inputData)
      } catch (e) {
        console.warn('Failed to parse shipment data', e)
        return
      }
    }

    const shipmentLabel = data?.metadata?.shipmentNumber || `Shipment ${index + 1}`

    // Parse port locations
    if (Array.isArray(data.locations)) {
      data.locations.forEach((loc: any) => {
        if (loc?.coordinates?.lat && loc?.coordinates?.lng) {
          allLocations.push({
            lat: loc.coordinates.lat,
            lng: loc.coordinates.lng,
            name: loc.name || 'Unknown Port',
            shipment: shipmentLabel
          })
        }
      })
    }

    // Parse specific facilities as well if present
    if (Array.isArray(data.facilities)) {
      data.facilities.forEach((fac: any) => {
          if (fac?.coordinates?.lat && fac?.coordinates?.lng) {
              allLocations.push({
                  lat: fac.coordinates.lat,
                  lng: fac.coordinates.lng,
                  name: fac.name || 'Unknown Facility',
                  shipment: shipmentLabel
              })
          }
      })
    }

    // Parse route paths
    if (data.routeData?.routeSegments && Array.isArray(data.routeData.routeSegments)) {
      data.routeData.routeSegments.forEach((segment: any) => {
        if (Array.isArray(segment.path)) {
          const validPath = segment.path.filter((pt: any) => pt && pt.lat !== undefined && pt.lng !== undefined)
          if (validPath.length > 0) {
            allRoutes.push(validPath)
          }
        }
      })
    }

    // Parse historical container events
    if (Array.isArray(data.containers)) {
      data.containers.forEach((container: any) => {
        if (Array.isArray(container.events)) {
          container.events.forEach((event: any) => {
            if (event.isActual && event.location?.coordinates?.lat && event.location?.coordinates?.lng) {
              allHistory.push({
                lat: event.location.coordinates.lat,
                lng: event.location.coordinates.lng,
                name: event.description || event.eventType || 'Event',
                date: event.date,
                shipment: shipmentLabel
              })
            }
          })
        }
      })
    }

    // Parse current vessel locations
    const vesselPos = data.routeData?.ais?.data?.lastVesselPosition
    const vesselDetails = data.routeData?.ais?.data?.vessel
    if (vesselPos?.lat && vesselPos?.lng) {
      
      // Find the parent shipment object if provided to map statuses correctly
      const parentShipment = shipments.find(s => s.shipment_number === data.metadata?.shipmentNumber || s.raw_api_response === inputData)
      const shipmentId = parentShipment?.id

      // Aggregate alerts for this ship
      const vesselAlerts = alerts.filter(a => a.shipment_id === shipmentId || (data.metadata?.shipmentNumber && a.shipment_number === data.metadata.shipmentNumber))

      allVessels.push({
        lat: vesselPos.lat,
        lng: vesselPos.lng,
        name: vesselDetails?.name || data.metadata?.sealineName || 'Vessel',
        shipment: shipmentLabel,
        status: parentShipment?.status || data.metadata?.shippingStatus,
        alerts: vesselAlerts
      })
    }
  })

  useEffect(() => {
    const latLngs: L.LatLngExpression[] = []
    
    allLocations.forEach(loc => latLngs.push([loc.lat, loc.lng]))
    allHistory.forEach(loc => latLngs.push([loc.lat, loc.lng]))
    allRoutes.forEach(route => route.forEach(pt => latLngs.push([pt.lat, pt.lng])))
    allVessels.forEach(v => latLngs.push([v.lat, v.lng]))

    if (latLngs.length > 0) {
      const newBounds = L.latLngBounds(latLngs)
      if (newBounds.isValid()) {
         setBounds(newBounds)
      }
    }
  }, [shipmentsData])

  if (allLocations.length === 0 && allRoutes.length === 0 && allVessels.length === 0 && allHistory.length === 0) {
    return (
      <Flex height={height} bg="surface.cardHover" align="center" justify="center" borderRadius="12px" border="1px dashed" borderColor="surface.border">
        <Text color="text.muted" fontSize="sm">No tracking data available.</Text>
      </Flex>
    )
  }

  // Fallback center defaults to [20, 0] if bounds aren't ready or valid
  const center: L.LatLngExpression = bounds && bounds.isValid() ? bounds.getCenter() : [20, 0]

  return (
    <Box height={height} width="100%" borderRadius="12px" overflow="hidden" position="relative" zIndex={1}>
      <MapContainer 
        center={center} 
        zoom={2} 
        style={{ height: '100%', width: '100%', background: '#0f1117' }} // matching the dark theme
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {bounds && bounds.isValid() && <MapUpdater bounds={bounds} />}

        {/* Route Lines */}
        {allRoutes.map((route, idx) => (
          <Polyline 
            key={`route-${idx}`}
            positions={route.map(p => [p.lat, p.lng])} 
            color="#6366f1" // primary indigo color
            weight={3}
            opacity={0.6}
            dashArray="10, 10"
          />
        ))}

        {/* Historical Event Markers */}
        {allHistory.map((loc, i) => (
          <Marker key={`hist-${i}`} position={[loc.lat, loc.lng]} icon={createMapIcon('history')}>
            <Popup>
              <Text fontWeight="600" fontSize="xs">{loc.name}</Text>
              <Text fontSize="xs" color="#94a3b8">{loc.shipment}</Text>
              {loc.date && <Text fontSize="xs" color="#94a3b8">Date: {new Date(loc.date).toLocaleDateString()}</Text>}
            </Popup>
          </Marker>
        ))}

        {/* Port/Location Markers */}
        {allLocations.map((loc, i) => (
          <Marker key={`loc-${i}`} position={[loc.lat, loc.lng]} icon={createMapIcon('port')}>
            <Popup>
              <Text fontWeight="600">{loc.name}</Text>
              <Text fontSize="xs" color="#64748b">{loc.shipment}</Text>
            </Popup>
          </Marker>
        ))}

        {/* Vessel Markers */}
        {allVessels.map((v, i) => (
          <Marker key={`vessel-${i}`} position={[v.lat, v.lng]} icon={createMapIcon('vessel', v.status, v.alerts.length)}>
            <Popup>
              <Text fontWeight="600">{v.name}</Text>
              <Text fontSize="xs" color="#6366f1">Shipment: {v.shipment}</Text>
              <Text fontSize="xs" color="#94a3b8">Status: {v.status || 'UNKNOWN'}</Text>
              {v.alerts.length > 0 && (
                <Box mt={2}>
                  <Text fontSize="xs" fontWeight="bold" color="#ef4444">Active Alerts ({v.alerts.length}):</Text>
                  <ul style={{ paddingLeft: '15px', marginTop: '4px', fontSize: '10px', color: '#f87171' }}>
                    {v.alerts.map((a: any, idx: number) => (
                      <li key={idx}>{a.alert_type}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  )
}

