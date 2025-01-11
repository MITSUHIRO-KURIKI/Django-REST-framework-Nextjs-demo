// sonner
import { toast } from 'sonner';
export interface SonnerOptions {
  position?:
    | 'top-center'
    | 'top-left'
    | 'top-right'
    | 'bottom-center'
    | 'bottom-left'
    | 'bottom-right';
  duration?: number;
};
// defaultOptions
const defaultOptions: Record<'success' | 'info' | 'warning' | 'error', SonnerOptions> = {
  success: {
    position: 'bottom-right',
    duration: 1500,
  },
  info: {
    position: 'bottom-right',
    duration: 3000,
  },
  warning: {
    position: 'top-center',
    duration: 3000,
  },
  error: {
    position: 'top-center',
    duration: 3000,
  },
};

// showToast
export function showToast( type?: string, message?: string, userOptions?: SonnerOptions,): void {
  const setType = type === 'success' || type === 'info' || type === 'warning' || type === 'error' ;
  const baseOptions = setType ? defaultOptions[type as 'success' | 'info' | 'warning' | 'error'] : {};
  const mergedOptions: SonnerOptions = {
    ...baseOptions,
    ...userOptions,
  };   // タイプ別デフォルトを取得し、ユーザー指定があればマージ

  switch (type) {
    case 'success':
      toast.success(message, mergedOptions);
      break;
    case 'info':
      toast.info(message, mergedOptions);
      break;
    case 'warning':
      toast.warning(message, mergedOptions);
      break;
    case 'error':
      toast.error(message, mergedOptions);
      break;
    default:
      toast(message)
      break;
  };
};