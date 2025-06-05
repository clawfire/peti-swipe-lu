
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, X, Eye } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";

const SecurityAlert = () => {
  const { data: auditLogs } = useAuditLog();
  const [isVisible, setIsVisible] = useState(false);
  const [alertType, setAlertType] = useState<'delete' | 'suspicious' | null>(null);

  useEffect(() => {
    if (auditLogs && auditLogs.length > 0) {
      const recentLogs = auditLogs.filter(log => 
        new Date(log.timestamp) > new Date(Date.now() - 10 * 60 * 1000) // Last 10 minutes
      );
      
      const deleteAttempts = recentLogs.filter(log => log.operation === 'DELETE');
      
      if (deleteAttempts.length > 0) {
        setAlertType('delete');
        setIsVisible(true);
      } else if (recentLogs.length > 20) {
        setAlertType('suspicious');
        setIsVisible(true);
      }
    }
  }, [auditLogs]);

  if (!isVisible || !alertType) return null;

  const getAlertContent = () => {
    switch (alertType) {
      case 'delete':
        return {
          title: "Security Alert: Delete Attempt Blocked",
          description: "An unauthorized delete operation was attempted and blocked by our security system.",
          icon: <Shield className="w-4 h-4" />
        };
      case 'suspicious':
        return {
          title: "Security Notice: High Activity Detected",
          description: "Unusually high activity detected. All operations are being monitored.",
          icon: <Eye className="w-4 h-4" />
        };
    }
  };

  const content = getAlertContent();

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {content.icon}
          <div>
            <div className="font-medium">{content.title}</div>
            <AlertDescription className="mt-1">
              {content.description}
            </AlertDescription>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="h-auto p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Alert>
  );
};

export default SecurityAlert;
