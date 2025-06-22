import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (payload: { query: string; type: SearchType }) => void;
}

type SearchType = 'location' | 'drug' | 'manufacturer' | 'ndc';

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('location');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      onSearch({ query, type: searchType });
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query, searchType, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch({ query: '', type: searchType });
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex items-center space-x-2">
      <select
        value={searchType}
        onChange={(e) => setSearchType(e.target.value as SearchType)}
        className="bg-slate-700 border border-slate-600 text-white text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="location">Locations</option>
        <option value="drug">Drugs</option>
        <option value="manufacturer">Manufacturers</option>
        <option value="ndc">NDCs</option>
      </select>

      <div className={`relative transition-all duration-200 ${isFocused ? 'scale-105' : ''}`}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={`Search ${searchType}s...`}
          className="w-80 bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-10 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;