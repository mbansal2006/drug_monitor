import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  Database,
  MapPin,
} from 'lucide-react';

import Sidebar from '@/components/Sidebar';
import MapView from '@/components/MapView';
import SearchBar from '@/components/SearchBar';
import EntityGrid from '@/components/EntityGrid';
import EntityDetail from '@/components/EntityDetail';
import LocationDetail from '@/components/LocationDetail';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface Location {
  id: number;
  csv_location_id: number;
  address: string;
  country: string;
  state_or_region: string;
  full_country_name: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  oai_count: number;
  engages_in_dumping: boolean;
  has_bis_ns1: boolean;
  ofac_sanctioned: boolean;
  is_nato: boolean;
  is_five_eyes: boolean;
  taa_compliant: boolean;
}

interface Drug {
  id: number;
  drug_name: string;
  fda_essential: boolean;
  shortage_start: string;
  shortage_end: string;
  therapeutic_categories: string;
}

interface Manufacturer {
  id: number;
  manufacturer_name: string;
}

interface NDC {
  id: number;
  ndc_code: string;
  proprietary_name: string;
  drug_dosage: string;
  drug_strength: string;
  manufacturer_name: string;
}

const Index = () => {
  const [activeView, setActiveView] = useState<'map' | 'grid'>('map');
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [entityType, setEntityType] = useState<'drug' | 'location' | 'manufacturer' | 'ndc'>('location');
  const [locations, setLocations] = useState<Location[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [ndcs, setNDCs] = useState<NDC[]>([]);
  const [filters, setFilters] = useState({
    country: '',
    riskScore: [0, 10],
    alliance: '',
    sanctions: false,
    dumping: false,
  });
  const [searchQuery, setSearchQuery] = useState<{ query: string; type: 'location' | 'drug' | 'manufacturer' | 'ndc' }>({ query: '', type: 'location' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsRes, drugsRes, manufacturersRes, ndcsRes] = await Promise.all([
          fetch(`${API_URL}/api/locations`),
          fetch(`${API_URL}/api/drugs`),
          fetch(`${API_URL}/api/manufacturers`),
          fetch(`${API_URL}/api/ndcs`)
        ]);

        if (locationsRes.ok) setLocations(await locationsRes.json());
        if (drugsRes.ok) setDrugs(await drugsRes.json());
        if (manufacturersRes.ok) setManufacturers(await manufacturersRes.json());
        if (ndcsRes.ok) setNDCs(await ndcsRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEntitySelect = (entity: any, type: string) => {
    setSelectedEntity(entity);
    setEntityType(type as any);
    setSelectedLocation(null); // Close location detail when selecting other entity
  };

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location);
    setSelectedEntity(null); // Close entity detail when selecting location
  };

  const handleSearch = (payload: { query: string; type: 'location' | 'drug' | 'manufacturer' | 'ndc' }) => {
    setSearchQuery(payload);
  };

  const handleFilterChange = (newFilters: any) => setFilters(newFilters);

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 8) return 'bg-emerald-500';
    if (riskScore >= 6) return 'bg-yellow-500';
    if (riskScore >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const enrichedLocations = locations.filter(loc =>
    typeof loc.latitude === 'number' &&
    typeof loc.longitude === 'number' &&
    !isNaN(loc.latitude) &&
    !isNaN(loc.longitude) &&
    typeof loc.risk_score === 'number'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading Drug Monitor...</p>
        </div>
      </div>
    );
  }

console.log("✅ Enriched Locations Sample:", enrichedLocations[0]);
console.log("🔍 Enriched Locations:", enrichedLocations);
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Drug Monitor</h1>
            </div>
            <div className="text-sm text-slate-400">
              Pharmaceutical Supply Chain Risk Intelligence
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <SearchBar onSearch={handleSearch} />
            <div className="flex bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setActiveView('map')}
                className={`px-3 py-1 rounded text-sm ${activeView === 'map' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                <MapPin className="h-4 w-4 inline mr-1" />
                Map View
              </button>
              <button
                onClick={() => setActiveView('grid')}
                className={`px-3 py-1 rounded text-sm ${activeView === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'}`}
              >
                <Database className="h-4 w-4 inline mr-1" />
                Data View
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          locations={enrichedLocations}
          drugs={drugs}
          manufacturers={manufacturers}
          ndcs={ndcs}
          onEntitySelect={handleEntitySelect}
        />

        <div className="flex-1 flex">
          <div className="flex-1">
            {activeView === 'map' ? (
              <MapView
                locations={enrichedLocations}
                filters={filters}
                searchQuery={searchQuery}
                onLocationSelect={handleLocationSelect}
                getRiskColor={getRiskColor}
              />
            ) : (
              <EntityGrid
                entityType={entityType}
                setEntityType={setEntityType}
                locations={enrichedLocations}
                drugs={drugs}
                manufacturers={manufacturers}
                ndcs={ndcs}
                filters={filters}
                searchQuery={searchQuery}
                onEntitySelect={handleEntitySelect}
                getRiskColor={getRiskColor}
              />
            )}
          </div>

          {selectedLocation && (
            <div className="w-96 bg-slate-800 border-l border-slate-700">
              <LocationDetail
                location={selectedLocation}
                onClose={() => setSelectedLocation(null)}
                onEntitySelect={handleEntitySelect}
              />
            </div>
          )}

          {selectedEntity && !selectedLocation && (
            <div className="w-96 bg-slate-800 border-l border-slate-700">
              <EntityDetail
                entity={selectedEntity}
                entityType={entityType}
                onClose={() => setSelectedEntity(null)}
                onEntitySelect={handleEntitySelect}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
