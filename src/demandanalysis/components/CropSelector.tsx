import React from 'react';
import { Wheat } from 'lucide-react';

interface CropSelectorProps {
  varieties: string[];
  selectedVariety: string;
  onVarietyChange: (variety: string) => void;
}

export const CropSelector: React.FC<CropSelectorProps> = ({
  varieties,
  selectedVariety,
  onVarietyChange
}) => {
  return (
    <div className="professional-card p-6 animate-slide-up">
      <h2 className="heading-secondary mb-6 flex items-center">
        <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-3 shadow-lg">
          <Wheat className="text-white" size={20} />
        </div>
        Select Your Crop
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Crop Variety
          </label>
          <select
            value={selectedVariety}
            onChange={(e) => onVarietyChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-h-60 overflow-auto"
            aria-label="Select Crop Variety"
          >
            <option value="">Select Crop Variety</option>
            {varieties.map(variety => (
              <option key={variety} value={variety} className="py-2 px-3 hover:bg-blue-100">
                {variety}
              </option>
            ))}
          </select>
        </div>

        {selectedVariety && (
          <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 animate-fade-in">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <div>
                <p className="text-green-800 font-semibold text-base">
                  Selected: {selectedVariety}
                </p>
                <p className="text-green-700 text-sm mt-1 leading-relaxed">
                  We'll analyze market data and provide personalized recommendations for this crop variety.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
