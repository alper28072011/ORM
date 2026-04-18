import React from 'react';
import { Hotel, PlatformName, Channel } from '../../types';

interface ChannelTableProps {
  hotel: Hotel;
}

const getPlatformColor = (platform: PlatformName) => {
  return 'text-text-primary bg-white/5 border-border-subtle';
};

export const ChannelTable: React.FC<ChannelTableProps> = ({ hotel }) => {
  // Kanalları yorum sayısına göre çoktan aza sıralıyoruz
  const channels = (Object.values(hotel.channels) as Channel[]).sort((a, b) => b.aggregatedStats.totalReviews - a.aggregatedStats.totalReviews);

  return (
    <div className="card-immersive overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-border-subtle bg-white/5 relative z-10">
        <h3 className="text-lg font-semibold text-text-primary">Kanal Bazlı Performans</h3>
        <p className="mt-1 text-sm text-text-secondary">Platformlara göre puan dağılımı ve hacim bilgisi.</p>
      </div>
      <div className="overflow-x-auto relative z-10">
        <table className="min-w-full">
          <thead className="bg-[#05070a]/40">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle w-1/3">
                Platform
              </th>
              <th scope="col" className="px-6 py-4 text-left text-[11px] font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">
                Ortalama Puan
              </th>
              <th scope="col" className="px-6 py-4 text-right text-[11px] font-semibold text-text-secondary uppercase tracking-wider border-b border-border-subtle">
                Yorum Sayısı
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {channels.map((channel) => (
              <tr key={channel.platformName} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPlatformColor(channel.platformName)}`}>
                    <div className="w-2 h-2 rounded-full bg-brand mr-2"></div>
                    {channel.platformName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center max-w-[200px]">
                    <span className="text-[13px] font-semibold text-text-primary w-8">{channel.aggregatedStats.currentScore.toFixed(1)}</span>
                    <div className="flex-1 bg-[#30363d] rounded-full h-1.5 ml-2 overflow-hidden">
                       <div 
                        className="bg-brand h-1.5 rounded-full" 
                        style={{ width: `${(channel.aggregatedStats.currentScore / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[13px] text-text-secondary text-right">
                  {channel.aggregatedStats.totalReviews.toLocaleString('tr-TR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
