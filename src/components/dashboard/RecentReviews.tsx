import React from 'react';
import { Hotel } from '../../types';
import { Star, MessageSquare } from 'lucide-react';

interface RecentReviewsProps {
  hotel: Hotel;
}

export const RecentReviews: React.FC<RecentReviewsProps> = ({ hotel }) => {
  // Bütün platformlardaki yorumları düz bir dizi halinde birleştir
  const allReviews = Object.entries(hotel.channels).flatMap(([platformName, channelData]) => {
    return ((channelData as any).reviews || []).map((review: any) => ({
      ...review,
      platform: platformName
    }));
  });

  // Google bazen DOM'da aynı yorumu hem "En İlgili" hem de "En Yeni" olarak 2 kere render edebilir. 
  // Tekrarlanan ID'leri (data-review-id) tekilleştiriyoruz (deduplication)
  const uniqueReviewsMap = new Map();
  allReviews.forEach(review => {
     if (!uniqueReviewsMap.has(review.id)) {
        uniqueReviewsMap.set(review.id, review);
     }
  });
  const uniqueReviews = Array.from(uniqueReviewsMap.values());

  // Tarihe göre en yeniden eskiye sıralama (Scraper tarihleri ISO'ya çevirirdi)
  const sortedReviews = uniqueReviews.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedReviews.length === 0) {
    return (
       <div className="card-immersive border border-border-subtle p-6 rounded-xl mt-8 flex flex-col items-center text-center">
            <MessageSquare className="w-8 h-8 text-text-secondary opacity-50 mb-3" />
            <p className="text-text-primary font-medium">Henüz bir yorum kaydedilmemiş.</p>
            <p className="text-sm text-text-secondary mt-1">Bu tesise ait detaylı yorum içeriği bulunamadı veya platform yorumları gizliyor.</p>
       </div>
    );
  }

  return (
    <div className="card-immersive border border-border-subtle p-6 rounded-xl mt-8">
      <div className="flex items-center mb-6">
        <MessageSquare className="w-5 h-5 text-brand mr-2" />
        <h3 className="text-xl font-bold text-text-primary border-b-2 border-transparent">En Güncel Yorum Akışı</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* En yeni yorumlardan bir vitrin oluşturmak için örneğin ilk 9 tanesini gösterelim */}
        {sortedReviews.slice(0, 9).map((review: any, index: number) => (
          <div key={`${review.id}-${index}`} className="bg-white/5 border border-border-subtle hover:bg-white/10 transition-colors duration-300 rounded-lg p-5 flex flex-col relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-2">
                <p className="text-sm font-semibold text-text-primary capitalize truncate" title={review.author}>
                  {review.author}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-[10px] font-bold text-text-secondary bg-bg-deep px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {review.platform}
                  </span>
                  <span className="text-xs text-text-secondary ml-2">
                    {new Date(review.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center text-warning flex-shrink-0 bg-[#d29922]/10 px-1.5 py-1 rounded-md">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-[#d29922]' : 'text-border-subtle fill-transparent'}`} 
                  />
                ))}
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-sm text-text-secondary italic leading-relaxed line-clamp-4 relative z-10 group-hover:text-text-primary transition-colors">
                "{review.text}"
              </p>
            </div>
            
            {/* Dekoratif Tırnak İzi */}
            <div className="absolute bottom-4 right-4 text-7xl font-serif text-white/5 opacity-50 select-none pointer-events-none transform translate-y-4">
              "
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
