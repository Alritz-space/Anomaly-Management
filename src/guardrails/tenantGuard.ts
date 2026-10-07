export const DEFAULT_TENANT_ID = 'tenant-corp-acme-01';

export function validateTenantAccess(
  itemTenantId: string | undefined,
  activeTenantId: string = DEFAULT_TENANT_ID
): {
  isAllowed: boolean;
  reason?: string;
} {
  // If item doesn't specify tenant, assume default tenant
  const effectiveItemTenant = itemTenantId || DEFAULT_TENANT_ID;

  if (effectiveItemTenant !== activeTenantId) {
    return {
      isAllowed: false,
      reason: `Tenant Isolation Guardrail: Security violation! Access attempt to foreign tenant data "${effectiveItemTenant}" from active tenant session "${activeTenantId}" was blocked.`,
    };
  }

  return { isAllowed: true };
}
