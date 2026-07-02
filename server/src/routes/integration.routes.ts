import { Router } from 'express';
import { IntegrationController } from '../controllers/integration.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// OAuth callbacks usually don't have Authorization headers because they are redirects from the provider.
// The state parameter handles the security check.
router.get('/slack/callback', IntegrationController.slackCallback);

// All other routes require authentication
router.use(authenticate);

router.get('/', IntegrationController.listIntegrations);
router.delete('/:id', IntegrationController.disconnectIntegration);

router.get('/slack/install', IntegrationController.slackInstall);

router.get('/:id/resources', IntegrationController.getProviderResources);

router.post('/:id/mappings', IntegrationController.addMapping);
router.delete('/:id/mappings/:mappingId', IntegrationController.removeMapping);

export default router;
