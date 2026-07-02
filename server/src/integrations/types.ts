export interface EmployeeInfo {
  id: string;
  fullName: string;
  personalEmail: string;
  department: string;
}

export interface OrganizationInfo {
  id: string;
  name: string;
}

export interface ResourceMapping {
  resourceId: string;
  resourceName: string;
  resourceType: string;
}

export type LifecycleAction = 'ONBOARD' | 'OFFBOARD';

export interface LifecycleContext {
  action: LifecycleAction;
  employee: EmployeeInfo;
  organization: OrganizationInfo;
  mappings: ResourceMapping[];
}

export interface IntegrationResult {
  success: boolean;
  provider: string;
  message: string;
  retryable: boolean;
}

export interface ProviderResource {
  id: string;
  name: string;
  type: string; // "channel", "team", "project"
}

export interface IntegrationProvider {
  readonly name: string;
  onboard(ctx: LifecycleContext, token: string): Promise<IntegrationResult>;
  offboard(ctx: LifecycleContext, token: string): Promise<IntegrationResult>;
  validateConnection(token: string): Promise<boolean>;
  fetchResources(token: string): Promise<ProviderResource[]>;
}
