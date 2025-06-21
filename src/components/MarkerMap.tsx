import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import Papa from 'papaparse';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibWJhbnNhbDA2IiwiYSI6ImNtOHRwNDB0dzA2bWYybHB0M3Q5NmltMnQifQ.SoIE1BpShnshj_AC7KI_uA';

type Location = {
  location_id: string;
  latitude: string;
  longitude: string;
  address: string;
  firm_name: string;
  risk_score: string;
  full_country_name: string;
};

type NdcLocationLink = {
  ndc_id: string;
  location_id: string;
};

type Ndc = {
  ndc_id: string;
  shortage_status: string;
};

const MapComponent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [locText, linkText, ndcText] = await Promise.all([
        fetch('/site_csvs/site_locations_table_with_coords.csv').then((r) => r.text()),
        fetch('/site_csvs/site_ndc_location_link.csv').then((r) => r.text()),
        fetch('/site_csvs/site_ndcs_table.csv').then((r) => r.text()),
      ]);

      const locData = Papa.parse<Location>(locText, { header: true }).data;
      const linkData = Papa.parse<NdcLocationLink>(linkText, { header: true }).data;
      const ndcData = Papa.parse<Ndc>(ndcText, { header: true }).data;

      const shortageNdcIds = new Set(ndcData.filter(n => n.shortage_status === 'Shortage').map(n => n.ndc_id));

      const ndcCountByLocation = new Map<string, number>();
      linkData.forEach(link => {
        if (shortageNdcIds.has(link.ndc_id)) {
          ndcCountByLocation.set(link.location_id, (ndcCountByLocation.get(link.location_id) || 0) + 1);
        }
      });

      if (!mapContainerRef.current) return;
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-30, 20],
        zoom: 1.5,
      });
      mapRef.current = map;

      locData.forEach(loc => {
        const lat = parseFloat(loc.latitude);
        const lng = parseFloat(loc.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        const count = ndcCountByLocation.get(loc.location_id) || 0;
        const color = parseFloat(loc.risk_score) >= 7 ? 'red' : parseFloat(loc.risk_score) >= 4 ? 'orange' : parseFloat(loc.risk_score) >= 1 ? 'yellow' : 'green';

        const el = document.createElement('div');
        el.style.width = '10px';
        el.style.height = '10px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = color;
        el.style.cursor = 'pointer';

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div>
            <strong>${loc.firm_name || 'Unknown'}</strong><br/>
            ${loc.address}<br/>
            ${loc.full_country_name || loc.country || 'Unknown'} Risk Score: ${loc.risk_score || 'N/A'}<br/>
            FDA Shortage List NDCs Manufactured: ${count}
          </div>
        `);

        new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);
      });
    };

    loadData();

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  return <div ref={mapContainerRef} className="w-full h-[500px] rounded-md shadow-md" />;
};

export default MapComponent;