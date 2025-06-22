import React from 'react';

const LocationTable = ({ locations, onSelect }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200 bg-white rounded shadow text-sm">
      <thead className="bg-[#0052CC] text-white">
        <tr>
          <th className="p-2">Name</th>
          <th className="p-2">Country</th>
          <th className="p-2">Region</th>
          <th className="p-2">Risk</th>
        </tr>
      </thead>
      <tbody>
        {locations.map(loc => {
          const riskClass = loc.risk_score >= 67 ? 'bg-red-50' : loc.risk_score >= 34 ? 'bg-yellow-50' : '';
          return (
            <tr key={loc.id} className={`border-b hover:bg-gray-50 cursor-pointer ${riskClass}`} onClick={() => onSelect(loc)}>
              <td className="p-2 font-medium">{loc.name}</td>
              <td className="p-2">{loc.country}</td>
              <td className="p-2">{loc.state_or_region}</td>
              <td className="p-2">{loc.risk_score}</td>
            </tr>
          );
        })
      </tbody>
    </table>
  );
};

export default LocationTable;
