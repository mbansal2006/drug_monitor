
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Layers, Info } from 'lucide-react';

interface Location {
  id: number;
  address: string;
  country: string;
  full_country_name: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  oai_count: number;
  ofac_sanctioned: boolean;
  is_nato: boolean;
  is_five_eyes: boolean;
}

interface MapViewProps {
  locations: Location[];
  filters: any;
  searchQuery: string;
  onLocationSelect: (location: Location) => void;
  getRiskColor: (riskScore: number) => string;
}

const MapView: React.FC<MapViewProps> = ({
  locations,
  filters,
  searchQuery,
  onLocationSelect,
  getRiskColor
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const filteredLocations = locations.filter(location => {
    if (filters.country && location.country !== filters.country) return false;
    if (location.risk_score < filters.riskScore[0] || location.risk_score > filters.riskScore[1]) return false;
    if (filters.sanctions && !location.ofac_sanctioned) return false;
    if (filters.alliance) {
      switch (filters.alliance) {
        case 'nato':
          if (!location.is_nato) return false;
          break;
        case 'five_eyes':
          if (!location.is_five_eyes) return false;
          break;
      }
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return location.country.toLowerCase().includes(query) ||
             location.full_country_name.toLowerCase().includes(query) ||
             location.address.toLowerCase().includes(query);
    }
    return true;
  });

  const getRiskColorClass = (riskScore: number) => {
    if (riskScore >= 8) return 'text-emerald-400 bg-emerald-400/20';
    if (riskScore >= 6) return 'text-yellow-400 bg-yellow-400/20';
    if (riskScore >= 4) return 'text-orange-400 bg-orange-400/20';
    return 'text-red-400 bg-red-400/20';
  };

  const getRiskColorHex = (riskScore: number) => {
    if (riskScore >= 8) return '#10b981';
    if (riskScore >= 6) return '#f59e0b';
    if (riskScore >= 4) return '#f97316';
    return '#ef4444';
  };

  // Group locations by country for better visualization
  const locationsByCountry = filteredLocations.reduce((acc, location) => {
    const key = location.country;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(location);
    return acc;
  }, {} as Record<string, Location[]>);

  return (
    <div className="h-full bg-slate-900 relative">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            showHeatmap 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Layers className="h-4 w-4 mr-2" />
          {showHeatmap ? 'Hide' : 'Show'} Heatmap
        </button>
      </div>

      {/* Map Container - Using a grid-based world map visualization */}
      <div className="h-full p-8">
        <div className="h-full bg-slate-800 rounded-xl border border-slate-700 relative overflow-hidden">
          {/* World Map Background */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 1000 500" className="w-full h-full">
              {/* Simplified world map outline */}
              <path
                d="M150,200 L300,180 L350,220 L400,200 L450,240 L500,220 L550,200 L600,180 L650,200 L700,220 L750,200 L800,180 L850,200"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>

          {/* Location Markers */}
          <div className="absolute inset-0 p-8">
            <div className="relative w-full h-full">
              {Object.entries(locationsByCountry).map(([country, countryLocations]) => {
                // Simple positioning based on country - in a real app, you'd use actual coordinates
                const position = {
                  x: Math.random() * 80 + 10, // 10-90% from left
                  y: Math.random() * 60 + 20, // 20-80% from top
                };

                const avgRiskScore = countryLocations.reduce((sum, loc) => sum + loc.risk_score, 0) / countryLocations.length;
                const totalFacilities = countryLocations.length;

                return (
                  <div
                    key={country}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{ left: `${position.x}%`, top: `${position.y}%` }}
                    onClick={() => {
                      setSelectedLocation(countryLocations[0]);
                      onLocationSelect(countryLocations[0]);
                    }}
                  >
                    {/* Risk Circle */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all duration-200 group-hover:scale-125 ${getRiskColorClass(avgRiskScore)}`}
                      style={{
                        backgroundColor: getRiskColorHex(avgRiskScore) + '40',
                        borderColor: getRiskColorHex(avgRiskScore),
                      }}
                    >
                      <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: getRiskColorHex(avgRiskScore) }}></div>
                    </div>

                    {/* Facility Count Badge */}
                    {totalFacilities > 1 && (
                      <div className="absolute -top-2 -right-2 bg-slate-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border border-slate-600">
                        {totalFacilities}
                      </div>
                    )}

                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-600 whitespace-nowrap">
                        <div className="font-semibold">{countryLocations[0].full_country_name}</div>
                        <div className="text-slate-300">
                          {totalFacilities} {totalFacilities === 1 ? 'facility' : 'facilities'}
                        </div>
                        <div className="text-slate-300">
                          Risk Score: {avgRiskScore.toFixed(1)}/10
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-600">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Risk Score Legend
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-xs text-slate-300">Low Risk (8-10)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-xs text-slate-300">Medium Risk (6-7)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                <span className="text-xs text-slate-300">High Risk (4-5)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-xs text-slate-300">Critical Risk (0-3)</span>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm rounde-lg p-4 border border-slate-600">
            <div className="text-white">
              <div className="text-sm font-semibold mb-2">Global Overview</div>
              <div className="text-xs text-slate-300 space-y-1">
                <div>Total Locations: {filteredLocations.length}</div>
                <div>Countries: {Object.keys(locationsByCountry).length}</div>
                <div>High Risk: {filteredLocations.filter(l => l.risk_score <= 3).length}</div>
                <div>Sanctioned: {filteredLocations.filter(l => l.ofac_sanctioned).length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
