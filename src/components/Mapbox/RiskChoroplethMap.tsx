import React, { useEffect, useMemo, useRef } from 'react';
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

const NAME_MAP: Record<string, string> = {
  'United States': 'United States of America',
};

const getRiskColor = (score: number) => {
  // Scores range 0-10 where 0 is highest risk.
  const clamped = Math.max(0, Math.min(10, score));
  const hue = (clamped / 10) * 120; // 0 -> red, 10 -> green
  return `hsl(${hue},70%,50%)`;
};

const RiskChoroplethMap: React.FC<MapProps> = ({ locations }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const countryRisk = useMemo(() => {
    const map = new Map<string, { sum: number; count: number; ndc: number }>();
    locations.forEach((loc) => {
      const country = NAME_MAP[loc.country] || loc.country;
      if (!country) return;
      if (!map.has(country)) map.set(country, { sum: 0, count: 0, ndc: 0 });
      const d = map.get(country)!;
      d.sum += loc.risk_score ?? 0;
      d.count += 1;
      d.ndc += loc.ndc_count ?? 0;
    });
    const result: Record<string, { avg: number; count: number; ndc: number }> = {};
    map.forEach((v, k) => {
      result[k] = { avg: v.sum / v.count, count: v.count, ndc: v.ndc };
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
        const data =
          countryRisk[name] || countryRisk[NAME_MAP[name as string] || ''];

        if (data) {
          props.siteCount = data.count;
          props.ndcCount = data.ndc;
          if (name === 'United States of America') {
            props.risk = null;
            props.color = '#e5e7eb';
          } else {
            props.risk = data.avg;
            props.color = getRiskColor(data.avg);
          }
        } else {
          props.risk = null;
          props.siteCount = 0;
          props.ndcCount = 0;
          props.color = '#e5e7eb';
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
            `<div class="text-sm"><strong>${props.name}</strong><br/>Sites: ${props.siteCount}<br/>NDCs: ${props.ndcCount}<br/>Risk Score (0-10): ${props.risk !== null ? Number(props.risk).toFixed(1) : 'N/A'}</div>`
          )
          .addTo(map);
      });

      map.on('mouseleave', 'country-fill', () => popup.remove());
    });

    return () => {
      map.remove();
    };
  }, [countryRisk]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default RiskChoroplethMap;
