
import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronRight, Globe, Building2, Pill, FileText, Shield, AlertTriangle } from 'lucide-react';

interface SidebarProps {
  filters: any;
  onFilterChange: (filters: any) => void;
  locations: any[];
  drugs: any[];
  manufacturers: any[];
  ndcs: any[];
  onEntitySelect: (entity: any, type: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  filters,
  onFilterChange,
  locations,
  drugs,
  manufacturers,
  ndcs,
  onEntitySelect
}) => {
  const [expandedSections, setExpandedSections] = useState({
    filters: true,
    quickStats: true,
    riskAlerts: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const countries = [...new Set(locations.map(l => l.country))].sort();
  const highRiskLocations = locations.filter(l => l.risk_score <= 3);
  const sanctionedLocations = locations.filter(l => l.ofac_sanctioned);
  const shortagesCount = drugs.filter(d => d.shortage_start && !d.shortage_end).length;

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto">
      <div className="p-6">
        {/* Filters Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('filters')}
            className="flex items-center justify-between w-full text-left text-lg font-semibold text-white mb-3"
          >
            <div className="flex items-center">
              <Filter className="h-5 w-5 mr-2 text-blue-400" />
              Filters
            </div>
            {expandedSections.filters ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          
          {expandedSections.filters && (
            <div className="space-y-4">
              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Risk Score Range */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reliability Score: {filters.riskScore[0]} - {filters.riskScore[1]}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={filters.riskScore[0]}
                    onChange={(e) => handleFilterChange('riskScore', [parseInt(e.target.value), filters.riskScore[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={filters.riskScore[1]}
                    onChange={(e) => handleFilterChange('riskScore', [filters.riskScore[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Alliance Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Alliance Status</label>
                <select
                  value={filters.alliance}
                  onChange={(e) => handleFilterChange('alliance', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="">All</option>
                  <option value="nato">NATO</option>
                  <option value="five_eyes">Five Eyes</option>
                  <option value="oecd">OECD</option>
                  <option value="quad">QUAD</option>
                </select>
              </div>

              {/* Risk Flags */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.sanctions}
                    onChange={(e) => handleFilterChange('sanctions', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-300">OFAC Sanctioned</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.dumping}
                    onChange={(e) => handleFilterChange('dumping', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-slate-300">Engages in Dumping</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('quickStats')}
            className="flex items-center justify-between w-full text-left text-lg font-semibold text-white mb-3"
          >
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-green-400" />
              Quick Stats
            </div>
            {expandedSections.quickStats ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          
          {expandedSections.quickStats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">{locations.length}</div>
                <div className="text-xs text-slate-400">Locations</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">{drugs.length}</div>
                <div className="text-xs text-slate-400">Drugs</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-400">{manufacturers.length}</div>
                <div className="text-xs text-slate-400">Manufacturers</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-400">{shortagesCount}</div>
                <div className="text-xs text-slate-400">Active Shortages</div>
              </div>
            </div>
          )}
        </div>

        {/* Risk Alerts */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('riskAlerts')}
            className="flex items-center justify-between w-full text-left text-lg font-semibold text-white mb-3"
          >
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
              Risk Alerts
            </div>
            {expandedSections.riskAlerts ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          
          {expandedSections.riskAlerts && (
            <div className="space-y-2">
              <div 
                className="bg-red-900/30 border border-red-700 rounded-lg p-3 cursor-pointer hover:bg-red-900/40 transition-colors"
                onClick={() => console.log('Show high risk locations')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-300">High Risk Locations</span>
                  <span className="text-lg font-bold text-red-400">{highRiskLocations.length}</span>
                </div>
              </div>
              <div 
                className="bg-orange-900/30 border border-orange-700 rounded-lg p-3 cursor-pointer hover:bg-orange-900/40 transition-colors"
                onClick={() => console.log('Show sanctioned locations')}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-300">Sanctioned Nations</span>
                  <span className="text-lg font-bold text-orange-400">{sanctionedLocations.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
