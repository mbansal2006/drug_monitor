import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface Location {
  id: number;
  address: string;
  country: string;
  full_country_name: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  oai_count?: number;
  duns_number?: string;
  ofac_sanctioned?: boolean;
  engages_in_dumping?: boolean;
  has_bis_ns1?: boolean;
  quality_risk_flag?: boolean;
  is_nato?: boolean;
  is_five_eyes?: boolean;
  is_oecd?: boolean;
  is_quad?: boolean;
  taa_compliant?: boolean;
}

interface MapViewProps {
  locations: Location[];
  filters: any;
  searchQuery: string;
  onLocationSelect: (location: Location) => void;
}

// ✅ Use real hex colors for marker background
const getRiskColorHex = (riskScore: number) => {
  if (riskScore >= 8) return '#10b981'; // emerald
  if (riskScore >= 6) return '#f59e0b'; // yellow
  if (riskScore >= 4) return '#f97316'; // orange
  return '#ef4444'; // red
};

const MapView: React.FC<MapViewProps> = ({
  locations,
  filters,
  searchQuery,
  onLocationSelect,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 1.3,
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;
    map.current.on('load', updateMarkers);
    updateMarkers();
  }, [locations, filters, searchQuery]);

  const updateMarkers = () => {
    if (!map.current) return;

    document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());

    const filteredLocations = locations.filter(loc => {
      if (!loc.latitude || !loc.longitude || isNaN(loc.latitude) || isNaN(loc.longitude)) return false;
      if (typeof loc.risk_score !== 'number') return false;
      if (filters.country && loc.country !== filters.country) return false;
      if (loc.risk_score < filters.riskScore[0] || loc.risk_score > filters.riskScore[1]) return false;
      if (filters.sanctions && !loc.ofac_sanctioned) return false;
      if (filters.alliance === 'nato' && !loc.is_nato) return false;
      if (filters.alliance === 'five_eyes' && !loc.is_five_eyes) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          loc.country?.toLowerCase().includes(q) ||
          loc.full_country_name?.toLowerCase().includes(q) ||
          loc.address?.toLowerCase().includes(q)
        );
      }

      return true;
    });

    filteredLocations.forEach(loc => {
      const el = document.createElement('div');
      el.className = 'w-3.5 h-3.5 rounded-full border border-white shadow-md';
      el.style.backgroundColor = getRiskColorHex(loc.risk_score);

      const popupHtml = `
        <div class='text-sm text-black'>
          <strong class='text-slate-600'>${loc.full_country_name}</strong><br/>
          <span class='text-slate-600'>Reliability Score: ${loc.risk_score}/10</span><br/>
          <span class='text-slate-600'>${loc.address || 'Unknown Address'}</span>
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([loc.longitude, loc.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 12 }).setHTML(popupHtml))
        .addTo(map.current!);

      el.addEventListener('click', () => onLocationSelect(loc));
    });
  };

  return (
    <div className="h-full w-full relative">
      <div ref={mapContainer} className="h-full w-full rounded-xl overflow-hidden" />
    </div>
  );
};

export default MapView;