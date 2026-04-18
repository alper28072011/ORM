import { Router } from 'express';
import { getReviews } from '../controllers/reviewsController.ts'; 

const router = Router();

// RESTful Endpoint: 
// Dinamik platform parametresiyle hem POST hem GET olarak alınabilir.
// Örnek istek: GET /api/reviews?platform=Google&url=https://maps...
router.get('/reviews', getReviews);
router.post('/reviews', getReviews);

export default router;
