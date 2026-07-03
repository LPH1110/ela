import { Router } from 'express';
import { IntegrationController } from '../controllers/integration.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/slack/callback', IntegrationController.slackCallback);

router.use(authenticate);

router.get('/', IntegrationController.listIntegrations);
router.delete('/:id', requireRole('OWNER'), IntegrationController.disconnectIntegration);

router.get('/slack/install', requireRole('OWNER'), IntegrationController.slackInstall);

router.get('/:id/resources', IntegrationController.getProviderResources);

router.post('/:id/mappings', IntegrationController.addMapping);
router.delete('/:id/mappings/:mappingId', IntegrationController.removeMapping);

export default router;
