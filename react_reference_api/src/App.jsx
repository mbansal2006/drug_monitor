import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import MapView from './components/MapView';
import LocationTable from './components/LocationTable';
import FilterSidebar from './components/FilterSidebar';
import ObjectDetailPanel from './components/ObjectDetailPanel';

const App = () => {
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    query: '',
    country: '',
    risk_bucket: '',
    taa_compliant: false,
    ofac_sanctioned: false,
  });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const params = {};
        if (filters.query) params.q = filters.query;
        if (filters.country) params.country = filters.country;
        if (filters.risk_bucket) params.risk_bucket = filters.risk_bucket;
        if (filters.taa_compliant) params.taa_compliant = true;
        if (filters.ofac_sanctioned) params.ofac_sanctioned = true;

        const resp = await axios.get('http://localhost:3000/api/locations', { params });
        setLocations(resp.data);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      }
    };
    fetchLocations();
  }, [filters]);

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-[#0052CC] text-white p-4 space-y-3">
        <h2 className="text-lg font-semibold mb-4">Drug Monitor</h2>
        <Link to="/" className="block hover:bg-blue-800 px-3 py-2 rounded">Locations</Link>
        <Link to="/drugs" className="block hover:bg-blue-800 px-3 py-2 rounded">Drugs</Link>
        <Link to="/manufacturers" className="block hover:bg-blue-800 px-3 py-2 rounded">Manufacturers</Link>
      </aside>

      <main className="flex-1 p-4 space-y-4">
        <Routes>
          <Route
            path="/"
            element={
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div>
                  <FilterSidebar filters={filters} setFilters={setFilters} />
                </div>
                <div className="lg:col-span-3 space-y-4">
                  <MapView locations={locations} />
                  <LocationTable locations={locations} onSelect={setSelected} />
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      <ObjectDetailPanel item={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default App;