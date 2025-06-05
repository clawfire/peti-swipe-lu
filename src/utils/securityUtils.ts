
import { toast } from "@/components/ui/use-toast";

export interface SecurityError {
  code?: string;
  message?: string;
  details?: string;
}

export const handleSecurityError = (error: SecurityError): void => {
  console.error('Security error detected:', error);
  
  switch (error.code) {
    case 'PGRST301':
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this resource.",
        variant: "destructive",
      });
      break;
      
    case '42501':
      toast({
        title: "Security Policy Violation",
        description: "This operation violates security policies and cannot be completed.",
        variant: "destructive",
      });
      break;
      
    case 'RLS_VIOLATION':
      toast({
        title: "Row Level Security Violation",
        description: "Access to this data is restricted by security policies.",
        variant: "destructive",
      });
      break;
      
    case 'RATE_LIMIT_EXCEEDED':
      toast({
        title: "Rate Limit Exceeded",
        description: "Too many requests. Please wait before trying again.",
        variant: "destructive",
      });
      break;
      
    case 'DELETE_BLOCKED':
      toast({
        title: "Delete Operation Blocked",
        description: "Delete operations are not permitted for security reasons.",
        variant: "destructive",
      });
      break;
      
    default:
      toast({
        title: "Security Error",
        description: error.message || "A security-related error occurred.",
        variant: "destructive",
      });
  }
};

export const logSecurityEvent = (event: string, details?: Record<string, any>): void => {
  console.log(`[SECURITY EVENT] ${event}`, details);
  
  // In a production environment, you might want to send this to a security monitoring service
  // For now, we'll just log it to the console for debugging purposes
};

export const validateSecureOperation = (operation: string): boolean => {
  const allowedOperations = ['SELECT', 'INSERT', 'UPDATE'];
  
  if (!allowedOperations.includes(operation.toUpperCase())) {
    logSecurityEvent('BLOCKED_OPERATION_ATTEMPT', { operation });
    return false;
  }
  
  return true;
};
