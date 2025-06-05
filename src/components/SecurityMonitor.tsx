
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Eye, Clock, AlertTriangle } from "lucide-react";
import { useAuditLog } from "@/hooks/useAuditLog";
import { formatDistanceToNow } from "date-fns";

const SecurityMonitor = () => {
  const { data: auditLogs, isLoading } = useAuditLog();
  const [securityStatus, setSecurityStatus] = useState<'secure' | 'warning' | 'alert'>('secure');

  useEffect(() => {
    if (auditLogs && auditLogs.length > 0) {
      // Check for suspicious patterns
      const recentLogs = auditLogs.filter(log => 
        new Date(log.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
      );
      
      const deleteAttempts = recentLogs.filter(log => log.operation === 'DELETE');
      
      if (deleteAttempts.length > 0) {
        setSecurityStatus('alert');
      } else if (recentLogs.length > 50) {
        setSecurityStatus('warning');
      } else {
        setSecurityStatus('secure');
      }
    }
  }, [auditLogs]);

  const getStatusColor = (status: typeof securityStatus) => {
    switch (status) {
      case 'secure': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'alert': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: typeof securityStatus) => {
    switch (status) {
      case 'secure': return <Shield className="w-4 h-4" />;
      case 'warning': return <Eye className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 animate-spin" />
          <span>Loading security status...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Monitor
          </h3>
          <Badge className={getStatusColor(securityStatus)}>
            {getStatusIcon(securityStatus)}
            {securityStatus.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {auditLogs?.length || 0}
            </div>
            <div className="text-sm text-blue-600">Total Events</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {auditLogs?.filter(log => log.operation !== 'DELETE').length || 0}
            </div>
            <div className="text-sm text-green-600">Safe Operations</div>
          </div>

          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {auditLogs?.filter(log => log.operation === 'DELETE').length || 0}
            </div>
            <div className="text-sm text-red-600">Blocked Deletes</div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h4>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {auditLogs?.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={log.operation === 'DELETE' ? 'destructive' : 'secondary'}>
                      {log.operation}
                    </Badge>
                    <span>Petition #{log.details?.petition_nbr || 'Unknown'}</span>
                  </div>
                  <span className="text-gray-500">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </span>
                </div>
              ))}
              {(!auditLogs || auditLogs.length === 0) && (
                <div className="text-center text-gray-500 py-4">
                  No security events recorded
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </Card>
  );
};

export default SecurityMonitor;
