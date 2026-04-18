import React from 'react';
import { Hotel } from '../../types';
import { calculateGlobalScore, calculateTotalReviews } from '../../utils/calculations';
import { Star, MessageSquareText } from 'lucide-react';

interface SummaryCardsProps {
  hotel: Hotel;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ hotel }) => {
  const globalScore = calculateGlobalScore(hotel);
  const totalReviews = calculateTotalReviews(hotel);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="card-immersive flex items-center p-6">
        <div className="p-4 rounded-xl bg-white/5 border border-border-subtle text-brand mr-5">
          <Star className="h-8 w-8 fill-current opacity-80" />
        </div>
        <div className="z-10">
          <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Tam Skor (Ağırlıklı Ort.)</p>
          <div className="flex items-baseline">
            <p className="text-[28px] font-bold text-text-primary tracking-tight">{globalScore}</p>
            <p className="ml-2 text-sm font-medium text-text-secondary">/ 5.00</p>
          </div>
        </div>
      </div>

      <div className="card-immersive flex items-center p-6">
        <div className="p-4 rounded-xl bg-white/5 border border-border-subtle text-brand mr-5">
          <MessageSquareText className="h-8 w-8 opacity-80" />
        </div>
        <div className="z-10">
          <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Toplam Yorum Sayısı</p>
          <p className="text-[28px] font-bold text-text-primary tracking-tight">{totalReviews.toLocaleString('tr-TR')}</p>
        </div>
      </div>
    </div>
  );
};
