import React from 'react';

const ObjectDetailPanel = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-end z-50">
      <div className="bg-white w-96 h-full p-4 overflow-y-auto">
        <button onClick={onClose} className="mb-4 text-sm text-blue-600 underline">Close</button>
        <h2 className="text-xl font-bold mb-2">{item.name}</h2>
        <p className="text-sm mb-1">{item.address}</p>
        <p className="text-sm mb-1">{item.country}</p>
        <p className="text-sm mb-1">Risk: {item.risk_score}</p>
        {item.drugs && item.drugs.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Drugs</h3>
            <ul className="list-disc ml-4">
              {item.drugs.map(d => (
                <li key={d.id}>{d.drug_name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectDetailPanel;
