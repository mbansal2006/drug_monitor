import React, { useEffect, useMemo, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export interface Location {
  full_address: string;
  risk_score: number;
  manufacturer: string;
  ndc_count: number;
  country: string;
}

export interface MapProps {
  locations: Location[];
}

const MAPBOX_TOKEN =
  'pk.eyJ1IjoibWJhbnNhbDA2IiwiYSI6ImNtOHRwNDB0dzA2bWYybHB0M3Q5NmltMnQifQ.SoIE1BpShnshj_AC7KI_uA';

const getRiskColor = (score: number) => {
  const clamped = Math.max(-5, Math.min(5, score));
  const hue = (clamped + 5) * 12;
  return `hsl(${hue},70%,50%)`;
};

const RiskChoroplethMap: React.FC<MapProps> = ({ locations }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const countryRisk = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>();
    locations.forEach((loc) => {
      const country = loc.country;
      if (!country) return;
      if (!map.has(country)) map.set(country, { sum: 0, count: 0 });
      const d = map.get(country)!;
      d.sum += loc.risk_score ?? 0;
      d.count += 1;
    });
    const result: Record<string, { avg: number; count: number }> = {};
    map.forEach((v, k) => {
      result[k] = { avg: v.sum / v.count, count: v.count };
    });
    return result;
  }, [locations]);

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    if (!containerRef.current) return;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98, 39],
      zoom: 1.5,
    });
    mapRef.current = map;

    map.on('load', async () => {
      const res = await fetch('/countries.geo.json');
      const geo: FeatureCollection = await res.json();
      (geo.features as Feature[]).forEach((f) => {
        const props = f.properties as Record<string, unknown>;
        const name = (props.name as string) || '';
        const data = countryRisk[name];
        if (data) {
          f.properties.risk = data.avg;
          f.properties.siteCount = data.count;
          f.properties.color = getRiskColor(data.avg);
        } else {
          f.properties.risk = null;
          f.properties.siteCount = 0;
          f.properties.color = '#e5e7eb';
        }
      });

      map.addSource('countries', {
        type: 'geojson',
        data: geo,
      });

      map.addLayer({
        id: 'country-fill',
        type: 'fill',
        source: 'countries',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.6,
        },
      });

      map.addLayer({
        id: 'country-outline',
        type: 'line',
        source: 'countries',
        paint: {
          'line-color': '#ffffff',
          'line-width': 0.5,
        },
      });

      const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });

      map.on('mousemove', 'country-fill', (e) => {
        const feature = e.features && e.features[0];
        if (!feature) return;
        const props = feature.properties as Record<string, unknown>;
        popup
          .setLngLat(e.lngLat)
          .setHTML(
            `<div class="text-sm"><strong>${props.name}</strong><br/>Sites: ${props.siteCount}<br/>Avg Risk Score: ${props.risk !== null ? Number(props.risk).toFixed(1) : 'N/A'}</div>`
          )
          .addTo(map);
      });

      map.on('mouseleave', 'country-fill', () => popup.remove());
    });

    return () => {
      map.remove();
    };
  }, [countryRisk]);

  return <div ref={containerRef} className="w-full h-[500px] rounded-md shadow-md" />;
};

export default RiskChoroplethMap;
