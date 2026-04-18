import { Hotel, PlatformName, Channel, Review, HotelType } from '../types';

const platforms: PlatformName[] = [
  'Google', 'Holidaycheck', 'TripAdvisor', 
  'Tophotels', 'Otelpuan', 'Booking.com', 'Check24'
];

const sampleReviewsPool = [
  { text: "Muhteşem bir tatildi, personelin ilgisi harikaydı, herkese tavsiye ederim.", rating: 5 },
  { text: "Yemek çeşitliliği ve lezzeti çok iyiydi ama odaların temizliği bir tık daha iyi olabilirdi.", rating: 4 },
  { text: "Konumu harika, merkeze ve denize çok yakın. Fiyat performans olarak kesinlikle çok başarılı.", rating: 5 },
  { text: "Wifi çekmiyor, animasyon ekibi yetersizdi çok sıkıldık.", rating: 2 },
  { text: "Denizi biraz dalgalı ve taşlıydı, genel olarak ortalama bir deneyimdi.", rating: 3 },
  { text: "Otel eski ve bakımsız duruyor, resimlerdeki gibi değil. Tavsiye etmiyorum.", rating: 1 },
  { text: "Çocuklu aileler için birebir, çocuk kulübü efsane çalışıyor.", rating: 5 },
  { text: "Resepsiyondaki karşılama soğuktu ama genel temizlik çok iyiydi.", rating: 4 },
];

const authors = ["Ahmet Y.", "Mehmet K.", "Ayşe T.", "Fatma S.", "Ali C.", "Ceren L.", "Hakan B.", "Deniz M."];

// Rastgele sayı üreteci yardımcı fonksiyon
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Rastgeleyorum oluşturucu
const generateReviews = (count: number, baseRating: number): Review[] => {
  const reviews: Review[] = [];
  for (let i = 0; i < count; i++) {
    // baseRating etrafında gerçeğe yakın ağırlıklı puanlar(±1)
    const ratingPool = sampleReviewsPool.filter(r => Math.abs(r.rating - baseRating) <= 1 || r.rating === baseRating);
    const template = ratingPool[getRandomInt(0, ratingPool.length - 1)] || sampleReviewsPool[0];
    
    reviews.push({
      id: `rev-${Math.random().toString(36).substr(2, 9)}`,
      author: authors[getRandomInt(0, authors.length - 1)],
      text: template.text,
      rating: template.rating,
      date: new Date(Date.now() - getRandomInt(0, 10000000000)).toISOString()
    });
  }
  return reviews;
};

// Hotel oluşturucu
const createHotelData = (id: string, name: string, type: HotelType, baseScoreAvg: number): Hotel => {
  const channels = {} as Record<PlatformName, Channel>;

  platforms.forEach(platform => {
    // Her plaform için ufak sapmalar ekleyelim (örneğin Holidaycheck'te biraz daha düşüktür vs.)
    const scoreModifier = (Math.random() * 0.6) - 0.3; // -0.3 ile +0.3 arası
    let currentScore = Number(Math.min(5, Math.max(1, baseScoreAvg + scoreModifier)).toFixed(1));
    const totalReviews = getRandomInt(150, 2500);
    const recentReviews = generateReviews(5, Math.round(currentScore)); // 5 son yorumu örnek olarak dönüyoruz

    channels[platform] = {
      platformName: platform,
      aggregatedStats: {
        currentScore,
        totalReviews
      },
      reviews: recentReviews
    };
  });

  return { id, name, type, channels };
};

// Kendi otellerimiz ve Rakipler
export const mockHotels: Hotel[] = [
  createHotelData('hotel-a', 'Otel A (Owned)', 'Owned', 4.5),
  createHotelData('hotel-b', 'Otel B (Owned)', 'Owned', 4.1),
  createHotelData('hotel-x', 'Rakip X Hotel', 'Competitor', 4.6),
  createHotelData('hotel-y', 'Rakip Y Resort', 'Competitor', 3.8)
];
