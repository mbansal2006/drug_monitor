import React, { useState } from 'react';
import { Building2, MapPin, Pill, FileText } from 'lucide-react';

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
  entityType: initialEntityType,
  setEntityType: externalSetEntityType,
  locations,
  drugs,
  manufacturers,
  ndcs,
  filters,
  searchQuery,
  onEntitySelect,
  getRiskColor,
}) => {
  const [entityType, setEntityType] = useState(initialEntityType);

  let entities: any[] = [];

  switch (entityType) {
    case 'drug':
      entities = drugs;
      break;
    case 'manufacturer':
      entities = manufacturers;
      break;
    case 'ndc':
      entities = ndcs;
      break;
    case 'location':
    default:
      entities = locations;
  }

  if (searchQuery.query) {
    const query = searchQuery.query.toLowerCase();
    entities = entities.filter((entity) =>
      Object.values(entity).some(
        (value) => typeof value === 'string' && value.toLowerCase().includes(query)
      )
    );
  }

  const renderIcon = (type: string) => {
    switch (type) {
      case 'drug':
        return <Pill className="w-4 h-4 mr-1 inline" />;
      case 'manufacturer':
        return <Building2 className="w-4 h-4 mr-1 inline" />;
      case 'ndc':
        return <FileText className="w-4 h-4 mr-1 inline" />;
      case 'location':
      default:
        return <MapPin className="w-4 h-4 mr-1 inline" />;
    }
  };

  const handleTypeClick = (type: 'drug' | 'location' | 'manufacturer' | 'ndc') => {
    setEntityType(type);
    externalSetEntityType(type); // for parent if needed
  };

  return (
    <div className="p-4 overflow-y-auto max-h-full">
      <div className="flex space-x-2 mb-4">
        {['location', 'drug', 'manufacturer', 'ndc'].map((type) => (
          <button
            key={type}
            onClick={() => handleTypeClick(type as any)}
            className={`px-3 py-1 rounded text-sm border ${
              entityType === type
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-slate-600 text-slate-300 hover:border-slate-400'
            }`}
          >
            {renderIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}s
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities.map((entity, idx) => (
          <div
            key={idx}
            className="bg-slate-800 rounded-lg p-4 shadow hover:bg-slate-700 cursor-pointer"
            onClick={() => onEntitySelect(entity, entityType)}
          >
            {entityType === 'location' && (
              <>
                <div className="text-lg font-semibold">{entity.firm_name || entity.address}</div>
                <div className="text-sm text-slate-400">{entity.country}</div>
                <div
                  className={`mt-2 text-xs px-2 py-1 inline-block rounded ${getRiskColor(
                    entity.risk_score
                  )}`}
                >
                  Reliability: {entity.risk_score}
                </div>
              </>
            )}
            {entityType === 'drug' && (
              <>
                <div className="text-lg font-semibold">{entity.drug_name}</div>
                <div className="text-sm text-slate-400">{entity.therapeutic_categories}</div>
                {entity.shortage_start && (
                  <div className="mt-2 text-xs px-2 py-1 inline-block rounded bg-red-500">
                    In Shortage
                  </div>
                )}
              </>
            )}
            {entityType === 'manufacturer' && (
              <>
                <div className="text-lg font-semibold">{entity.manufacturer_name}</div>
              </>
            )}
            {entityType === 'ndc' && (
              <>
                <div className="text-lg font-semibold">{entity.proprietary_name}</div>
                <div className="text-sm text-slate-400">{entity.ndc_code}</div>
                <div className="text-sm text-slate-400">
                  {entity.drug_dosage} - {entity.drug_strength}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EntityGrid;