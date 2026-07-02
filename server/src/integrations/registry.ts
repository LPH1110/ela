import { IntegrationProvider } from './types';

class ProviderRegistry {
  private providers = new Map<string, IntegrationProvider>();

  register(provider: IntegrationProvider) { 
    this.providers.set(provider.name, provider); 
  }
  
  get(name: string) { 
    return this.providers.get(name); 
  }
  
  getAll() { 
    return Array.from(this.providers.values()); 
  }
}

export const providerRegistry = new ProviderRegistry();
