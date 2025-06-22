import React, { useState } from 'react';
import { Building2, MapPin, Pill, FileText, ChevronDown, Filter, ArrowUpDown } from 'lucide-react';

interface EntityGridProps {
  entityType: 'drug' | 'location' | 'manufacturer' | 'ndc';
  setEntityType: (type: 'drug' | 'location' | 'manufacturer' | 'ndc') => void;
  locations: any[];
  drugs: any[];
  manufacturers: any[];
  ndcs: any[];
  filters: any;
  searchQuery: { query: string; type: string };
  onEntitySelect: (entity: any, type: string) => void;
  getRiskColor: (riskScore: number) => string;
}

const EntityGrid: React.FC<EntityGridProps> = ({
  entityType,
  setEntityType,
  locations,
  drugs,
  manufacturers,
  ndcs,
  filters,
  searchQuery,
  onEntitySelect,
  getRiskColor
}) => {
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const query = (searchQuery?.query || '').toLowerCase();
  const queryType = searchQuery?.type || 'location';

  const entityTypes = [
    { key: 'location', label: 'Locations', icon: MapPin, data: locations },
    { key: 'drug', label: 'Drugs', icon: Pill, data: drugs },
    { key: 'manufacturer', label: 'Manufacturers', icon: Building2, data: manufacturers },
    { key: 'ndc', label: 'NDCs', icon: FileText, data: ndcs },
  ];

  const currentData = entityTypes.find(type => type.key === entityType)?.data || [];

  const filteredData = currentData.filter(item => {
    if (query) {
      switch (queryType) {
        case 'drug':
          return item.drug_name?.toLowerCase().includes(query) ||
                 item.therapeutic_categories?.toLowerCase().includes(query);
        case 'location':
          return item.country?.toLowerCase().includes(query) ||
                 item.full_country_name?.toLowerCase().includes(query) ||
                 item.address?.toLowerCase().includes(query);
        case 'manufacturer':
          return item.manufacturer_name?.toLowerCase().includes(query);
        case 'ndc':
          return item.ndc_code?.toLowerCase().includes(query) ||
                 item.proprietary_name?.toLowerCase().includes(query);
        default:
          return true;
      }
    }

    if (entityType === 'location') {
      if (filters.country && item.country !== filters.country) return false;
      if (item.risk_score < filters.riskScore[0] || item.risk_score > filters.riskScore[1]) return false;
      if (filters.sanctions && !item.ofac_sanctioned) return false;
    }

    return true;
  });

  console.log(filteredData, entityType, queryType, query);

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;

    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const renderLocationRow = (location: any) => (
    <tr
      key={location.id}
      onClick={() => onEntitySelect(location, 'location')}
      className="hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-700"
    >
      <td className="px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${getRiskColor(location.risk_score)}`}></div>
          <div>
            <div className="font-medium text-white">{location.full_country_name}</div>
            <div className="text-sm text-slate-400">{location.country}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-300">{location.address}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          location.risk_score >= 8 ? 'bg-emerald-900 text-emerald-300' :
          location.risk_score >= 6 ? 'bg-yellow-900 text-yellow-300' :
          location.risk_score >= 4 ? 'bg-orange-900 text-orange-300' :
          'bg-red-900 text-red-300'
        }`}>
          {location.risk_score}/10
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex space-x-1">
          {location.is_nato && <span className="px-1 py-0.5 bg-blue-900 text-blue-300 rounded text-xs">NATO</span>}
          {location.is_five_eyes && <span className="px-1 py-0.5 bg-purple-900 text-purple-300 rounded text-xs">5Eyes</span>}
          {location.ofac_sanctioned && <span className="px-1 py-0.5 bg-red-900 text-red-300 rounded text-xs">Sanctioned</span>}
        </div>
      </td>
    </tr>
  );

  const renderDrugRow = (drug: any) => (
    <tr
      key={drug.id}
      onClick={() => onEntitySelect(drug, 'drug')}
      className="hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-700"
    >
      <td className="px-4 py-3">
        <div className="font-medium text-white">{drug.drug_name}</div>
        {drug.therapeutic_categories && (
          <div className="text-sm text-slate-400">{drug.therapeutic_categories}</div>
        )}
      </td>
      <td className="px-4 py-3">
        {drug.fda_essential ? (
          <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded-full text-xs">Essential</span>
        ) : (
          <span className="text-slate-500">-</span>
        )}
      </td>
      <td className="px-4 py-3">
        {drug.shortage_start && !drug.shortage_end ? (
          <span className="px-2 py-1 bg-red-900 text-red-300 rounded-full text-xs">Active</span>
        ) : drug.shortage_end ? (
          <span className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs">Resolved</span>
        ) : (
          <span className="text-slate-500">None</span>
        )}
      </td>
      <td className="px-4 py-3 text-slate-300">
        {drug.shortage_start || '-'}
      </td>
    </tr>
  );

  const renderManufacturerRow = (manufacturer: any) => (
    <tr
      key={manufacturer.id}
      onClick={() => onEntitySelect(manufacturer, 'manufacturer')}
      className="hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-700"
    >
      <td className="px-4 py-3">
        <div className="font-medium text-white">{manufacturer.manufacturer_name}</div>
      </td>
      <td className="px-4 py-3 text-slate-300">-</td>
      <td className="px-4 py-3 text-slate-300">-</td>
      <td className="px-4 py-3 text-slate-300">-</td>
    </tr>
  );

  const renderNDCRow = (ndc: any) => (
    <tr
      key={ndc.id}
      onClick={() => onEntitySelect(ndc, 'ndc')}
      className="hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-700"
    >
      <td className="px-4 py-3">
        <div className="font-medium text-white">{ndc.ndc_code}</div>
        <div className="text-sm text-slate-400">{ndc.proprietary_name}</div>
      </td>
      <td className="px-4 py-3 text-slate-300">{ndc.manufacturer_name}</td>
      <td className="px-4 py-3 text-slate-300">{ndc.drug_dosage}</td>
      <td className="px-4 py-3 text-slate-300">{ndc.drug_strength}</td>
    </tr>
  );

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Data Explorer</h2>
          <div className="text-sm text-slate-400">
            {sortedData.length} results
          </div>
        </div>
        
        {/* Entity Type Tabs */}
        <div className="flex space-x-1 bg-slate-700 rounded-lg p-1">
          {entityTypes.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setEntityType(key as any)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                entityType === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-600'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-slate-800 sticky top-0">
            <tr>
              {entityType === 'location' && (
                <>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('full_country_name')}
                      className="flex items-center text-slate-300 hover:text-white"
                    >
                      Country <ArrowUpDown className="h-3 w-3 ml-1" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-slate-300">Address</th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('risk_score')}
                      className="flex items-center text-slate-300 hover:text-white"
                    >
                      Risk Score <ArrowUpDown className="h-3 w-3 ml-1" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-slate-300">Flags</th>
                </>
              )}
              {entityType === 'drug' && (
                <>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('drug_name')}
                      className="flex items-center text-slate-300 hover:text-white"
                    >
                      Drug Name <ArrowUpDown className="h-3 w-3 ml-1" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-slate-300">Essential</th>
                  <th className="px-4 py-3 text-left text-slate-300">Shortage Status</th>
                  <th className="px-4 py-3 text-left text-slate-300">Start Date</th>
                </>
              )}
              {entityType === 'manufacturer' && (
                <>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('manufacturer_name')}
                      className="flex items-center text-slate-300 hover:text-white"
                    >
                      Manufacturer <ArrowUpDown className="h-3 w-3 ml-1" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-slate-300">Products</th>
                  <th className="px-4 py-3 text-left text-slate-300">Risk Level</th>
                  <th className="px-4 py-3 text-left text-slate-300">Locations</th>
                </>
              )}
              {entityType === 'ndc' && (
                <>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('ndc_code')}
                      className="flex items-center text-slate-300 hover:text-white"
                    >
                      NDC Code <ArrowUpDown className="h-3 w-3 ml-1" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-slate-300">Manufacturer</th>
                  <th className="px-4 py-3 text-left text-slate-300">Dosage</th>
                  <th className="px-4 py-3 text-left text-slate-300">Strength</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(item => {
              switch (entityType) {
                case 'location':
                  return renderLocationRow(item);
                case 'drug':
                  return renderDrugRow(item);
                case 'manufacturer':
                  return renderManufacturerRow(item);
                case 'ndc':
                  return renderNDCRow(item);
                default:
                  return null;
              }
            })}
            {paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-4 text-center text-slate-400"
                >
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-slate-800 border-t border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
  );
};

export default EntityGrid;
