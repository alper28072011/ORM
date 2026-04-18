import React, { useState } from 'react';
import { useGlobalState } from '../../context/GlobalStateContext';
import { PlatformName, HotelType } from '../../types';
import { Plus, Search, Loader2 } from 'lucide-react';

export const AddHotelForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { addHotelChannel } = useGlobalState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Owned' as HotelType,
    platform: 'Google' as PlatformName,
    url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.url) return;
    
    setIsSubmitting(true);
    try {
      await addHotelChannel(formData.name, formData.type, formData.platform, formData.url);
      setFormData({ ...formData, url: '' }); // Başarılı olursa inputu temizle
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-immersive border border-border-subtle p-6 rounded-xl animate-in fade-in zoom-in-95 duration-500">
      <h3 className="text-xl font-bold text-text-primary mb-2 flex items-center">
        <Search className="w-5 h-5 text-brand mr-2" />
        Yeni Linkten Veri Çek
      </h3>
      <p className="text-sm text-text-secondary mb-6">
        Google Haritalar üzerinden link girerek tesisinizin gerçek skorlarını ve yorumlarını anında sisteme dahil edin.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Otel Adı</label>
            <input 
              required
              type="text" 
              placeholder="Örn: Rubi Platinum Spa"
              className="w-full bg-bg-surface border border-border-subtle text-text-primary text-sm rounded-lg focus:ring-brand focus:border-brand px-3 py-2.5"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Tesis Tipi</label>
            <select 
              className="w-full bg-bg-surface border border-border-subtle text-text-primary text-sm rounded-lg focus:ring-brand focus:border-brand px-3 py-2.5"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as HotelType })}
            >
              <option value="Owned">Kendi Tesisimiz</option>
              <option value="Competitor">Rakip Tesis</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Platform</label>
            <select 
              className="w-full bg-bg-surface border border-border-subtle text-text-primary text-sm rounded-lg focus:ring-brand focus:border-brand px-3 py-2.5"
              value={formData.platform}
              onChange={e => setFormData({ ...formData, platform: e.target.value as PlatformName })}
            >
              <option value="Google">Google Maps</option>
              <option value="Booking.com" disabled>Booking.com (Yakında)</option>
              <option value="TripAdvisor" disabled>TripAdvisor (Yakında)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">Google Haritalar Linki</label>
            <input 
              required
              type="url" 
              placeholder="https://www.google.com/maps/place/..."
              className="w-full bg-bg-surface border border-border-subtle text-text-primary text-sm rounded-lg focus:ring-brand focus:border-brand px-4 py-2.5"
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex items-center justify-center bg-brand hover:bg-brand/90 text-white font-medium rounded-lg px-5 py-3 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Canlı Veriler Ayıklanıyor (15-20 sn sürebilir)...</>
            ) : (
              <><Plus className="w-5 h-5 mr-2" /> Sistemi Besle</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
