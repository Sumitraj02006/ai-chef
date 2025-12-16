import React from 'react';
import { UserPreferences } from '../types';
import { Settings, X, ChefHat, Info } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  prefs: UserPreferences;
  onUpdatePrefs: (newPrefs: UserPreferences) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, prefs, onUpdatePrefs }) => {
  const handleChange = (key: keyof UserPreferences, value: string) => {
    onUpdatePrefs({ ...prefs, [key]: value });
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-amber-600">
            <ChefHat size={28} />
            <h2 className="text-2xl font-bold">Chef Mate</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6 flex-1">
          <div className="pb-4 border-b border-gray-100">
             <p className="text-sm text-gray-500 mb-4 flex gap-2">
                <Info size={16} className="mt-0.5"/> 
                Adjust these settings to customize Chef Mate's suggestions.
             </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preference</label>
            <select
              value={prefs.diet}
              onChange={(e) => handleChange('diet', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
            >
              <option value="Any">Any</option>
              <option value="Veg">Vegetarian</option>
              <option value="Non-Veg">Non-Vegetarian</option>
              <option value="Vegan">Vegan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cooking Skill Level</label>
            <div className="grid grid-cols-3 gap-2">
              {['Beginner', 'Intermediate', 'Expert'].map((level) => (
                <button
                  key={level}
                  onClick={() => handleChange('skillLevel', level)}
                  className={`py-2 px-1 text-xs sm:text-sm rounded-md border ${
                    prefs.skillLevel === level
                      ? 'bg-amber-100 border-amber-500 text-amber-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Cuisine</label>
            <input
              type="text"
              value={prefs.cuisine === 'Any' ? '' : prefs.cuisine}
              placeholder="e.g. Indian, Italian, Chinese"
              onChange={(e) => handleChange('cuisine', e.target.value || 'Any')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Allergies / Exclusions</label>
            <textarea
              value={prefs.allergies}
              onChange={(e) => handleChange('allergies', e.target.value)}
              placeholder="e.g. Peanuts, Gluten, Dairy"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none h-24 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={prefs.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Hinglish">Hinglish</option>
            </select>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
           <div className="bg-amber-50 p-4 rounded-lg">
             <h4 className="font-medium text-amber-800 text-sm mb-1">Tip</h4>
             <p className="text-xs text-amber-700">
               Upload a photo of your fridge contents, and Chef Mate will suggest what to cook!
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
