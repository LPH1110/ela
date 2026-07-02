import { providerRegistry } from '../registry';
import { SlackProvider } from './slack.provider';

// Register all providers
export const initProviders = () => {
  providerRegistry.register(new SlackProvider());
  // Future providers:
  // providerRegistry.register(new GitHubProvider());
};
