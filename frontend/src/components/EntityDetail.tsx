
import React, { useState, useEffect } from 'react';
import { X, ExternalLink, MapPin, Building2, Pill, FileText, AlertTriangle, Shield, Globe } from 'lucide-react';

interface EntityDetailProps {
  entity: any;
  entityType: 'drug' | 'location' | 'manufacturer' | 'ndc';
  onClose: () => void;
  onEntitySelect: (entity: any, type: string) => void;
}

const EntityDetail: React.FC<EntityDetailProps> = ({
  entity,
  entityType,
  onClose,
  onEntitySelect
}) => {
  const [relatedData, setRelatedData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedData();
  }, [entity, entityType]);

  const fetchRelatedData = async () => {
    setLoading(true);
    try {
      // Fetch related entities based on the current entity type
      const promises = [];
      
      if (entityType === 'location') {
        promises.push(
          fetch(`/api/ndc_location_links?location_id=${entity.id}`).then(res => res.ok ? res.json() : []),
          fetch('/api/ndcs').then(res => res.ok ? res.json() : []),
          fetch('/api/drugs').then(res => res.ok ? res.json() : [])
        );
      } else if (entityType === 'drug') {
        promises.push(
          fetch(`/api/ndcs?drug_id=${entity.id}`).then(res => res.ok ? res.json() : []),
          fetch('/api/manufacturers').then(res => res.ok ? res.json() : []),
          fetch('/api/locations').then(res => res.ok ? res.json() : [])
        );
      }

      const results = await Promise.all(promises);
      setRelatedData({
        links: results[0] || [],
        ndcs: results[1] || [],
        secondary: results[2] || []
      });
    } catch (error) {
      console.error('Error fetching related data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 8) return { color: 'bg-emerald-900 text-emerald-300', label: 'Low Risk' };
    if (riskScore >= 6) return { color: 'bg-yellow-900 text-yellow-300', label: 'Medium Risk' };
    if (riskScore >= 4) return { color: 'bg-orange-900 text-orange-300', label: 'High Risk' };
    return { color: 'bg-red-900 text-red-300', label: 'Critical Risk' };
  };

  const renderLocationDetail = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">{entity.full_country_name}</h3>
        <p className="text-slate-400">{entity.address}</p>
        
        {/* Risk Score */}
        <div className="mt-3">
          {(() => {
            const badge = getRiskBadge(entity.risk_score);
            return (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                Reliabity Score: {entity.risk_score}/10 ({badge.label})
              </span>
            );
          })()}
        </div>
      </div>

      {/* Risk Factors */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-400" />
          Risk Factors
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {entity.ofac_sanctioned && (
            <div className="flex items-center p-2 bg-red-900/30 border border-red-700 rounded">
              <span className="text-red-300 text-sm">OFAC Sanctioned</span>
            </div>
          )}
          {entity.engages_in_dumping && (
            <div className="flex items-center p-2 bg-orange-900/30 border border-orange-700 rounded">
              <span className="text-orange-300 text-sm">Engages in Dumping</span>
            </div>
          )}
          {entity.has_bis_ns1 && (
            <div className="flex items-center p-2 bg-red-900/30 border border-red-700 rounded">
              <span className="text-red-300 text-sm">BIS NS1 Classification</span>
            </div>
          )}
          {entity.quality_risk_flag && (
            <div className="flex items-center p-2 bg-yellow-900/30 border border-yellow-700 rounded">
              <span className="text-yellow-300 text-sm">Quality Risk Flag</span>
            </div>
          )}
        </div>
      </div>

      {/* Alliance Memberships */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-blue-400" />
          Alliance Status
        </h4>
        <div className="flex flex-wrap gap-2">
          {entity.is_nato && (
            <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-sm">NATO</span>
          )}
          {entity.is_five_eyes && (
            <span className="px-2 py-1 bg-purple-900 text-purple-300 rounded text-sm">Five Eyes</span>
          )}
          {entity.is_oecd && (
            <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-sm">OECD</span>
          )}
          {entity.is_quad && (
            <span className="px-2 py-1 bg-indigo-900 text-indigo-300 rounded text-sm">QUAD</span>
          )}
          {entity.taa_compliant && (
            <span className="px-2 py-1 bg-emerald-900 text-emerald-300 rounded text-sm">TAA Compliant</span>
          )}
          {!entity.is_nato && !entity.is_five_eyes && !entity.is_oecd && !entity.is_quad && (
            <span className="text-slate-400 text-sm">No major alliance memberships</span>
          )}
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-2 text-sm">
        {entity.oai_count === 0 ? (
          <div className="text-slate-400">
            No FDA Official Action Indicated (OAI) Classification
          </div>
        ) : (
          <div>
            <span className="text-slate-400">OAI Count:</span>
            <span className="text-white ml-2">{entity.oai_count}</span>
          </div>
        )}
        {entity.duns_number && (
          <div>
            <span className="text-slate-400">DUNS Number:</span>
            <span className="text-white ml-2">{entity.duns_number}</span>
          </div>
        )}
      </div>
      
    </div>
  );

  const renderDrugDetail = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">{entity.drug_name}</h3>
        {entity.therapeutic_categories && (
          <p className="text-slate-400">{entity.therapeutic_categories}</p>
        )}
        
        <div className="mt-3 flex flex-wrap gap-2">
          {entity.fda_essential && (
            <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-sm">FDA Essential</span>
          )}
          {entity.shortage_start && !entity.shortage_end && (
            <span className="px-2 py-1 bg-red-900 text-red-300 rounded text-sm">Active Shortage</span>
          )}
        </div>
      </div>

      {(entity.shortage_start || entity.shortage_end) && (
        <div>
          <h4 className="text-lg font-medium text-white mb-3">Shortage Information</h4>
          <div className="space-y-2 text-sm">
            {entity.shortage_start && (
              <div>
                <span className="text-slate-400">Shortage Start:</span>
                <span className="text-white ml-2">{entity.shortage_start}</span>
              </div>
            )}
            {entity.shortage_end && (
              <div>
                <span className="text-slate-400">Shortage End:</span>
                <span className="text-white ml-2">{entity.shortage_end}</span>
              </div>
            )}
            {entity.reason && (
              <div>
                <span className="text-slate-400">Reason:</span>
                <span className="text-white ml-2">{entity.reason}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderManufacturerDetail = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">{entity.manufacturer_name}</h3>
        <p className="text-slate-400">Pharmaceutical Manufacturer</p>
      </div>
    </div>
  );

  const renderNDCDetail = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">{entity.ndc_code}</h3>
        <p className="text-slate-400">{entity.proprietary_name}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm">
        <div>
          <span className="text-slate-400">Manufacturer:</span>
          <span className="text-white ml-2">{entity.manufacturer_name}</span>
        </div>
        <div>
          <span className="text-slate-400">Dosage:</span>
          <span className="text-white ml-2">{entity.drug_dosage}</span>
        </div>
        <div>
          <span className="text-slate-400">Strength:</span>
          <span className="text-white ml-2">{entity.drug_strength}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-slate-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          {entityType === 'location' && <MapPin className="h-5 w-5 text-blue-400" />}
          {entityType === 'drug' && <Pill className="h-5 w-5 text-green-400" />}
          {entityType === 'manufacturer' && <Building2 className="h-5 w-5 text-purple-400" />}
          {entityType === 'ndc' && <FileText className="h-5 w-5 text-orange-400" />}
          <h2 className="text-lg font-semibold text-white capitalize">{entityType} Details</h2>
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
        {entityType === 'location' && renderLocationDetail()}
        {entityType === 'drug' && renderDrugDetail()}
        {entityType === 'manufacturer' && renderManufacturerDetail()}
        {entityType === 'ndc' && renderNDCDetail()}

        {/* Related Entities */}
        {!loading && relatedData.links && relatedData.links.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-medium text-white mb-3">Related Entities</h4>
            <div className="space-y-2">
              {relatedData.links.slice(0, 5).map((link: any, index: number) => (
                <div
                  key={index}
                  className="p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                  onClick={() => console.log('Navigate to related entity', link)}
                >
                  <div className="text-white text-sm">Related Item #{link.id}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityDetail;
