import { Hotel, PlatformName, Channel } from '../types';

const STORAGE_KEY = 'orm_real_hotels_data';

export const dataService = {
  /**
   * Node.js Backend servisimize istek atarak gerçek kazıma (scraping) işlemini başlatır.
   */
  async fetchReviewsFromBackend(platform: PlatformName, url: string, placeId?: string): Promise<Channel> {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform, url, placeId }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.details || 'Backend servisinden veri çekilirken hata oluştu.');
      }

      return result.data as Channel;
    } catch (error) {
      console.error('[DataService] API Fetch Error:', error);
      throw error;
    }
  },

  /**
   * Tüm otel verilerini LocalStorage'dan (İleride DB'den) getirir.
   */
  async fetchAllHotels(): Promise<Hotel[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('LocalStorage parse hatası', e);
    }
    return []; // İlk girişte boştur
  },

  /**
   * Otel ekleme/güncelleme işlemleri sonrası veriyi kalıcı hale getirir
   */
  saveHotels(hotels: Hotel[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
  }
};

