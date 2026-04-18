import React from 'react';
import { useGlobalState } from '../../context/GlobalStateContext';
import { SummaryCards } from './SummaryCards';
import { ChannelTable } from './ChannelTable';
import { GoalCalculator } from './GoalCalculator';
import { CompetitorAnalysis } from './CompetitorAnalysis';
import { Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { hotels, selectedHotelId, isLoading, error } = useGlobalState();

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-brand">
        <Loader2 className="animate-spin h-12 w-12 mb-4" />
        <p className="text-sm font-medium text-text-secondary">Veriler Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-negative bg-negative/10 rounded-xl m-8 border border-negative/20">
        <p className="font-semibold">Veri yüklenirken bir hata oluştu</p>
        <p className="text-sm mt-1 text-text-secondary">{error}</p>
      </div>
    );
  }

  const selectedHotel = hotels.find(h => h.id === selectedHotelId);

  if (!selectedHotel) {
    return (
      <div className="p-12 text-center text-text-secondary flex items-center justify-center h-full">
        Lütfen görüntülemek için yukarıdan bir otel seçin.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">{selectedHotel.name}</h2>
          <p className="text-sm text-text-secondary mt-1">
            Genel Bakış ve İtibar Durumu
          </p>
        </div>
      </div>
      
      <SummaryCards hotel={selectedHotel} />
      <ChannelTable hotel={selectedHotel} />
      <GoalCalculator hotel={selectedHotel} />
      <CompetitorAnalysis ownedHotel={selectedHotel} />
    </div>
  );
};
