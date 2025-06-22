import React, { useEffect, useRef, useState } from 'react';
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
  ofac_sanctioned?: boolean;
  engages_in_dumping?: boolean;
  taa_compliant?: boolean;
  is_nato?: boolean;
  is_five_eyes?: boolean;
  is_oecd?: boolean;
  is_quad?: boolean;
  related_entities?: string;
}

interface SearchQuery {
  query: string;
  type: string;
}

interface MapViewProps {
  locations: Location[];
  filters: any;
  searchQuery: SearchQuery;
  onLocationSelect: (location: Location) => void;
}

const getRiskColorHex = (riskScore: number) => {
  if (riskScore >= 8) return '#10b981';
  if (riskScore >= 6) return '#f59e0b';
  if (riskScore >= 4) return '#f97316';
  return '#ef4444';
};

const MapView: React.FC<MapViewProps> = ({
  locations,
  filters,
  searchQuery,
  onLocationSelect,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 1.3,
    });

    map.current.on('load', () => {
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!map.current || !isLoaded) return;

    setIsRendering(true);

    const attemptRender = () => {
      if (!map.current?.isStyleLoaded()) {
        requestAnimationFrame(attemptRender);
        return;
      }

      // Clear old markers
      markerRefs.current.forEach(m => m.remove());
      markerRefs.current = [];

      const query = searchQuery?.query?.toLowerCase().trim() || '';
      const searchType = searchQuery?.type || 'location';

      const filtered = locations.filter(loc => {
        if (!loc.latitude || !loc.longitude || isNaN(loc.latitude) || isNaN(loc.longitude)) return false;
        if (typeof loc.risk_score !== 'number') return false;

        if (filters.country && loc.country !== filters.country) return false;
        if (loc.risk_score < filters.riskScore[0] || loc.risk_score > filters.riskScore[1]) return false;
        if (filters.sanctions && !loc.ofac_sanctioned) return false;
        if (filters.dumping && !loc.engages_in_dumping) return false;
        if (filters.taa && !loc.taa_compliant) return false;

        if (filters.alliance === 'nato' && !loc.is_nato) return false;
        if (filters.alliance === 'five_eyes' && !loc.is_five_eyes) return false;
        if (filters.alliance === 'oecd' && !loc.is_oecd) return false;
        if (filters.alliance === 'quad' && !loc.is_quad) return false;

        if (query) {
          const inAddress = loc.address?.toLowerCase().includes(query);
          const inCountry = loc.country?.toLowerCase().includes(query);
          const inFullName = loc.full_country_name?.toLowerCase().includes(query);
          const inEntities = loc.related_entities?.toLowerCase().includes(query);
          return inAddress || inCountry || inFullName || inEntities;
        }

        return true;
      });

      filtered.forEach(loc => {
        const el = document.createElement('div');
        el.className = 'w-3.5 h-3.5 rounded-full border border-white shadow-md cursor-pointer hover:scale-110 transition-transform';
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
        markerRefs.current.push(marker);
      });

      setIsRendering(false);
    };

    requestAnimationFrame(attemptRender);
  }, [locations, filters, searchQuery, isLoaded]);

  return (
    <div className="h-full w-full relative">
      {isRendering && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40 z-10 flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      <div ref={mapContainer} className="h-full w-full rounded-xl overflow-hidden" />
    </div>
  );
};

export default MapView;