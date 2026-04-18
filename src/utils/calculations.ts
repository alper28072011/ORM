import { Hotel, Channel, PlatformName } from '../types';

/**
 * Seçili otelin tüm platformlardaki toplam yorum sayısını hesaplar
 */
export const calculateTotalReviews = (hotel: Hotel): number => {
  return (Object.values(hotel.channels) as Channel[]).reduce((acc, channel) => acc + channel.aggregatedStats.totalReviews, 0);
};

/**
 * Seçili otelin ağırlıklı ortalaması alınmış "Tam Skorunu" (Global Score) hesaplar.
 */
export const calculateGlobalScore = (hotel: Hotel): number => {
  let totalScoreWeight = 0;
  let totalReviews = 0;

  (Object.values(hotel.channels) as Channel[]).forEach(channel => {
    totalScoreWeight += channel.aggregatedStats.currentScore * channel.aggregatedStats.totalReviews;
    totalReviews += channel.aggregatedStats.totalReviews;
  });

  if (totalReviews === 0) return 0;
  return Number((totalScoreWeight / totalReviews).toFixed(2));
};

/**
 * Platformlara göre erişilebilecek maksimum puanları (M) döndürür.
 */
export const getMaxScoreForPlatform = (platform: PlatformName): number => {
  switch (platform) {
    case 'Booking.com':
    case 'Otelpuan':
      return 10;
    case 'Holidaycheck':
      return 6;
    default:
      return 5; // Google, TripAdvisor, Check24, Tophotels vb.
  }
};

/**
 * Hedeflenen puana ulaşmak için gereken tam puanlı (5, 6, 10 vs.) yorum sayısını hesaplar.
 * Formül: N = (T * R - S * R) / (M - T)
 * N: Gereken Yorum, T: Hedef Puan, R: Mevcut Yorum Sayısı, S: Mevcut Puan, M: Maksimum Puan
 */
export const calculateRequiredReviews = (
  currentScore: number,
  totalReviews: number,
  targetScore: number,
  maxScore: number
): number => {
  // Eğer hedef puan zaten mevcut puana eşit veya daha düşükse 0 döndür
  if (targetScore <= currentScore) return 0;
  
  // Hedef puan maksimum puana eşit veya daha büyükse teorik olarak imkansızdır (veya sonsuzdur)
  // Bu yüzden -1 döndürerek UI'da "İmkansız" uyarısı için yakalayabiliriz.
  if (targetScore >= maxScore) return -1; 
  
  const requiredReviews = (targetScore * totalReviews - currentScore * totalReviews) / (maxScore - targetScore);
  
  // Virgüllü bir sayı çıkarsa yukarı yuvarlamamız gerekir, çünkü yarım yorum alamayız.
  return Math.ceil(requiredReviews);
};
