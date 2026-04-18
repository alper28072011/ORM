import { Hotel } from '../types';
import { mockHotels } from './mockData';

export const dataService = {
  /**
   * Tüm otel verilerini (Kendi otellerimiz + Rakipler) ve kanallarındaki yorum verilerini getirir.
   */
  async fetchAllHotels(): Promise<Hotel[]> {
    // Ağ gecikmesini simüle etmek için promise ve timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockHotels);
      }, 750); // 750ms fake latency
    });
  },

  /**
   * Sadece bizim yönettiğimiz otellerin verisini getirir.
   */
  async fetchOwnedHotels(): Promise<Hotel[]> {
    const all = await this.fetchAllHotels();
    return all.filter(hotel => hotel.type === 'Owned');
  },

  /**
   * Sadece rakip otellerin verisini getirir.
   */
  async fetchCompetitors(): Promise<Hotel[]> {
    const all = await this.fetchAllHotels();
    return all.filter(hotel => hotel.type === 'Competitor');
  }
};
