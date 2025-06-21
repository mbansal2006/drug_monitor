
import React, { useState, useMemo } from 'react';
import { Drug, NDC, Location, NDCLocationLink } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, AlertTriangle, Shield } from 'lucide-react';

interface DrugExplorerProps {
  drugs: Drug[];
  ndcs: NDC[];
  locations: Location[];
  ndcLocationLinks: NDCLocationLink[];
}

const DrugExplorer: React.FC<DrugExplorerProps> = ({ drugs, ndcs, locations, ndcLocationLinks }) => {
  const [sortBy, setSortBy] = useState<'risk' | 'essential' | 'shortage'>('risk');
  const [expandedDrug, setExpandedDrug] = useState<string | null>(null);

  const enrichedDrugs = useMemo(() => {
    return drugs.map(drug => {
      const drugNDCs = ndcs.filter(ndc => ndc.drug_id === drug.drug_id);
      
      // Calculate risk score based on manufacturing locations
      let totalRisk = 0;
      let locationCount = 0;
      
      drugNDCs.forEach(ndc => {
        const ndcLinks = ndcLocationLinks.filter(link => link.ndc_id === ndc.ndc_id);
        ndcLinks.forEach(link => {
          const location = locations.find(loc => loc.location_id === link.location_id);
          if (location && location.risk_score !== undefined) {
            totalRisk += location.risk_score;
            locationCount++;
          }
        });
      });

      const avgRiskScore = locationCount > 0 ? totalRisk / locationCount : 5;
      
      return {
        ...drug,
        ndcCount: drugNDCs.length,
        avgRiskScore,
        locationCount,
        relatedNDCs: drugNDCs
      };
    });
  }, [drugs, ndcs, locations, ndcLocationLinks]);

  const sortedDrugs = useMemo(() => {
    return [...enrichedDrugs].sort((a, b) => {
      switch (sortBy) {
        case 'risk':
          return a.avgRiskScore - b.avgRiskScore;
        case 'essential':
          return (b.fda_essential || 0) - (a.fda_essential || 0);
        case 'shortage':
          return (a.shortage_status === 'Currently in Shortage' ? -1 : 1) - 
                 (b.shortage_status === 'Currently in Shortage' ? -1 : 1);
        default:
          return 0;
      }
    });
  }, [enrichedDrugs, sortBy]);

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 8) return 'text-emerald-600 bg-emerald-50';
    if (riskScore >= 6) return 'text-yellow-600 bg-yellow-50';
    if (riskScore >= 4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Drug Explorer</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-600">Sort by:</span>
          <div className="flex space-x-2">
            {[
              { key: 'risk', label: 'Risk Score' },
              { key: 'essential', label: 'Essential Status' },
              { key: 'shortage', label: 'Shortage Status' }
            ].map(option => (
              <Button
                key={option.key}
                variant={sortBy === option.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option.key as any)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedDrugs.slice(0, 50).map((drug) => (
          <div key={drug.drug_id} className="border border-slate-200 rounded-lg overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedDrug(expandedDrug === drug.drug_id ? null : drug.drug_id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{drug.drug_name}</h3>
                    {drug.fda_essential === 1 && (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        <Shield className="w-3 h-3 mr-1" />
                        Essential
                      </Badge>
                    )}
                    {drug.shortage_status === 'Currently in Shortage' && (
                      <Badge variant="destructive">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        In Shortage
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-slate-600">
                    <span className={`px-2 py-1 rounded-md font-medium ${getRiskColor(drug.avgRiskScore)}`}>
                      Risk: {drug.avgRiskScore.toFixed(1)}
                    </span>
                    <span>{drug.ndcCount} NDCs</span>
                    <span>{drug.locationCount} Manufacturing Sites</span>
                    {drug.therapeutic_categories && (
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                        {drug.therapeutic_categories}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {expandedDrug === drug.drug_id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {expandedDrug === drug.drug_id && (
              <div className="border-t border-slate-200 p-4 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Drug Details</h4>
                    <div className="space-y-2 text-sm">
                      {drug.shortage_start && (
                        <p><span className="font-medium">Shortage Start:</span> {drug.shortage_start}</p>
                      )}
                      {drug.reason && (
                        <p><span className="font-medium">Shortage Reason:</span> {drug.reason}</p>
                      )}
                      {drug.update_date && (
                        <p><span className="font-medium">Last Update:</span> {drug.update_date}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Related NDCs</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {drug.relatedNDCs.slice(0, 10).map((ndc) => (
                        <div key={ndc.ndc_id} className="text-sm bg-white p-2 rounded border">
                          <p className="font-medium">{ndc.proprietary_name}</p>
                          <p className="text-slate-600">NDC: {ndc.ndc_code}</p>
                          <p className="text-xs text-slate-500">{ndc.manufacturer_name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default DrugExplorer;
