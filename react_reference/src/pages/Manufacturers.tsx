import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useCSVData } from '@/hooks/useCSVData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Search, AlertTriangle, MapPin } from 'lucide-react';

const Manufacturers = () => {
  const { manufacturers, ndcs, locations, ndcLocationLinks, loading, error } = useCSVData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'ndcs' | 'locations' | 'risk'>('name');

  const enrichedManufacturers = useMemo(() => {
    return manufacturers.map(manufacturer => {
      const manufacturerNDCs = ndcs.filter(ndc => {
        // Add null checks for ndc.manufacturer_name
        const ndcManufacturerName = ndc.manufacturer_name || '';
        const manufacturerName = manufacturer.manufacturer_name || '';
        return ndcManufacturerName.toLowerCase() === manufacturerName.toLowerCase();
      });
      
      const locationIds = new Set();
      let totalRisk = 0;
      let riskCount = 0;
      
      manufacturerNDCs.forEach(ndc => {
        const ndcLinks = ndcLocationLinks.filter(link => link.ndc_id === ndc.ndc_id);
        ndcLinks.forEach(link => {
          locationIds.add(link.location_id);
          const location = locations.find(loc => loc.location_id === link.location_id);
          if (location && location.risk_score !== undefined) {
            totalRisk += location.risk_score;
            riskCount++;
          }
        });
      });

      const avgRiskScore = riskCount > 0 ? totalRisk / riskCount : 5;
      
      return {
        ...manufacturer,
        ndcCount: manufacturerNDCs.length,
        locationCount: locationIds.size,
        avgRiskScore,
        relatedNDCs: manufacturerNDCs
      };
    });
  }, [manufacturers, ndcs, locations, ndcLocationLinks]);

  const filteredAndSortedManufacturers = useMemo(() => {
    let filtered = enrichedManufacturers.filter(manufacturer => {
      const manufacturerName = manufacturer.manufacturer_name || '';
      return manufacturerName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const nameA = a.manufacturer_name || '';
          const nameB = b.manufacturer_name || '';
          return nameA.localeCompare(nameB);
        case 'ndcs':
          return b.ndcCount - a.ndcCount;
        case 'locations':
          return b.locationCount - a.locationCount;
        case 'risk':
          return a.avgRiskScore - b.avgRiskScore;
        default:
          return 0;
      }
    });
  }, [enrichedManufacturers, searchTerm, sortBy]);

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 8) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (riskScore >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (riskScore >= 4) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Card className="p-8 text-center bg-red-50 border-red-200">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Data</h2>
          <p className="text-slate-600">{error}</p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manufacturers</h1>
            <p className="text-slate-600 mt-2">Pharmaceutical manufacturers and their production profiles</p>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search manufacturers by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Sort by:</span>
              <div className="flex gap-2">
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'ndcs', label: 'NDC Count' },
                  { key: 'locations', label: 'Locations' },
                  { key: 'risk', label: 'Risk Score' }
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
        </div>

        {/* Results Count */}
        <div className="text-sm text-slate-600">
          Showing {filteredAndSortedManufacturers.length} of {enrichedManufacturers.length} manufacturers
        </div>

        {/* Manufacturer List */}
        <div className="space-y-4">
          {filteredAndSortedManufacturers.map((manufacturer, index) => (
            <Card key={`${manufacturer.manufacturer_name}-${index}`} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900">{manufacturer.manufacturer_name || 'Unknown Manufacturer'}</h3>
                    {manufacturer.avgRiskScore !== 5 && (
                      <span className={`px-3 py-1 rounded-md font-medium border text-sm ${getRiskColor(manufacturer.avgRiskScore)}`}>
                        Risk: {manufacturer.avgRiskScore.toFixed(1)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-slate-600 mb-4">
                    <span className="flex items-center">
                      <span className="font-medium text-slate-900">{manufacturer.ndcCount}</span>
                      <span className="ml-1">NDCs Produced</span>
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="font-medium text-slate-900">{manufacturer.locationCount}</span>
                      <span className="ml-1">Manufacturing Sites</span>
                    </span>
                  </div>

                  {manufacturer.relatedNDCs.length > 0 && (
                    <div className="text-sm text-slate-600">
                      <p className="font-medium mb-2">Recent NDCs:</p>
                      <div className="space-y-1">
                        {manufacturer.relatedNDCs.slice(0, 3).map((ndc) => (
                          <div key={ndc.ndc_id} className="bg-slate-50 p-2 rounded text-xs">
                            <span className="font-medium">{ndc.proprietary_name || 'Unknown Drug'}</span>
                            <span className="text-slate-500 ml-2">NDC: {ndc.ndc_code || 'N/A'}</span>
                          </div>
                        ))}
                        {manufacturer.relatedNDCs.length > 3 && (
                          <p className="text-xs text-slate-500 mt-1">
                            +{manufacturer.relatedNDCs.length - 3} more NDCs
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAndSortedManufacturers.length === 0 && (
          <Card className="p-8 text-center">
            <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No manufacturers found</h3>
            <p className="text-slate-600">Try adjusting your search terms</p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Manufacturers;
