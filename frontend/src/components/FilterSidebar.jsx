import React from 'react';

const FilterSidebar = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="bg-white rounded shadow p-4 space-y-4">
      <input
        name="query"
        value={filters.query}
        onChange={handleChange}
        placeholder="Search"
        className="w-full border px-2 py-1 rounded"
      />
      <select name="country" value={filters.country} onChange={handleChange} className="w-full border px-2 py-1 rounded">
        <option value="">All Countries</option>
      </select>
      <select name="risk_bucket" value={filters.risk_bucket} onChange={handleChange} className="w-full border px-2 py-1 rounded">
        <option value="">All Risk Levels</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="taa" name="taa_compliant" checked={filters.taa_compliant} onChange={handleChange} />
        <label htmlFor="taa" className="text-sm">TAA Compliant</label>
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="ofac" name="ofac_sanctioned" checked={filters.ofac_sanctioned} onChange={handleChange} />
        <label htmlFor="ofac" className="text-sm">OFAC Sanctioned</label>
      </div>
    </div>
  );
};

export default FilterSidebar;
