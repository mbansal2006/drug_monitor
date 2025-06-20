
import React from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Database, Shield, Globe, AlertTriangle, TrendingUp } from 'lucide-react';

const About = () => {
  return (
    <Layout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">About This Platform</h1>
          <p className="text-xl text-slate-600">
            Understanding pharmaceutical supply chain vulnerabilities through data intelligence
          </p>
        </div>

        {/* Project Overview */}
        <Card className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Info className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-slate-900">Project Overview</h2>
          </div>
          <div className="space-y-4 text-slate-700">
            <p className="text-lg leading-relaxed">
              The Drug Shortage Supply Monitor is an intelligence platform that aggregates and analyzes 
              pharmaceutical manufacturing data from multiple government sources to identify potential 
              supply chain vulnerabilities and drug shortage risks.
            </p>
            <p>
              By combining manufacturing location data, drug approval information, and geopolitical risk 
              assessments, this platform provides stakeholders with actionable insights into the resilience 
              of critical pharmaceutical supply chains.
            </p>
          </div>
        </Card>

        {/* Data Sources */}
        <Card className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Database className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-semibold text-slate-900">Data Sources</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-1">FDA</Badge>
                <div>
                  <h3 className="font-semibold text-slate-900">Food and Drug Administration</h3>
                  <p className="text-sm text-slate-600">
                    Drug approvals, manufacturing locations, NDC codes, and current shortage status
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-1">GSA</Badge>
                <div>
                  <h3 className="font-semibold text-slate-900">General Services Administration</h3>
                  <p className="text-sm text-slate-600">
                    Federal procurement data and supplier information
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-1">BIS</Badge>
                <div>
                  <h3 className="font-semibold text-slate-900">Bureau of Industry and Security</h3>
                  <p className="text-sm text-slate-600">
                    Export controls and trade restriction data affecting pharmaceutical supply chains
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-1">OFAC</Badge>
                <div>
                  <h3 className="font-semibold text-slate-900">Office of Foreign Assets Control</h3>
                  <p className="text-sm text-slate-600">
                    Sanctions and compliance data for international manufacturing sites
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Methodology */}
        <Card className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-semibold text-slate-900">Risk Scoring Methodology</h2>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-3">Risk Score Scale (0-10)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm"><strong>0-3:</strong> Critical Risk</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm"><strong>4-5:</strong> High Risk</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm"><strong>6-7:</strong> Medium Risk</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                  <span className="text-sm"><strong>8-10:</strong> Low Risk</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Risk Factors Considered:</h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start space-x-2">
                  <Globe className="w-4 h-4 mt-1 text-slate-400" />
                  <span><strong>Geographic Concentration:</strong> Manufacturing sites clustered in high-risk regions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 mt-1 text-slate-400" />
                  <span><strong>Regulatory Environment:</strong> Compliance history and inspection records</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 mt-1 text-slate-400" />
                  <span><strong>Trade Restrictions:</strong> Export controls and sanctions affecting supply chains</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Database className="w-4 h-4 mt-1 text-slate-400" />
                  <span><strong>Historical Patterns:</strong> Past shortage events and supply disruptions</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Limitations */}
        <Card className="p-8 bg-amber-50 border-amber-200">
          <div className="flex items-center space-x-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h2 className="text-2xl font-semibold text-slate-900">Limitations & Disclaimers</h2>
          </div>
          <div className="space-y-4 text-slate-700">
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Data Lag:</strong> Government data sources may have reporting delays of 30-90 days</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Incomplete Coverage:</strong> Not all manufacturing sites may be captured in public datasets</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>Risk Model Limitations:</strong> Scores are estimates based on available data and may not reflect all risk factors</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                <span><strong>No Guarantee:</strong> This platform is for informational purposes only and should not be the sole basis for critical decisions</span>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-white rounded border border-amber-300">
              <p className="text-sm font-medium text-amber-800">
                <strong>Disclaimer:</strong> This platform aggregates publicly available government data for analytical purposes. 
                Users should verify information independently and consult with qualified professionals for critical supply chain decisions.
              </p>
            </div>
          </div>
        </Card>

        {/* Data Freshness */}
        <Card className="p-6 bg-slate-50">
          <div className="text-center">
            <h3 className="font-semibold text-slate-900 mb-2">Data Update Frequency</h3>
            <p className="text-slate-600">
              Data is refreshed weekly from government sources. Last updated: <span className="font-medium">December 2024</span>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default About;
