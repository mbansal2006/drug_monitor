
import React, { useMemo } from 'react';
import { Location, NDCLocationLink } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GlobalRiskHeatmapProps {
  locations: Location[];
  ndcLocationLinks: NDCLocationLink[];
}

const GlobalRiskHeatmap: React.FC<GlobalRiskHeatmapProps> = ({ locations, ndcLocationLinks }) => {
  const countryData = useMemo(() => {
    const countryMap = new Map();
    
    locations.forEach(location => {
      const country = location.full_country_name || location.country;
      if (!countryMap.has(country)) {
        countryMap.set(country, {
          country,
          locations: [],
          totalRiskScore: 0,
          oaiCount: 0,
          ndcCount: 0
        });
      }
      
      const data = countryMap.get(country);
      data.locations.push(location);
      data.totalRiskScore += location.risk_score || 0;
      data.oaiCount += location.oai_count || 0;
    });

    // Calculate NDC counts per country
    ndcLocationLinks.forEach(link => {
      const location = locations.find(l => l.location_id === link.location_id);
      if (location) {
        const country = location.full_country_name || location.country;
        const data = countryMap.get(country);
        if (data) {
          data.ndcCount++;
        }
      }
    });

    return Array.from(countryMap.values())
      .map(data => ({
        ...data,
        avgRiskScore: data.totalRiskScore / data.locations.length,
        locationCount: data.locations.length
      }))
      .sort((a, b) => a.avgRiskScore - b.avgRiskScore);
  }, [locations, ndcLocationLinks]);

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 8) return 'bg-emerald-500';
    if (riskScore >= 6) return 'bg-yellow-500';
    if (riskScore >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore >= 8) return 'Low Risk';
    if (riskScore >= 6) return 'Medium Risk';
    if (riskScore >= 4) return 'High Risk';
    return 'Critical Risk';
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Global Risk Heatmap</h2>
        <p className="text-slate-600">Manufacturing risk assessment by country (0 = highest risk, 10 = lowest risk)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {countryData.map((country) => (
          <div
            key={country.country}
            className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 truncate">{country.country}</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getRiskColor(country.avgRiskScore)}`} />
                <span className="text-sm font-medium text-slate-700">
                  {country.avgRiskScore.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Badge variant="outline" className="text-xs">
                {getRiskLabel(country.avgRiskScore)}
              </Badge>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                <div>
                  <span className="font-medium">{country.locationCount}</span>
                  <p className="text-xs">Manufacturing Sites</p>
                </div>
                <div>
                  <span className="font-medium">{country.ndcCount}</span>
                  <p className="text-xs">NDCs Produced</p>
                </div>
              </div>

              {country.oaiCount > 0 && (
                <div className="text-xs text-red-600 font-medium">
                  {country.oaiCount} OAI Inspections
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default GlobalRiskHeatmap;
