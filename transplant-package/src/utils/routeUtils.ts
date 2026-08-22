export function getAccountRecoveryRoute(user: any): string {
  if (!user) return '/';

  const subscriptionExpired =
    !user.subscriptionExpiresAt || new Date(user.subscriptionExpiresAt) < new Date();
    
  const isScheduledForDeletion = user.isDeleted === true;

  // Deleted account with still-active subscription = free recovery
  if (isScheduledForDeletion && !subscriptionExpired) {
    return '/reactivate-free';
  }

  // Expired subscription (whether deleted or not) = must pay to renew
  if (subscriptionExpired) {
    return '/renew-subscription';
  }

  // Active account, active subscription = go to dashboard
  return '/dashboard';
}

export function isAccountReadOnly(user: any): boolean {
  if (!user) return true;
  if (user.isDeactivated) return true;
  
  // If subscription has expired, they are in read-only mode (even during the 72h grace period)
  if (!user.subscriptionExpiresAt) return true;
  return new Date(user.subscriptionExpiresAt) < new Date();
}
