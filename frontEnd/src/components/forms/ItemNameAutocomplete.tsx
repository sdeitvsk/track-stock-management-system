
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '../ui/input';
import { inventoryService } from '../../services/inventoryService';

interface ItemNameAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const ItemNameAutocomplete: React.FC<ItemNameAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Enter item name",
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const fetchSuggestions = async (searchTerm: string) => {
    if (searchTerm.length < 1) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await inventoryService.searchItemNames(searchTerm);
      if (response.success && response.data) {
        setSuggestions(response.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching item suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
    setActiveSuggestion(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestion >= 0) {
          handleSuggestionClick(suggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        break;
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }, 200);
  };

  useEffect(() => {
    if (activeSuggestion >= 0 && suggestionRefs.current[activeSuggestion]) {
      suggestionRefs.current[activeSuggestion]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [activeSuggestion]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading && (
            <div className="px-3 py-2 text-sm text-slate-500">
              Searching...
            </div>
          )}
          
          {!loading && suggestions.length === 0 && value && (
            <div className="px-3 py-2 text-sm text-slate-500">
              No items found
            </div>
          )}
          
          {!loading && suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              ref={el => suggestionRefs.current[index] = el}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                index === activeSuggestion
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemNameAutocomplete;
