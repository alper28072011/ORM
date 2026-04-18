export type HotelType = 'Owned' | 'Competitor';
export type PlatformName = 'Google' | 'Holidaycheck' | 'TripAdvisor' | 'Tophotels' | 'Otelpuan' | 'Booking.com' | 'Check24';

export interface Review {
  id: string;
  author: string;
  text: string;
  rating: number; // 1-5 arası standartlaştırılmış puan
  date: string; // ISO tarih formatı
}

export interface AggregatedStats {
  currentScore: number; // Platform üzerindeki ortalama puan
  totalReviews: number; // Toplam yorum sayısı
}

export interface Channel {
  platformName: PlatformName;
  reviews: Review[];
  aggregatedStats: AggregatedStats;
}

export interface Hotel {
  id: string;
  name: string;
  type: HotelType;
  // Her platformun kendi objesi
  channels: Record<PlatformName, Channel>;
}
