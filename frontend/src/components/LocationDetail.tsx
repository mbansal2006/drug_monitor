import React, { useState, useEffect } from 'react';
import { X, MapPin, ChevronDown, ChevronRight, Pill, Building2, FileText, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface LocationDetailProps {
  location: any;
  onClose: () => void;
  onEntitySelect?: (entity: any, type: string) => void;
}

interface Drug {
  id: number;
  drug_name: string;
  fda_essential?: boolean;
  therapeutic_categories?: string;
  shortage_start?: string;
  shortage_end?: string;
}

interface Manufacturer {
  id: number;
  manufacturer_name: string;
}

interface NDC {
  id: number;
  ndc_code: string;
  proprietary_name: string;
  drug_dosage?: string;
  drug_strength?: string;
  manufacturer_name: string;
  drug_id: number;
  manufacturer_id: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const LocationDetail: React.FC<LocationDetailProps> = ({
  location,
  onClose,
  onEntitySelect
}) => {
  const [locationData, setLocationData] = useState<{
    drugs: Drug[];
    ndcs: NDC[];
    manufacturers: Manufacturer[];
  }>({ drugs: [], ndcs: [], manufacturers: [] });
  const [loading, setLoading] = useState(true);
  const [openDrugs, setOpenDrugs] = useState<Set<number>>(new Set());
  const [openManufacturers, setOpenManufacturers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLocationData();
  }, [location.id]);

  const fetchLocationData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/locations/${location.id}/ndc_summary`);
      if (!res.ok) throw new Error("Failed to fetch location manufacturing data");
      const { drugs, ndcs, manufacturers } = await res.json();
      setLocationData({ drugs, ndcs, manufacturers });
    } catch (error) {
      console.error('Error fetching location data:', error);
      setLocationData({ drugs: [], ndcs: [], manufacturers: [] });
    } finally {
      setLoading(false);
    }
  };

  const toggleDrug = (drugId: number) => {
    const newOpenDrugs = new Set(openDrugs);
    if (newOpenDrugs.has(drugId)) {
      newOpenDrugs.delete(drugId);
    } else {
      newOpenDrugs.add(drugId);
    }
    setOpenDrugs(newOpenDrugs);
  };

  const toggleManufacturer = (drugId: number, manufacturerId: number) => {
    const key = `${drugId}-${manufacturerId}`;
    const newOpenManufacturers = new Set(openManufacturers);
    if (newOpenManufacturers.has(key)) {
      newOpenManufacturers.delete(key);
    } else {
      newOpenManufacturers.add(key);
    }
    setOpenManufacturers(newOpenManufacturers);
  };

  const getDrugManufacturers = (drugId: number) => {
    const drugNdcs = locationData.ndcs.filter(ndc => ndc.drug_id === drugId);
    const manufacturerIds = [...new Set(drugNdcs.map(ndc => ndc.manufacturer_id))];
    return locationData.manufacturers.filter(manufacturer => manufacturerIds.includes(manufacturer.id));
  };

  const getDrugManufacturerNdcs = (drugId: number, manufacturerId: number) => {
    return locationData.ndcs.filter(ndc => ndc.drug_id === drugId && ndc.manufacturer_id === manufacturerId);
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 8) return { color: 'bg-emerald-900 text-emerald-300', label: 'Low Risk' };
    if (riskScore >= 6) return { color: 'bg-yellow-900 text-yellow-300', label: 'Medium Risk' };
    if (riskScore >= 4) return { color: 'bg-orange-900 text-orange-300', label: 'High Risk' };
    return { color: 'bg-red-900 text-red-300', label: 'Critical Risk' };
  };

  return (
    <div className="h-full bg-slate-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Manufacturing Site</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Location Info */}
        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">{location.full_country_name}</h3>
            <p className="text-slate-400">{location.address}</p>
            <div className="mt-3">
              {(() => {
                const badge = getRiskBadge(location.risk_score);
                return (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                    Reliability Score: {location.risk_score}/10 ({badge.label})
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Drugs Section */}
        <div>
          <h4 className="text-lg font-medium text-white mb-4 flex items-center">
            <Pill className="h-5 w-5 mr-2 text-green-400" />
            Drugs Manufactured Here ({locationData.drugs.length})
          </h4>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              <span className="ml-2 text-slate-400">Loading manufacturing data...</span>
            </div>
          ) : locationData.drugs.length === 0 ? (
            <div className="text-slate-400 text-center py-8">
              No manufacturing data available for this location
            </div>
          ) : (
            <div className="space-y-3">
              {locationData.drugs.map((drug) => (
                <Collapsible key={drug.id} open={openDrugs.has(drug.id)} onOpenChange={() => toggleDrug(drug.id)}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <Pill className="h-4 w-4 text-green-400" />
                      <div className="text-left">
                        <div className="text-white font-medium">{drug.drug_name}</div>
                        {drug.therapeutic_categories && (
                          <div className="text-slate-400 text-sm">{drug.therapeutic_categories}</div>
                        )}
                      </div>
                    </div>
                    {openDrugs.has(drug.id) ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </CollapsibleTrigger>

                  <CollapsibleContent className="px-3 pb-3">
                    <div className="ml-4 space-y-2">
                      {getDrugManufacturers(drug.id).map((manufacturer) => (
                        <Collapsible
                          key={`${drug.id}-${manufacturer.id}`}
                          open={openManufacturers.has(`${drug.id}-${manufacturer.id}`)}
                          onOpenChange={() => toggleManufacturer(drug.id, manufacturer.id)}
                        >
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-slate-600 hover:bg-slate-500 rounded transition-colors">
                            <div className="flex items-center space-x-2">
                              <Building2 className="h-4 w-4 text-purple-400" />
                              <span className="text-white text-sm">{manufacturer.manufacturer_name}</span>
                            </div>
                            {openManufacturers.has(`${drug.id}-${manufacturer.id}`) ? (
                              <ChevronDown className="h-3 w-3 text-slate-400" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-slate-400" />
                            )}
                          </CollapsibleTrigger>

                          <CollapsibleContent className="px-2 pb-2">
                            <div className="ml-4 space-y-1">
                              {getDrugManufacturerNdcs(drug.id, manufacturer.id).map((ndc) => (
                                <div
                                  key={ndc.id}
                                  className="flex items-center space-x-2 p-2 bg-slate-500 rounded cursor-pointer hover:bg-slate-400 transition-colors"
                                  onClick={() => onEntitySelect?.(ndc, 'ndc')}
                                >
                                  <FileText className="h-3 w-3 text-orange-400" />
                                  <div className="flex-1">
                                    <div className="text-white text-xs font-medium">{ndc.proprietary_name}</div>
                                    <div className="text-slate-300 text-xs">NDC: {ndc.ndc_code}</div>
                                    {ndc.drug_strength && (
                                      <div className="text-slate-400 text-xs">{ndc.drug_strength}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDetail;