import puppeteer from 'puppeteer';
import { Channel, Review } from '../../types';

// Olası relative tarih dizgilerini ("2 gün önce", "1 month ago") yaklaşık ISO formatına çeviren çok dilli basit bir araç.
const parseRelativeDate = (dateStr: string): string => {
  const now = new Date();
  const lowerStr = dateStr.toLowerCase();
  
  // Rakamı ayıkla (e.g. "2" from "2 weeks ago")
  const match = lowerStr.match(/(\d+)/);
  const num = match ? parseInt(match[1], 10) : 1;
  const isA = lowerStr.includes(' bir') || lowerStr.includes(' a ') || lowerStr.includes(' an ');
  const multiplier = match ? num : (isA ? 1 : 0);

  if (lowerStr.includes('yıl') || lowerStr.includes('year')) now.setFullYear(now.getFullYear() - multiplier);
  else if (lowerStr.includes('ay') || lowerStr.includes('month')) now.setMonth(now.getMonth() - multiplier);
  else if (lowerStr.includes('hafta') || lowerStr.includes('week')) now.setDate(now.getDate() - (multiplier * 7));
  else if (lowerStr.includes('gün') || lowerStr.includes('day')) now.setDate(now.getDate() - multiplier);
  else if (lowerStr.includes('saat') || lowerStr.includes('hour')) now.setHours(now.getHours() - multiplier);
  
  return now.toISOString();
};

export const scrapeGoogleMapsReviews = async (placeUrl: string): Promise<Channel> => {
  console.log(`[Scraper] Puppeteer başlatılıyor. Hedef: ${placeUrl}`);
  
  // Puppeteer sunucu (Linux/Docker vb.) üzerinde çalışırken Sandbox hataları vermemesi için
  // özel argümanlarla başlatılmalıdır.
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Gerçek bir kullanıcı gibi görünmek için User Agent ve Viewport bypass
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
    });

    console.log('[Scraper] Sayfaya gidiliyor...');
    // Sayfanın temel render işlemlerini tamamlaması için networkidle2 bekliyoruz
    await page.goto(placeUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Çerez kabul penceresi gibi (Özellikle AB ülkeleri için "Kabul Ediyorum" butonu) şeyleri aşmak için kısa bir süre bekleyelim
    await new Promise(r => setTimeout(r, 2000));

    // Çerez onayı butonu ("Tümünü kabul et" vs.) çıkarsa tıklamayı deneyelim
    const acceptCookiesClass = '.VfPpkd-LgbsSe';
    try {
      if (await page.$(acceptCookiesClass)) {
         await page.click(acceptCookiesClass);
         await new Promise(r => setTimeout(r, 1000));
      }
    } catch (e) {
      // Bulunamazsa sorun değil, devam et
    }

    // 1. TOPLAM SKOR VE YORUM SAYISINI AL
    // Google Haritalar genellikle bu bilgileri `F7nice` gibi dinamik class'larla tutar. Ancak en güvenlisi
    // aria-label okumak veya spesifik font boyutlu tag'leri bulmaktır.
    
    console.log('[Scraper] İstatistikler okunuyor...');
    const stats = await page.evaluate(() => {
      let currentScore = 0;
      let totalReviews = 0;

      // Genellikle "4,5" gibi büyük fontlu bir div bulunur.
      const scoreElement = document.querySelector('div.fontDisplayLarge');
      if (scoreElement) {
         currentScore = parseFloat(scoreElement.textContent?.replace(',', '.') || '0');
      }

      // Yıldızların hemen sağında (veya altında) "1.245 yorum" yazar.
      // Button tagleri içinde de yorum sayıları yer alabilir.
      const reviewButton = Array.from(document.querySelectorAll('button')).find(el => el.textContent?.includes('yorum') || el.textContent?.includes('reviews'));
      if (reviewButton) {
         const numericMatch = reviewButton.textContent?.replace(/\./g, '').replace(/,/g, '').match(/\d+/);
         if (numericMatch) {
            totalReviews = parseInt(numericMatch[0], 10);
         }
      }

      return { currentScore, totalReviews };
    });

    // 2. YORUMLAR SEKMESİNE TIKLA (Daha fazla veri çekmek için)
    // Sadece "Yorumlar" veya "Reviews" yazan sekmeye tıklamaya çalışalım
    try {
      const tabs = await page.$$('.mkH55'); // Google Maps tab ikonlarını barındıran genelde bu node'dur
      for (const tab of tabs) {
        const text = await page.evaluate(el => el.textContent, tab);
        if (text && (text.includes('Yorumlar') || text.includes('Reviews'))) {
          await tab.click();
          await new Promise(r => setTimeout(r, 3000)); // İçeriğin gelmesini bekle
          break;
        }
      }
    } catch (e) {
      console.log('[Scraper] Yorum sekmesi bulunamadı veya tıklanamadı. Mevcut sayfa taranıyor...');
    }

    // 3. YORUMLARI AYIKLA
    console.log('[Scraper] Yorum içerikleri okunuyor...');
    const rawReviews = await page.evaluate(() => {
      const reviewElements = document.querySelectorAll('.jJc8Def'); // Yorum container'ının potansiyel class'ı (sık değişir)
      const extracted = [];
      
      // Fallback stratejisi: Her şeyi içeren daha geniş bir div ararız
      const reviewContainers = document.querySelectorAll('div[data-review-id]');

      for (const container of reviewContainers) {
        // İsim (Yazar)
        const authorEl = container.querySelector('.d4r55');
        const author = authorEl ? authorEl.textContent : 'Bilinmeyen Kullanıcı';
        
        // Puan
        const ratingEl = container.querySelector('span[aria-label*="yıldız"], span[aria-label*="stars"]');
        let rating = 5;
        if (ratingEl) {
          const match = ratingEl.getAttribute('aria-label')?.match(/\d+/);
          if (match) rating = parseInt(match[0], 10);
        }

        // Metin
        const textEl = container.querySelector('.wiI7pd');
        const text = textEl ? textEl.textContent : '';

        // Tarih ("2 hafta önce")
        const dateEl = container.querySelector('.rsqaWe');
        const dateStr = dateEl ? dateEl.textContent : '1 gün önce';

        if (text && text.trim().length > 0) {
           extracted.push({ author, rating, text, dateStr, id: container.getAttribute('data-review-id') });
        }
      }
      return extracted;
    });

    // Node tarafında tarihleri ISO formatına çevirelim ve Channel type'ına mapleyelim
    const reviews: Review[] = rawReviews.slice(0, 50).map(r => ({
      id: r.id || `rev-${Math.random().toString(36).substr(2, 9)}`,
      author: r.author || 'Gizli Yorumcu',
      rating: r.rating,
      text: r.text || '',
      date: parseRelativeDate(r.dateStr || 'yeni')
    }));

    await browser.close();

    // Verilerin çekilemeyip boş gelmesi durumuna karşı fallback koruması
    if (stats.totalReviews === 0 && reviews.length === 0) {
      throw new Error('Sayfa yüklendi fakat Google Maps yapısal değişikliğe gittiği için veriler dom üzerinde bulunamadı.');
    }

    return {
      platformName: 'Google',
      aggregatedStats: {
        currentScore: stats.currentScore || 5.0,
        totalReviews: stats.totalReviews || reviews.length
      },
      reviews
    };

  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
};
