import { UserRole } from '../types/guardrails';

export interface RolePermissions {
  canModifyConfiguration: boolean;
  canDeleteRules: boolean;
  canPauseActivateRules: boolean;
  canCreateRules: boolean;
  canReviewAnomalies: boolean;
  canPerformBulkActions: boolean;
  canRunEvals: boolean;
  canViewGuardrailActivity: boolean;
  isReadOnly: boolean;
}

export function getRolePermissions(role: UserRole): RolePermissions {
  switch (role) {
    case 'Admin':
      return {
        canModifyConfiguration: true,
        canDeleteRules: true,
        canPauseActivateRules: true,
        canCreateRules: true,
        canReviewAnomalies: true,
        canPerformBulkActions: true,
        canRunEvals: true,
        canViewGuardrailActivity: true,
        isReadOnly: false,
      };

    case 'Finance Manager':
      return {
        canModifyConfiguration: false,
        canDeleteRules: false,
        canPauseActivateRules: false,
        canCreateRules: true,
        canReviewAnomalies: true,
        canPerformBulkActions: true,
        canRunEvals: true,
        canViewGuardrailActivity: true,
        isReadOnly: false,
      };

    case 'Viewer':
    default:
      return {
        canModifyConfiguration: false,
        canDeleteRules: false,
        canPauseActivateRules: false,
        canCreateRules: false,
        canReviewAnomalies: false,
        canPerformBulkActions: false,
        canRunEvals: false,
        canViewGuardrailActivity: false,
        isReadOnly: true,
      };
  }
}

export function getActionRestrictionReason(
  action: 'config' | 'delete_rule' | 'toggle_rule' | 'create_rule' | 'review' | 'bulk_action' | 'evals',
  role: UserRole
): string {
  if (role === 'Viewer') {
    return 'Action disabled: Viewer role has read-only access. Switch role to Finance Manager or Admin in the dev toolbar.';
  }

  if (role === 'Finance Manager') {
    if (action === 'config') {
      return 'Action disabled: Global Anomaly Configuration can only be modified by the Admin role.';
    }
    if (action === 'delete_rule' || action === 'toggle_rule') {
      return 'Action disabled: Deleting or toggling production rules requires Admin privileges.';
    }
  }

  return 'Action restricted by enterprise role policies.';
}
