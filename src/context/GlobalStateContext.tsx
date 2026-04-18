import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Hotel } from '../types';
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
  setSelectedHotelId: (id: string | null) => void; // null ise hepsini seçmiş kabul edebiliriz
  refreshData: () => Promise<void>;                // Elle tetiklenebilecek refresh işlemi
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
      
      // İlk veri yüklendiğinde, eğer bir otel seçili değilse 'Owned' olanlardan ilkini varsayılan seç
      if (!selectedHotelId) {
        const firstOwned = data.find(h => h.type === 'Owned');
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
    refreshData: loadData
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
