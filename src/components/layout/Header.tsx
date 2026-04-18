import React from 'react';
import { useGlobalState } from '../../context/GlobalStateContext';
import { Building2 } from 'lucide-react';

export const Header: React.FC = () => {
  const { ownedHotels, selectedHotelId, setSelectedHotelId } = useGlobalState();

  return (
    <header className="z-10 sticky top-0 border-b border-border-subtle bg-gradient-to-b from-bg-surface/80 to-bg-deep/0 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-4 sm:py-0">
          <div className="flex items-center w-full sm:w-auto mb-4 sm:mb-0">
            <h1 className="text-xl font-bold tracking-tight">
              ORM<span className="text-brand">PANEL</span>
            </h1>
          </div>
          
          <div className="flex items-center w-full sm:w-auto space-x-4 bg-white/5 p-1 rounded-lg border border-border-subtle sm:-my-1">
            <span className="text-sm font-medium text-text-secondary whitespace-nowrap pl-2">
              Otel Seçiniz:
            </span>
            <select
              id="hotel-selector"
              className="block w-full sm:w-64 pl-2 pr-8 py-1.5 text-base bg-transparent text-text-primary border-none focus:outline-none focus:ring-0 sm:text-sm rounded-md transition-colors cursor-pointer appearance-none"
              value={selectedHotelId || ''}
              onChange={(e) => setSelectedHotelId(e.target.value)}
            >
              <optgroup label="Yönetilen Oteller" className="bg-bg-surface text-text-secondary">
                {ownedHotels.map(hotel => (
                  <option key={hotel.id} value={hotel.id} className="text-text-primary">{hotel.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
