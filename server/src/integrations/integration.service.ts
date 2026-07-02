import prisma from '../config/prisma';
import { providerRegistry } from './registry';
import { CryptoService } from '../services/crypto.service';
import { IntegrationResult, LifecycleContext, LifecycleAction, EmployeeInfo, OrganizationInfo } from './types';
import { JobStatus, Integration, IntegrationMapping } from '@prisma/client';

type IntegrationWithMappings = Integration & { mappings: IntegrationMapping[] };

export class IntegrationService {
  private static readonly MAX_RETRIES = 2; // Kept 1-2 fast retries as requested
  private static readonly RETRY_DELAY_MS = 1000;

  static async runPipeline(params: {
    employeeId: string;
    organizationId: string;
    action: LifecycleAction;
    providerFilter?: string;
    excludeProviders?: string[];
  }): Promise<IntegrationResult[]> {
    const { employee, organization } = await this.loadEntities(params.employeeId, params.organizationId);
    const integrations = await this.resolveIntegrations(params, employee.department);

    const results: IntegrationResult[] = [];
    
    for (const integration of integrations) {
      const result = await this.executeProvider(integration, employee, organization, params.action);
      results.push(result);
    }
    
    return results;
  }

  private static async loadEntities(employeeId: string, organizationId: string): Promise<{ employee: EmployeeInfo; organization: OrganizationInfo }> {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    const organization = await prisma.organization.findUnique({ where: { id: organizationId } });

    if (!employee || !organization) {
      throw new Error('Employee or Organization not found');
    }

    return {
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        personalEmail: employee.personalEmail,
        department: employee.department
      },
      organization: {
        id: organization.id,
        name: organization.name
      }
    };
  }

  private static async resolveIntegrations(
    params: { organizationId: string; providerFilter?: string; excludeProviders?: string[] },
    department: string
  ): Promise<IntegrationWithMappings[]> {
    const { organizationId, providerFilter, excludeProviders = [] } = params;
    
    const whereClause: any = {
      organizationId,
      isActive: true,
    };

    if (providerFilter) {
      whereClause.provider = providerFilter;
    } else if (excludeProviders.length > 0) {
      whereClause.provider = { notIn: excludeProviders };
    }

    return await prisma.integration.findMany({
      where: whereClause,
      include: {
        mappings: {
          where: { department }
        }
      }
    });
  }

  private static decryptToken(integration: Integration): string | null {
    try {
      return CryptoService.decrypt({
        encrypted: integration.encryptedKey,
        iv: integration.iv,
        authTag: integration.authTag
      });
    } catch (err) {
      console.error(`[IntegrationService] Failed to decrypt token for ${integration.provider}`);
      return null;
    }
  }

  private static buildContext(
    employee: EmployeeInfo, 
    organization: OrganizationInfo, 
    integration: IntegrationWithMappings, 
    action: LifecycleAction
  ): LifecycleContext {
    return {
      action,
      employee,
      organization,
      mappings: integration.mappings
    };
  }

  private static async executeProvider(
    integration: IntegrationWithMappings,
    employee: EmployeeInfo,
    organization: OrganizationInfo,
    action: LifecycleAction
  ): Promise<IntegrationResult> {
    const provider = providerRegistry.get(integration.provider);
    
    if (!provider) {
      console.warn(`[IntegrationService] Provider ${integration.provider} not registered.`);
      return {
        success: false,
        provider: integration.provider,
        message: 'Provider not registered',
        retryable: false
      };
    }

    const token = this.decryptToken(integration);
    if (!token) {
      return {
        success: false,
        provider: integration.provider,
        message: 'Failed to decrypt integration token',
        retryable: false
      };
    }

    const context = this.buildContext(employee, organization, integration, action);

    let attempt = 0;
    let result: IntegrationResult = {
        success: false,
        provider: provider.name,
        message: 'Unknown error',
        retryable: false
    };
    
    do {
      attempt++;
      try {
        if (action === 'ONBOARD') {
          result = await provider.onboard(context, token);
        } else {
          result = await provider.offboard(context, token);
        }
      } catch (error: any) {
        result = {
          success: false,
          provider: provider.name,
          message: error.message || 'Unhandled provider error',
          retryable: true
        };
      }

      if (result.success || !result.retryable || attempt >= this.MAX_RETRIES) {
        break;
      }

      await new Promise(res => setTimeout(res, this.RETRY_DELAY_MS * attempt));
    } while (attempt < this.MAX_RETRIES);

    await this.logResult(result, employee.id, action, attempt);

    return result;
  }

  private static async logResult(result: IntegrationResult, employeeId: string, action: LifecycleAction, attempt: number): Promise<void> {
    await prisma.integrationLog.create({
      data: {
        employeeId,
        provider: result.provider,
        action,
        status: result.success ? JobStatus.SUCCESS : JobStatus.FAILED,
        message: result.message,
        retryCount: attempt - 1
      }
    });
  }
}
