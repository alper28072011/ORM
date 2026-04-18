import React, { useState, useEffect } from 'react';
import { Hotel, PlatformName, Channel } from '../../types';
import { calculateRequiredReviews, getMaxScoreForPlatform } from '../../utils/calculations';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';

interface GoalCalculatorProps {
  hotel: Hotel;
}

export const GoalCalculator: React.FC<GoalCalculatorProps> = ({ hotel }) => {
  const channels = Object.values(hotel.channels) as Channel[];
  
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformName>(channels[0]?.platformName || 'Google');
  const [targetScore, setTargetScore] = useState<string>('');
  
  // Seçili kanal değiştiğinde hedef puanı temizle veya otele göre ayarla
  useEffect(() => {
    setTargetScore('');
  }, [selectedPlatform, hotel.id]);

  const activeChannel = channels.find(c => c.platformName === selectedPlatform);
  
  if (!activeChannel) return null;

  const currentScore = activeChannel.aggregatedStats.currentScore;
  const totalReviews = activeChannel.aggregatedStats.totalReviews;
  const maxScore = getMaxScoreForPlatform(selectedPlatform);
  
  const parsedTarget = parseFloat(targetScore);
  const isValidTarget = !isNaN(parsedTarget) && parsedTarget > currentScore && parsedTarget < maxScore;
  
  let requiredReviews = 0;
  let isImpossible = false;

  if (!isNaN(parsedTarget)) {
     const result = calculateRequiredReviews(currentScore, totalReviews, parsedTarget, maxScore);
     if (result === -1) {
       isImpossible = true;
     } else {
       requiredReviews = result;
     }
  }

  return (
    <div className="card-immersive overflow-hidden flex flex-col mt-8">
      <div className="px-6 py-5 border-b border-border-subtle bg-white/5 relative z-10 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary flex items-center">
            <Target className="w-5 h-5 text-brand mr-2" />
            Hedef Puan Hesaplayıcı
          </h3>
          <p className="mt-1 text-sm text-text-secondary">Belirli bir puana ulaşmak için gereken tam puanlı yorum sayısını bulun.</p>
        </div>
      </div>
      
      <div className="p-6 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Adım 1: Kanal Seçimi ve Durum */}
        <div className="space-y-4 border-b lg:border-b-0 lg:border-r border-border-subtle pb-6 lg:pb-0 lg:pr-6">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">1. Kanal Seçin</label>
            <select
              className="w-full bg-bg-surface border border-border-subtle text-text-primary text-sm rounded-lg focus:ring-brand focus:border-brand block px-3 py-2.5 appearance-none cursor-pointer"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as PlatformName)}
            >
              {channels.map((channel) => (
                <option key={channel.platformName} value={channel.platformName}>
                  {channel.platformName} - ({channel.aggregatedStats.currentScore.toFixed(1)} / {getMaxScoreForPlatform(channel.platformName)})
                </option>
              ))}
            </select>
          </div>
          
          <div className="bg-[#161b22] px-4 py-3 rounded-lg border border-border-subtle">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-text-secondary">Mevcut Puan:</span>
              <span className="text-sm font-bold text-text-primary">{currentScore.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-text-secondary">Mevcut Yorum:</span>
              <span className="text-sm text-text-primary">{totalReviews.toLocaleString('tr-TR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">Maksimum Puan:</span>
              <span className="text-sm text-text-primary">{maxScore}</span>
            </div>
          </div>
        </div>

        {/* Adım 2: Hedef Puan Girişi */}
        <div className="space-y-4 border-b lg:border-b-0 lg:border-r border-border-subtle pb-6 lg:pb-0 lg:pr-6">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">2. Hedef Puanı Girin</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min={currentScore + 0.1}
                max={maxScore}
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                className="w-full bg-bg-surface border border-border-subtle text-text-primary text-2xl font-bold rounded-lg focus:ring-brand focus:border-brand block pl-4 pr-12 py-3"
                placeholder={String((currentScore + 0.1).toFixed(1))}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-text-secondary">
                / {maxScore}
              </div>
            </div>
            {(parsedTarget <= currentScore) && targetScore !== '' && (
              <p className="mt-2 text-xs text-warning flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" /> Hedef puan mevcut puandan yüksek olmalı.
              </p>
            )}
            {isImpossible && targetScore !== '' && (
              <p className="mt-2 text-xs text-negative flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" /> Maksimum puana sadece tam puan alarak teorik olarak ulaşılamaz. Lütfen {maxScore}'dan küçük girin.
              </p>
            )}
          </div>
        </div>

        {/* Adım 3: Sonuç */}
        <div className="flex flex-col h-full justify-center space-y-2">
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">3. Gereken İşlem</label>
          
          {isValidTarget && !isImpossible ? (
            <div className="bg-positive/10 border border-positive/20 rounded-xl p-5 text-center transition-all animate-in fade-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-positive/20 text-positive mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-[32px] leading-tight font-bold text-positive mb-1">
                {requiredReviews.toLocaleString('tr-TR')}
              </p>
              <p className="text-sm font-medium text-positive/80">
                Adet {maxScore} yıldızlı yeni yoruma ihtiyacınız var.
              </p>
            </div>
          ) : (
            <div className="bg-[#161b22] border border-border-subtle border-dashed rounded-xl p-5 text-center h-full flex flex-col justify-center items-center">
              <p className="text-sm text-text-secondary">
                Hesaplama yapabilmek için geçerli bir hedef puan girin.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
