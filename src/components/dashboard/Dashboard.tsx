import React from 'react';
import { useGlobalState } from '../../context/GlobalStateContext';
import { SummaryCards } from './SummaryCards';
import { ChannelTable } from './ChannelTable';
import { GoalCalculator } from './GoalCalculator';
import { CompetitorAnalysis } from './CompetitorAnalysis';
import { AddHotelForm } from './AddHotelForm';
import { RecentReviews } from './RecentReviews';
import { Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { hotels, selectedHotelId, setSelectedHotelId, isLoading, error, clearError } = useGlobalState();

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
      <div className="max-w-3xl mx-auto p-8 mt-12 text-center text-negative bg-negative/5 rounded-2xl border border-negative/20 shadow-lg animate-in fade-in duration-300">
        <h3 className="text-xl font-bold mb-2">İşlem Sırasında Bir Sorun Oldu</h3>
        <p className="text-sm mt-1 text-text-secondary whitespace-pre-line">{error}</p>
        <button 
          onClick={() => clearError()}
          className="mt-6 bg-bg-surface hover:bg-white/5 border border-border-subtle text-text-primary px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Kapat ve Tekrar Dene
        </button>
      </div>
    );
  }

  const selectedHotel = hotels.find(h => h.id === selectedHotelId);

  // Seçili tesis yoksa veya data null ise Boş State Formunu Bas
  if (!selectedHotel) {
    return (
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center animate-in fade-in duration-500">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-primary">Sistemde Henüz Veri Bulunmuyor</h2>
          <p className="text-sm text-text-secondary mt-2 max-w-lg mx-auto">
            ORM Dashboard tamamen canlı verilere dayanır. Başlamak için yönettiğiniz bir otelin veya rakibinizin Google linkini aşağıdaki forma yapıştırarak verileri çekin.
          </p>
        </div>
        <div className="w-full">
           <AddHotelForm />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">{selectedHotel.name}</h2>
          <p className="text-sm text-text-secondary mt-1">
            Genel Bakış ve İtibar Durumu - {selectedHotel.type === 'Owned' ? 'Kendi Tesisimiz' : 'Rakip Tesis'}
          </p>
        </div>
        <div className="flex-shrink-0">
          <button 
             onClick={() => {
               // Demo amaçlı "Yeni Ekleme" tetikleyicisi
               setSelectedHotelId(null);
             }}
             className="bg-white/5 border border-border-subtle hover:bg-white/10 text-text-primary text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            + Yeni Veri Kaynağı Ekle
          </button>
        </div>
      </div>
      
      <SummaryCards hotel={selectedHotel} />
      <ChannelTable hotel={selectedHotel} />
      <GoalCalculator hotel={selectedHotel} />
      <CompetitorAnalysis ownedHotel={selectedHotel} />
      <RecentReviews hotel={selectedHotel} />
    </div>
  );
};
