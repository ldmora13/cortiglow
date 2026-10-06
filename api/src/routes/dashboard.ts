import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import apicache from 'apicache';

const router = Router();
const cache = apicache.middleware;

router.get('/summary', cache('5 minutes'), dashboardController.getSummary);
router.get('/sales', cache('5 minutes'), dashboardController.getSales);
router.get('/top-products', cache('10 minutes'), dashboardController.getTopProducts);
router.get('/low-stock', cache('3 minutes'), dashboardController.getLowStock);
router.get('/sales-by-payment', cache('5 minutes'), dashboardController.getSalesByPayment);
router.get('/orders-by-status', cache('5 minutes'), dashboardController.getOrdersByStatus);
router.get('/recent-activity', cache('1 minute'), dashboardController.getRecentActivity);
router.get('/export', dashboardController.exportData);

export default router;
