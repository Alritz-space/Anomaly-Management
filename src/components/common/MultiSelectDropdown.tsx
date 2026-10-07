import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

interface MultiSelectDropdownProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
  placeholder?: string;
  allOptionLabel?: string;
  disabled?: boolean;
  className?: string;
  error?: string | boolean;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selected,
  onChange,
  label,
  placeholder = 'Select options...',
  allOptionLabel = 'All',
  disabled = false,
  className = '',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isAllSelected = useMemo(() => {
    if (options.length === 0) return false;
    return options.length === selected.length && options.every((opt) => selected.includes(opt));
  }, [options, selected]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, searchQuery]);

  const handleToggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleToggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([...options]);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  // Label to display on closed button
  const displayLabel = useMemo(() => {
    if (options.length > 0 && isAllSelected) {
      return `${allOptionLabel} (${options.length})`;
    }
    if (selected.length === 0) {
      return placeholder;
    }
    if (selected.length === 1) {
      return selected[0];
    }
    if (selected.length === 2) {
      return `${selected[0]}, ${selected[1]}`;
    }
    return `${selected.length} selected`;
  }, [selected, options, isAllSelected, allOptionLabel, placeholder]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="font-semibold text-slate-700 uppercase text-[10px] block mb-1">
          {label}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full min-h-9 px-3 py-1.5 bg-white border text-left text-xs rounded-lg flex items-center justify-between gap-2 transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
          disabled
            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            : error
            ? 'border-rose-400 ring-1 ring-rose-200 bg-rose-50/20'
            : isOpen
            ? 'border-blue-500 ring-2 ring-blue-100 shadow-xs'
            : 'border-slate-300 hover:border-slate-400 shadow-2xs'
        }`}
      >
        <span
          className={`truncate font-medium flex-1 ${
            selected.length === 0 ? 'text-slate-400' : 'text-slate-800'
          }`}
          title={selected.join(', ')}
        >
          {displayLabel}
        </span>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {selected.length > 0 && !disabled && (
            <span
              onClick={handleClearAll}
              title="Clear selection"
              className="p-0.5 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Popover / Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[240px] animate-in fade-in zoom-in-95 duration-150">
          {/* Search Bar if multiple options */}
          {options.length > 5 && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter options..."
                  className="w-full pl-8 pr-7 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* "All" Option at the top */}
          <div className="p-1 border-b border-slate-100 bg-blue-50/40">
            <label
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-100/60 transition-colors select-none"
              onClick={handleToggleAll}
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  isAllSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : selected.length > 0
                    ? 'bg-blue-100 border-blue-400 text-blue-600'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isAllSelected ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : selected.length > 0 ? (
                  <span className="w-2 h-0.5 bg-blue-600 rounded-full" />
                ) : null}
              </div>
              <span className="text-xs font-bold text-slate-800 flex-1">
                {allOptionLabel}
              </span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full">
                {options.length} total
              </span>
            </label>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = selected.includes(opt);
                return (
                  <label
                    key={opt}
                    onClick={() => handleToggleOption(opt)}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-xs select-none ${
                      isChecked ? 'bg-blue-50/70 text-blue-900 font-medium' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isChecked
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate flex-1" title={opt}>
                      {opt}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-medium text-slate-500">
              {selected.length} of {options.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-blue-600 font-semibold hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-slate-500 font-semibold hover:text-slate-800"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ml-1 px-2.5 py-0.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-2xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
