import { Request, Response } from 'express';
import { getScraperForPlatform } from '../services/scraperFactory.ts';
import { PlatformName } from '../../types';

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    // Esneklik açısından hem Query Params (GET: ?platform=...) hem de JSON Body (POST) destekliyoruz.
    const platform = (req.query.platform || req.body.platform) as PlatformName;
    const url = (req.query.url || req.body.url) as string;
    const placeId = (req.query.placeId || req.body.placeId) as string;

    if (!platform) {
       res.status(400).json({ error: 'Platform parametresi (?platform=Google) sağlanmalıdır.' });
       return;
    }

    if (!url && !placeId) {
       res.status(400).json({ error: 'Tesisin URL adresi veya Place ID bilgisi gönderilmelidir.' });
       return;
    }

    // Doğru URL'yi oluşturalım, eğer PlaceID geldiyse formata çevirelim.
    let targetUrl = url;
    if (!targetUrl && platform === 'Google' && placeId) {
      targetUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
    }

    console.log(`[Backend API] Factory tetiklendi. İstek: ${platform} -> Hedef: ${targetUrl || placeId}`);

    // Fabrikadan (Factory) stratejiyi çek ve işlet! 
    // Hangi fonksiyonun çalışacağını factory karar verir. Uygulama bağımlılıktan kurtulur.
    const scraperFunction = getScraperForPlatform(platform);
    const channelData = await scraperFunction(targetUrl, placeId);

    // Sonucu döndür
    res.json({
      success: true,
      message: `${platform} platformundan veri başarıyla çekildi.`,
      data: channelData
    });

  } catch (error) {
    const platform = req.query.platform || req.body.platform || 'Platform';
    console.error(`[Backend API] ${platform} verisi alınırken hata:`, error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    let userFriendlyError = `${platform} sayfasından veri çekilemedi.`;

    if (errorMessage.includes('INVALID_URL')) {
      userFriendlyError = 'Geçersiz Google Maps linki girdiniz, lütfen işletme profilinin ana linkini kullanın.';
      res.status(400).json({ success: false, error: userFriendlyError, details: errorMessage });
      return;
    }

    res.status(500).json({ 
      success: false,
      error: userFriendlyError,
      details: errorMessage
    });
  }
};

