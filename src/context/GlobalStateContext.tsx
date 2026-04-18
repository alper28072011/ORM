import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Hotel, PlatformName, HotelType, Channel } from '../types';
import { dataService } from '../services/dataService';

// State yapısının tanımı
interface GlobalState {
  hotels: Hotel[];
  ownedHotels: Hotel[];
  competitorHotels: Hotel[];
  selectedHotelId: string | null;  // Global selector için seçili otelin ID'si
  isLoading: boolean;              // Global yüklenme durumu
  error: string | null;            // Global hata durumu
}

// Provider'dan dışarıya sunacağımız fonksiyonlarla birleşmiş Context yapısı
interface GlobalContextProps extends GlobalState {
  setSelectedHotelId: (id: string | null) => void; 
  refreshData: () => Promise<void>;
  addHotelChannel: (hotelName: string, type: HotelType, platform: PlatformName, url: string) => Promise<void>;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dataService.fetchAllHotels();
      setHotels(data);
      
      if (!selectedHotelId && data.length > 0) {
        const firstOwned = data.find(h => h.type === 'Owned') || data[0];
        if (firstOwned) {
          setSelectedHotelId(firstOwned.id);
        }
      }
    } catch (err) {
      setError('Otel verileri çekilirken bir hata oluştu.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addHotelChannel = async (hotelName: string, type: HotelType, platform: PlatformName, url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Backend'den kazınmış güncel veriyi iste
      const channelData = await dataService.fetchReviewsFromBackend(platform, url);
      
      // Standart bir ID üret
      const generatedId = 'hotel-' + hotelName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      setHotels(prev => {
        const newHotels = [...prev];
        const existingHotelIndex = newHotels.findIndex(h => h.id === generatedId);
        
        if (existingHotelIndex >= 0) {
          // 2a. Otel zaten varsa, belirili platform datasını ekle veya ez
          newHotels[existingHotelIndex] = {
            ...newHotels[existingHotelIndex],
            type: type, // Tipi güncel tut
            channels: {
              ...newHotels[existingHotelIndex].channels,
              [platform]: channelData
            }
          };
        } else {
          // 2b. Otel yoksa yeni oteli oluştur ve kanalı içine aktar
          newHotels.push({
            id: generatedId,
            name: hotelName,
            type: type,
            channels: { [platform]: channelData } as Record<PlatformName, Channel>
          });
        }
        
        // 3. LocalStorage veritabanına kaydet
        dataService.saveHotels(newHotels);
        
        if (!selectedHotelId) {
           setSelectedHotelId(generatedId);
        }
        
        return newHotels;
      });
    } catch (err: any) {
      setError(err.message || `${platform} kanalına bağlanırken bir sorun yaşandı.`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Provider mount olduğunda ilk veriyi çek
  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Türetilmiş stateler (Kendi otellerimiz ve rakipleri ayırıyoruz)
  const ownedHotels = hotels.filter(h => h.type === 'Owned');
  const competitorHotels = hotels.filter(h => h.type === 'Competitor');

  const value: GlobalContextProps = {
    hotels,
    ownedHotels,
    competitorHotels,
    selectedHotelId,
    isLoading,
    error,
    setSelectedHotelId,
    refreshData: loadData,
    addHotelChannel
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

// İstediğimiz komponentlerden dataya erişmek için özel Hook (Custom Hook)
export const useGlobalState = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
