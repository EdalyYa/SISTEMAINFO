import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Select = ({ 
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  multiple = false,
  searchable = false,
  clearable = false,
  className = '',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const filteredOptions = searchable && searchTerm
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOptions = multiple 
    ? options.filter(option => value?.includes(option.value))
    : options.find(option => option.value === value);

  const handleOptionClick = (option) => {
    if (multiple) {
      const newValue = value?.includes(option.value)
        ? value.filter(v => v !== option.value)
        : [...(value || []), option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };

  const removeOption = (optionValue, e) => {
    e.stopPropagation();
    if (multiple) {
      const newValue = value.filter(v => v !== optionValue);
      onChange(newValue);
    }
  };

  const getDisplayValue = () => {
    if (multiple) {
      return selectedOptions?.length > 0 
        ? `${selectedOptions.length} seleccionado${selectedOptions.length > 1 ? 's' : ''}`
        : placeholder;
    }
    return selectedOptions?.label || placeholder;
  };

  const labelClasses = `
    block text-sm font-medium mb-2 transition-colors duration-200
    ${error ? 'text-red-600' : isFocused ? 'text-blue-600' : 'text-gray-700'}
    ${required ? "after:content-['*'] after:text-red-500 after:ml-1" : ''}
  `;

  const selectClasses = `
    relative w-full px-4 py-3 border rounded-lg cursor-pointer
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-50 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
    ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}
    ${className}
  `;

  return (
    <div className="relative" ref={selectRef}>
      {label && (
        <label className={labelClasses}>
          {label}
        </label>
      )}
      
      <div
        className={selectClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center gap-2">
            {multiple && selectedOptions?.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedOptions.slice(0, 2).map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                  >
                    {option.label}
                    <button
                      onClick={(e) => removeOption(option.value, e)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {selectedOptions.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{selectedOptions.length - 2} más
                  </span>
                )}
              </div>
            ) : (
              <span className={`${!selectedOptions || (multiple && selectedOptions?.length === 0) ? 'text-gray-500' : 'text-gray-900'}`}>
                {getDisplayValue()}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {clearable && (selectedOptions || (multiple && selectedOptions?.length > 0)) && (
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            <ChevronDownIcon 
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'transform rotate-180' : ''
              }`} 
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
          
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-center">
                No se encontraron opciones
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = multiple 
                  ? value?.includes(option.value)
                  : value === option.value;
                
                return (
                  <div
                    key={option.value}
                    className={`px-4 py-3 cursor-pointer transition-colors duration-150 ${
                      isSelected 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-50 text-gray-900'
                    }`}
                    onClick={() => handleOptionClick(option)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {isSelected && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      
      {(error || helperText) && (
        <div className="mt-2 text-sm">
          {error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <p className="text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Select;
export { Select };