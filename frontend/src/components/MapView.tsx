import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface Location {
  id: number;
  address: string;
  country: string;
  full_country_name: string;
  state_or_region?: string;
  firm_name?: string;
  duns_number?: string;
  related_entities?: string;
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
}

interface Drug {
  id: number;
  shortage_start?: string | null;
  shortage_end?: string | null;
}

interface NDC {
  id: number;
  drug_id: number;
  location_id: number;
}

interface MapViewProps {
  locations: Location[];
  drugs: Drug[];
  ndcs: NDC[];
  filters: any;
  searchQuery: string;
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
  drugs,
  ndcs,
  filters,
  searchQuery,
  onLocationSelect,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const geojsonSourceId = 'locations-source';

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 1.3,
    });

    map.current.on('load', () => {
      if (!map.current?.getSource(geojsonSourceId)) {
        map.current.addSource(geojsonSourceId, {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });

        map.current.addLayer({
          id: 'locations-layer',
          type: 'circle',
          source: geojsonSourceId,
          paint: {
            'circle-radius': 5,
            'circle-color': ['get', 'color'],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff',
          },
        });

        map.current.on('click', 'locations-layer', (e) => {
          const feature = e.features?.[0];
          if (feature) {
            const id = feature.properties?.id;
            const loc = locations.find(l => l.id === id);
            if (loc) onLocationSelect(loc);
          }
        });

        map.current.on('mouseenter', 'locations-layer', () => {
          map.current?.getCanvas().style.setProperty('cursor', 'pointer');
        });
        map.current.on('mouseleave', 'locations-layer', () => {
          map.current?.getCanvas().style.setProperty('cursor', '');
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return;

    const query = searchQuery.toLowerCase().trim();

    const filtered = locations.filter(loc => {
      if (!loc.latitude || !loc.longitude || isNaN(loc.latitude) || isNaN(loc.longitude)) return false;
      if (typeof loc.risk_score !== 'number') return false;

      // Filters
      if (filters.country && loc.country !== filters.country) return false;
      if (loc.risk_score < filters.riskScore[0] || loc.risk_score > filters.riskScore[1]) return false;
      if (filters.sanctions && !loc.ofac_sanctioned) return false;
      if (filters.dumping && !loc.engages_in_dumping) return false;
      if (filters.taa && !loc.taa_compliant) return false;

      if (filters.alliance === 'nato' && !loc.is_nato) return false;
      if (filters.alliance === 'five_eyes' && !loc.is_five_eyes) return false;
      if (filters.alliance === 'oecd' && !loc.is_oecd) return false;
      if (filters.alliance === 'quad' && !loc.is_quad) return false;

      if (filters.shortageStatus) {
        const locationNdcs = ndcs.filter(n => n.location_id === loc.id);
        const drugIds = new Set(locationNdcs.map(n => n.drug_id));
        const relatedDrugs = drugs.filter(d => drugIds.has(d.id));

        const matches = relatedDrugs.some(d => {
          const ongoing = d.shortage_start && !d.shortage_end;
          const resolved =
            (d.shortage_start && d.shortage_end) || (!d.shortage_start && d.shortage_end);
          const never = !d.shortage_start && !d.shortage_end;

          if (filters.shortageStatus === 'ongoing') return ongoing;
          if (filters.shortageStatus === 'resolved') return resolved;
          if (filters.shortageStatus === 'never') return never;
          return true;
        });

        if (!matches) return false;
      }

      // Smart search
      if (query) {
        const match = [
          loc.firm_name,
          loc.duns_number,
          loc.address,
          loc.country,
          loc.full_country_name,
          loc.state_or_region,
        ].some(field => field?.toLowerCase().includes(query));

        const drugMatch = loc.related_entities?.toLowerCase().includes(query);

        if (!match && !drugMatch) return false;
      }

      return true;
    });

    const geojson = {
      type: 'FeatureCollection',
      features: filtered.map(loc => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [loc.longitude, loc.latitude],
        },
        properties: {
          id: loc.id,
          color: getRiskColorHex(loc.risk_score),
        },
      })),
    };

    const source = map.current.getSource(geojsonSourceId) as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(geojson);
    }
  }, [locations, drugs, ndcs, filters, searchQuery]);

  return <div ref={mapContainer} className="h-full w-full rounded-xl overflow-hidden" />;
};

export default MapView;