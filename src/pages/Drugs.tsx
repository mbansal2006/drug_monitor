
import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useCSVData } from '@/hooks/useCSVData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Shield, Search, Filter } from 'lucide-react';

const Drugs = () => {
  const { drugs, ndcs, locations, ndcLocationLinks, loading, error } = useCSVData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'shortage' | 'essential'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'risk' | 'essential' | 'shortage'>('name');

  const enrichedDrugs = useMemo(() => {
    return drugs.map(drug => {
      const drugNDCs = ndcs.filter(ndc => ndc.drug_id === drug.drug_id);
      
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

  const filteredAndSortedDrugs = useMemo(() => {
    let filtered = enrichedDrugs.filter(drug => {
      // Add null checks for drug properties
      const drugName = drug.drug_name || '';
      const therapeuticCategories = drug.therapeutic_categories || '';
      
      const matchesSearch = drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           therapeuticCategories.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      switch (filterStatus) {
        case 'shortage':
          return drug.shortage_status === 'Currently in Shortage';
        case 'essential':
          return drug.fda_essential === 1;
        default:
          return true;
      }
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'risk':
          return a.avgRiskScore - b.avgRiskScore;
        case 'essential':
          return (b.fda_essential || 0) - (a.fda_essential || 0);
        case 'shortage':
          return (a.shortage_status === 'Currently in Shortage' ? -1 : 1) - 
                 (b.shortage_status === 'Currently in Shortage' ? -1 : 1);
        default:
          return (a.drug_name || '').localeCompare(b.drug_name || '');
      }
    });
  }, [enrichedDrugs, searchTerm, filterStatus, sortBy]);

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
            <h1 className="text-3xl font-bold text-slate-900">Drug Analysis</h1>
            <p className="text-slate-600 mt-2">Comprehensive view of tracked pharmaceutical products and their risk profiles</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search drugs by name or therapeutic category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All Drugs
              </Button>
              <Button
                variant={filterStatus === 'shortage' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('shortage')}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                In Shortage
              </Button>
              <Button
                variant={filterStatus === 'essential' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('essential')}
              >
                <Shield className="w-4 h-4 mr-1" />
                Essential
              </Button>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">Sort by:</span>
            <div className="flex gap-2">
              {[
                { key: 'name', label: 'Name' },
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

        {/* Results Count */}
        <div className="text-sm text-slate-600">
          Showing {filteredAndSortedDrugs.length} of {enrichedDrugs.length} drugs
        </div>

        {/* Drug List */}
        <div className="space-y-4">
          {filteredAndSortedDrugs.map((drug) => (
            <Card key={drug.drug_id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-900">{drug.drug_name || 'Unknown Drug'}</h3>
                    {drug.fda_essential === 1 && (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
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
                  
                  <div className="flex items-center space-x-6 text-sm text-slate-600 mb-3">
                    <span className={`px-3 py-1 rounded-md font-medium border ${getRiskColor(drug.avgRiskScore)}`}>
                      Risk: {drug.avgRiskScore.toFixed(1)}
                    </span>
                    <span>{drug.ndcCount} NDCs</span>
                    <span>{drug.locationCount} Manufacturing Sites</span>
                  </div>

                  {drug.therapeutic_categories && (
                    <div className="mb-3">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {drug.therapeutic_categories}
                      </span>
                    </div>
                  )}

                  {drug.shortage_start && (
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">Shortage Start:</span> {drug.shortage_start}
                      {drug.reason && <span className="ml-4"><span className="font-medium">Reason:</span> {drug.reason}</span>}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAndSortedDrugs.length === 0 && (
          <Card className="p-8 text-center">
            <Filter className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No drugs found</h3>
            <p className="text-slate-600">Try adjusting your search terms or filters</p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Drugs;
