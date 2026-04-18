import React, { useState } from 'react';
import { Hotel, PlatformName, Channel } from '../../types';
import { useGlobalState } from '../../context/GlobalStateContext';
import { getMaxScoreForPlatform } from '../../utils/calculations';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend } from 'recharts';
import { Swords, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface CompetitorAnalysisProps {
  ownedHotel: Hotel;
}

export const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ ownedHotel }) => {
  const { competitorHotels } = useGlobalState();
  const [selectedCompId, setSelectedCompId] = useState<string>(competitorHotels[0]?.id || '');

  const selectedCompetitor = competitorHotels.find(c => c.id === selectedCompId);

  if (!selectedCompetitor) return null;

  // Radar grafiği verilerini hazırlama
  // Farklı platformların maksimum puanları farklı olduğu için (Booking 10, Google 5)
  // grafikteki şeklin düzgün çıkması adına her şeyi 0-100 aralığına (Norm) normalize ediyoruz.
  const chartData = (Object.keys(ownedHotel.channels) as PlatformName[]).map((platform) => {
    const ownedStats = ownedHotel.channels[platform]?.aggregatedStats;
    const compStats = selectedCompetitor.channels[platform]?.aggregatedStats;
    const max = getMaxScoreForPlatform(platform);

    const ownedScore = ownedStats ? ownedStats.currentScore : 0;
    const compScore = compStats ? compStats.currentScore : 0;

    return {
      platform,
      ownedScore,
      compScore,
      ownedNorm: (ownedScore / max) * 100,
      compNorm: (compScore / max) * 100,
      maxScore: max,
      delta: ownedScore - compScore
    };
  });

  // Recharts Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-bg-surface border border-border-subtle p-3 rounded-lg shadow-xl">
          <p className="font-semibold text-text-primary mb-2 border-b border-border-subtle pb-1">{label}</p>
          <p className="text-sm text-brand flex justify-between gap-4">
            <span>{ownedHotel.name}:</span>
            <span className="font-bold">{data.ownedScore.toFixed(1)} / {data.maxScore}</span>
          </p>
          <p className="text-sm text-warning flex justify-between gap-4 mt-1">
            <span>{selectedCompetitor.name}:</span>
            <span className="font-bold">{data.compScore.toFixed(1)} / {data.maxScore}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-immersive overflow-hidden flex flex-col mt-8">
      <div className="px-6 py-5 border-b border-border-subtle bg-white/5 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary flex items-center">
            <Swords className="w-5 h-5 text-negative mr-2" />
            Rakip Analizi (Radar)
          </h3>
          <p className="mt-1 text-sm text-text-secondary">Seçili oteliniz ile rakipleri kanal bazında kıyaslayın.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-bg-deep p-1 rounded-lg border border-border-subtle">
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider pl-2 hidden sm:inline-block">Rakip Seç:</span>
          <select
            className="bg-transparent text-text-primary text-sm font-medium focus:outline-none focus:ring-0 pl-2 pr-6 py-1 appearance-none cursor-pointer"
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
          >
            {competitorHotels.map(comp => (
              <option key={comp.id} value={comp.id} className="bg-bg-surface text-text-primary">{comp.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center border-b border-border-subtle">
        {/* Radar Chart Bölümü */}
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="var(--color-border-subtle)" />
              <PolarAngleAxis 
                dataKey="platform" 
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 11, fontWeight: 600 }} 
              />
              {/* Radius max 100 (Normalize edildi) */}
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              
              <Radar 
                name={ownedHotel.name} 
                dataKey="ownedNorm" 
                stroke="var(--color-brand)" 
                fill="var(--color-brand)" 
                fillOpacity={0.35} 
                strokeWidth={2}
              />
              <Radar 
                name={selectedCompetitor.name} 
                dataKey="compNorm" 
                stroke="var(--color-warning)" 
                fill="var(--color-warning)" 
                fillOpacity={0.35} 
                strokeWidth={2}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Delta Analiz Tablosu */}
        <div className="bg-[#161b22]/50 border border-border-subtle rounded-xl overflow-hidden h-full flex flex-col max-h-[350px]">
          <div className="grid grid-cols-4 bg-white/5 border-b border-border-subtle px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            <div className="col-span-1">Platform</div>
            <div className="col-span-1 text-center">Sen</div>
            <div className="col-span-1 text-center truncate">{selectedCompetitor.name}</div>
            <div className="col-span-1 text-right">Fark</div>
          </div>
          
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
             {chartData.sort((a, b) => b.delta - a.delta).map((item) => (
                <div key={item.platform} className="grid grid-cols-4 items-center px-2 py-3 rounded-md hover:bg-white/5 transition-colors">
                  <div className="col-span-1 text-[13px] font-semibold text-text-primary truncate" title={item.platform}>
                    {item.platform}
                  </div>
                  <div className="col-span-1 text-center text-sm font-bold text-brand">
                    {item.ownedScore.toFixed(1)}
                  </div>
                  <div className="col-span-1 text-center text-sm font-bold text-warning">
                    {item.compScore.toFixed(1)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-bold border ${
                      item.delta > 0 ? 'bg-positive/10 text-positive border-positive/20' : 
                      item.delta < 0 ? 'bg-negative/10 text-negative border-negative/20' : 
                      'bg-white/10 text-text-secondary border-border-subtle'
                    }`}>
                      {item.delta > 0 && <ArrowUpRight className="w-3 h-3 mr-1" />}
                      {item.delta < 0 && <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {item.delta === 0 && <Minus className="w-3 h-3 mr-1" />}
                      {item.delta > 0 ? '+' : ''}{item.delta.toFixed(1)}
                    </span>
                  </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
