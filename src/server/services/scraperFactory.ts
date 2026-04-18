import { Channel, PlatformName } from '../../types';
import { scrapeGoogleMapsReviews } from './googleScraper.ts';

// Bütün scraper (kazıyıcı) fonksiyonlarımızın uyacağı standart tip / imza modeli.
export type ScraperFunction = (url: string, placeId?: string) => Promise<Channel>;

// Taslak (Placeholder) scraper'lar - İleride bunların içleri Puppeteer veya API ile doldurulacak.
const notImplementedScraper: ScraperFunction = async (url) => {
  throw new Error('Bu platform için kazıyıcı (scraper) henüz uygulanmadı.');
};

// Strateji (Strategy) Kayıt Defteri: Her platformu ilgili scraper fonksiyonuna bağlar.
const scraperStrategies: Record<PlatformName, ScraperFunction> = {
  'Google': scrapeGoogleMapsReviews,
  'Booking.com': notImplementedScraper,
  'TripAdvisor': notImplementedScraper,
  'Holidaycheck': notImplementedScraper,
  'Otelpuan': notImplementedScraper,
  'Tophotels': notImplementedScraper,
  'Check24': notImplementedScraper,
};

/**
 * Scraper Factory: İstenilen platform ismine göre ilgili Strategy / Scraper fonksiyonunu döndürür.
 * @param platform PlatformName tiplerinden biri (Google, Booking.com vb.)
 */
export const getScraperForPlatform = (platform: PlatformName): ScraperFunction => {
  const scraper = scraperStrategies[platform];
  
  if (!scraper) {
    throw new Error(`Scraper Factory Hatası: '${platform}' adında bir platform stratejisi bulunamadı.`);
  }

  return scraper;
};
