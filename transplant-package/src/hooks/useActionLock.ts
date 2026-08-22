import { useApp } from '@/context/AppContext';
import { isAccountReadOnly } from '@/utils/routeUtils';
import { toast } from 'sonner';

export function useActionLock() {
  const { user } = useApp();
  const isReadOnly = isAccountReadOnly(user);

  const withActionLock = <T extends (...args: any[]) => any>(
    action: T,
    message = "Action unavailable: Your subscription has expired. Please renew to perform this action."
  ) => {
    return ((...args: Parameters<T>) => {
      if (isReadOnly) {
        toast.error(message);
        return;
      }
      return action(...args);
    }) as T;
  };

  return { isReadOnly, withActionLock };
}
