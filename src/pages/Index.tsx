
import React from 'react';
import Layout from '@/components/Layout';
import GlobalRiskHeatmap from '@/components/GlobalRiskHeatmap';
import DrugExplorer from '@/components/DrugExplorer';
import { useCSVData } from '@/hooks/useCSVData';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TrendingUp, MapPin, Pill, FileText, Building2 } from 'lucide-react';

const Index = () => {
  const { locations, drugs, manufacturers, ndcs, ndcLocationLinks, loading, error } = useCSVData();

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div className="text-center">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-128 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Card className="p-8 text-center bg-red-50 border-red-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Data Loading Error</h2>
          <p className="text-slate-600">{error}</p>
        </Card>
      </Layout>
    );
  }

  // Calculate summary statistics
  const totalDrugs = drugs.length;
  const totalLocations = locations.length;
  const totalNDCs = ndcs.length;
  const totalManufacturers = manufacturers.length;
  const shortages = drugs.filter(d => d.shortage_status === 'Currently in Shortage').length;
  const avgRiskScore = locations.reduce((sum, loc) => sum + (loc.risk_score || 0), 0) / locations.length;
  const criticalRiskLocations = locations.filter(loc => (loc.risk_score || 0) < 4).length;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-12">
          <h1 className="text-4xl font-bold mb-4">Supply Chain Intelligence</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Comprehensive analysis of pharmaceutical manufacturing vulnerabilities and risk assessment
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="p-6 bg-white border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Pill className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalDrugs.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Tracked Drugs</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalLocations.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Manufacturing Sites</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalNDCs.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Drug Codes (NDCs)</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{shortages.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Active Shortages</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <Building2 className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalManufacturers.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Manufacturers</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Risk Assessment Summary */}
        <Card className="p-8 bg-white border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Risk Assessment Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900 mb-2">{avgRiskScore.toFixed(1)}</div>
              <div className="text-sm font-medium text-slate-600">Average Risk Score</div>
              <div className="text-xs text-slate-500 mt-1">(0 = critical risk, 10 = low risk)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{criticalRiskLocations}</div>
              <div className="text-sm font-medium text-slate-600">Critical Risk Locations</div>
              <div className="text-xs text-slate-500 mt-1">(Risk score &lt; 4)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{((totalNDCs / totalLocations) || 0).toFixed(1)}</div>
              <div className="text-sm font-medium text-slate-600">Avg NDCs per Location</div>
              <div className="text-xs text-slate-500 mt-1">Manufacturing concentration</div>
            </div>
          </div>
        </Card>

        {/* Global Risk Heatmap */}
        <GlobalRiskHeatmap locations={locations} ndcLocationLinks={ndcLocationLinks} />

        {/* Drug Explorer */}
        <DrugExplorer 
          drugs={drugs} 
          ndcs={ndcs} 
          locations={locations} 
          ndcLocationLinks={ndcLocationLinks} 
        />
      </div>
    </Layout>
  );
};

export default Index;
