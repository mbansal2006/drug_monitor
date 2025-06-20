
import { useState, useEffect } from 'react';
import { Location, Drug, Manufacturer, NDC, NDCLocationLink } from '@/types';

export const useCSVData = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [ndcs, setNDCs] = useState<NDC[]>([]);
  const [ndcLocationLinks, setNDCLocationLinks] = useState<NDCLocationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map((line, index) => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i-1] === ',')) {
          inQuotes = true;
        } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
          inQuotes = false;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const obj: any = {};
      headers.forEach((header, i) => {
        let value = values[i] || '';
        value = value.replace(/^"|"$/g, '');
        
        // Convert boolean strings
        if (value === 'TRUE' || value === 'True') value = true;
        else if (value === 'FALSE' || value === 'False') value = false;
        // Convert numbers
        else if (!isNaN(Number(value)) && value !== '') value = Number(value);
        
        obj[header] = value;
      });
      return obj;
    });
  };

  useEffect(() => {
    const loadCSVFiles = async () => {
      try {
        const csvFiles = [
          'site_locations_table.csv',
          'site_drugs_table.csv', 
          'site_manufacturers_table.csv',
          'site_ndcs_table.csv',
          'site_ndc_location_link.csv'
        ];

        const responses = await Promise.all(
          csvFiles.map(file => fetch(`/site_csvs/${file}`))
        );

        const csvTexts = await Promise.all(
          responses.map(response => {
            if (!response.ok) throw new Error(`Failed to load ${response.url}`);
            return response.text();
          })
        );

        setLocations(parseCSV(csvTexts[0]));
        setDrugs(parseCSV(csvTexts[1]));
        setManufacturers(parseCSV(csvTexts[2]));
        setNDCs(parseCSV(csvTexts[3]));
        setNDCLocationLinks(parseCSV(csvTexts[4]));
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading CSV files:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    loadCSVFiles();
  }, []);

  return {
    locations,
    drugs,
    manufacturers,
    ndcs,
    ndcLocationLinks,
    loading,
    error
  };
};
