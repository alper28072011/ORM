import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './src/server/routes/api.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser ve CORS yapılandırması
  app.use(cors());
  app.use(express.json());

  // Özel API rotalarımız (Frontend bu adreslere istek atacak)
  app.use('/api', apiRouter);

  // HealthCheck endpoint'i
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ORM Backend Service is running' });
  });

  // Eğer geliştirme (development) modundaysak Vite Middleware'ini başlat
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting Vite middleware for development...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Frontend isteklerini Vite'e devret
    app.use(vite.middlewares);
  } else {
    // Üretim (Production) modundaysa, build klasöründeki statik dosyaları servis et
    console.log('Serving static files for production...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // React Router gibi SPA (Single Page Application) yönlendirmeleri için fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running horizontally on http://0.0.0.0:${PORT}`);
    console.log(`📡 Backend API: http://localhost:${PORT}/api`);
  });
}

startServer();
