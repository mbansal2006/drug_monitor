import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export interface Location {
  full_address: string;
  risk_score: number;
  firm_name: string;
  ndc_count: number;
  country: string;
}

export interface MapProps {
  locations: Location[];
}

const MAPBOX_TOKEN =
  'pk.eyJ1IjoibWJhbnNhbDA2IiwiYSI6ImNtOHRwNDB0dzA2bWYybHB0M3Q5NmltMnQifQ.SoIE1BpShnshj_AC7KI_uA';

const getRiskColor = (score: number) => {
  // Risk scores range 0-10 with 0 being highest risk. Map to red→green hue.
  const clamped = Math.max(0, Math.min(10, score));
  const hue = (clamped / 10) * 120; // 0 -> red, 10 -> green
  return `hsl(${hue},70%,50%)`;
};

const MarkerMap: React.FC<MapProps> = ({ locations }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [coordsMap, setCoordsMap] = useState<Record<string, [number, number]>>({});

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    if (!containerRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98, 39],
      zoom: 3,
    });
    return () => {
      mapRef.current?.remove();
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    const fetchCoords = async () => {
      for (const loc of locations) {
        const addr = loc.full_address;
        if (coordsMap[addr] || cancelled) continue;
        try {
          const resp = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              `${addr}, ${loc.country}`
            )}.json?limit=1&access_token=${MAPBOX_TOKEN}`
          );
          const data = await resp.json();
          if (data.features && data.features[0]) {
            const [lng, lat] = data.features[0].center;
            if (!cancelled) {
              setCoordsMap((prev) => ({ ...prev, [addr]: [lng, lat] }));
            }
          }
        } catch (err) {
          console.error('Geocoding failed', err);
        }
        await new Promise((r) => setTimeout(r, 200));
      }
    };
    fetchCoords();
    return () => {
      cancelled = true;
    };
  }, [locations, coordsMap]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const markers: mapboxgl.Marker[] = [];

    Object.entries(coordsMap).forEach(([addr, coords]) => {
      const loc = locations.find((l) => l.full_address === addr);
      if (!loc) return;
      const radius = 8;
      const el = document.createElement('div');
      el.style.width = `${radius * 2}px`;
      el.style.height = `${radius * 2}px`;
      el.style.borderRadius = '50%';
      el.style.backgroundColor = getRiskColor(loc.risk_score);
      el.style.opacity = '0.7';

      const popup = new mapboxgl.Popup({ offset: 20 }).setHTML(
        `<div class="text-sm"><strong>${loc.firm_name}</strong><br/>${loc.full_address}<br/>Risk Score: ${loc.risk_score}<br/>NDCs: ${loc.ndc_count.toLocaleString()}</div>`
      );

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map);
      markers.push(marker);
    });

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [coordsMap, locations]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default MarkerMap;
