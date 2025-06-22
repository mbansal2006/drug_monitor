import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibWJhbnNhbDA2IiwiYSI6ImNtOHRwNDB0dzA2bWYybHB0M3Q5NmltMnQifQ.SoIE1BpShnshj_AC7KI_uA';

const MapView = ({ locations }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [mode, setMode] = useState('markers');
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current && mapContainer.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [0, 20],
        zoom: 1.5,
      });

      mapRef.current.on('load', () => {
        setMapLoaded(true);
      });
    }
  }, []);

  // Update layers based on mode and locations
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    map.once('idle', () => {
      try {
        // Remove previous layers and sources
        const style = map.getStyle();
        if (style?.layers) {
          style.layers.forEach(layer => {
            if (layer.id.startsWith('loc-') || layer.id === 'heat') {
              if (map.getLayer(layer.id)) map.removeLayer(layer.id);
              if (map.getSource(layer.id)) map.removeSource(layer.id);
            }
          });
        }

        // Remove DOM markers
        map.getCanvas().querySelectorAll('.marker').forEach(m => m.remove());

        if (mode === 'markers') {
          locations.forEach(loc => {
            if (!loc.longitude || !loc.latitude) return;
            const color = loc.risk_score >= 67 ? '#dc2626' : loc.risk_score >= 34 ? '#facc15' : '#16a34a';
            const el = document.createElement('div');
            el.className = 'marker w-3 h-3 rounded-full';
            el.style.backgroundColor = color;

            new mapboxgl.Marker(el)
              .setLngLat([loc.longitude, loc.latitude])
              .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div class='text-sm'>
                  <strong>${loc.name}</strong><br/>
                  Risk: ${loc.risk_score}
                </div>`))
              .addTo(map);
          });
        } else {
          const geojson = {
            type: 'FeatureCollection',
            features: locations.filter(l => l.longitude && l.latitude).map(l => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [l.longitude, l.latitude] },
              properties: { risk: l.risk_score }
            }))
          };

          map.addSource('heat', { type: 'geojson', data: geojson });
          map.addLayer({
            id: 'heat',
            type: 'heatmap',
            source: 'heat',
            paint: {
              'heatmap-weight': ['get', 'risk'],
              'heatmap-intensity': 1,
              'heatmap-color': [
                'interpolate', ['linear'], ['heatmap-density'],
                0, 'rgba(33,102,172,0)',
                0.2, 'rgb(103,169,207)',
                0.4, 'rgb(209,229,240)',
                0.6, 'rgb(253,219,199)',
                0.8, 'rgb(239,138,98)',
                1, 'rgb(178,24,43)'
              ],
              'heatmap-radius': 20,
            }
          });
        }
      } catch (err) {
        console.error('Map rendering error:', err);
      }
    });
  }, [locations, mode, mapLoaded]);

  return (
    <div className="space-y-2">
      <div className="flex justify-end text-sm">
        <button onClick={() => setMode(mode === 'markers' ? 'heatmap' : 'markers')} className="px-3 py-1 border rounded">
          {mode === 'markers' ? 'Heatmap' : 'Markers'}
        </button>
      </div>
      <div ref={mapContainer} className="w-full h-64 lg:h-80 rounded shadow" />
    </div>
  );
};

export default MapView;