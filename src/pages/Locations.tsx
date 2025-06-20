
import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useCSVData } from '@/hooks/useCSVData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Search, AlertTriangle, Shield } from 'lucide-react';

const Locations = () => {
  const { locations, ndcLocationLinks, loading, error } = useCSVData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'risk' | 'name' | 'country' | 'ndcs'>('risk');

  const enrichedLocations = useMemo(() => {
    return locations.map(location => {
      const locationNDCs = ndcLocationLinks.filter(link => link.location_id === location.location_id);
      
      return {
        ...location,
        ndcCount: locationNDCs.length
      };
    });
  }, [locations, ndcLocationLinks]);

  const filteredAndSortedLocations = useMemo(() => {
    let filtered = enrichedLocations.filter(location => {
      return location.firm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             location.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
             location.full_country_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             location.address.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'risk':
          return (a.risk_score || 0) - (b.risk_score || 0);
        case 'name':
          return a.firm_name.localeCompare(b.firm_name);
        case 'country':
          return (a.full_country_name || a.country).localeCompare(b.full_country_name || b.country);
        case 'ndcs':
          return b.ndcCount - a.ndcCount;
        default:
          return 0;
      }
    });
  }, [enrichedLocations, searchTerm, sortBy]);

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 8) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (riskScore >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (riskScore >= 4) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore >= 8) return 'Low Risk';
    if (riskScore >= 6) return 'Medium Risk';
    if (riskScore >= 4) return 'High Risk';
    return 'Critical Risk';
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
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
            <h1 className="text-3xl font-bold text-slate-900">Manufacturing Locations</h1>
            <p className="text-slate-600 mt-2">Global pharmaceutical manufacturing sites and risk assessment</p>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by firm name, country, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Sort by:</span>
              <div className="flex gap-2">
                {[
                  { key: 'risk', label: 'Risk Score' },
                  { key: 'name', label: 'Firm Name' },
                  { key: 'country', label: 'Country' },
                  { key: 'ndcs', label: 'NDC Count' }
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
          Showing {filteredAndSortedLocations.length} of {enrichedLocations.length} locations
        </div>

        {/* Location List */}
        <div className="space-y-4">
          {filteredAndSortedLocations.map((location) => (
            <Card key={location.location_id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900">{location.firm_name}</h3>
                    <span className={`px-3 py-1 rounded-md font-medium border text-sm ${getRiskColor(location.risk_score || 0)}`}>
                      {getRiskLabel(location.risk_score || 0)} ({(location.risk_score || 0).toFixed(1)})
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-slate-600">{location.address}</p>
                    <p className="text-sm text-slate-500">
                      {location.full_country_name || location.country}
                      {location.state_or_region && `, ${location.state_or_region}`}
                      {location.postal_code && ` ${location.postal_code}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {location.taa_compliant && (
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        <Shield className="w-3 h-3 mr-1" />
                        TAA Compliant
                      </Badge>
                    )}
                    {location.is_five_eyes && (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        Five Eyes
                      </Badge>
                    )}
                    {location.is_nato && (
                      <Badge variant="outline" className="text-purple-600 border-purple-200">
                        NATO
                      </Badge>
                    )}
                    {location.ofac_sanctioned && (
                      <Badge variant="destructive">
                        OFAC Sanctioned
                      </Badge>
                    )}
                    {location.quality_risk_flag && (
                      <Badge variant="destructive">
                        Quality Risk
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-slate-600">
                    <span>{location.ndcCount} NDCs Manufactured</span>
                    {location.oai_count > 0 && (
                      <span className="text-red-600 font-medium">
                        {location.oai_count} OAI Inspections
                      </span>
                    )}
                    {location.duns_number && (
                      <span>DUNS: {location.duns_number}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAndSortedLocations.length === 0 && (
          <Card className="p-8 text-center">
            <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No locations found</h3>
            <p className="text-slate-600">Try adjusting your search terms</p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Locations;
