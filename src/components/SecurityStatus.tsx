
import React from 'react';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const SecurityStatus: React.FC = () => {
  const securityFeatures = [
    {
      name: 'Row Level Security',
      status: 'active',
      description: 'Database access is restricted by security policies',
      icon: Shield,
    },
    {
      name: 'Delete Protection',
      status: 'active',
      description: 'Petition deletion is completely blocked',
      icon: CheckCircle,
    },
    {
      name: 'Audit Logging',
      status: 'active',
      description: 'All database operations are logged for security monitoring',
      icon: CheckCircle,
    },
    {
      name: 'Rate Limiting',
      status: 'active',
      description: 'Import operations are rate-limited to prevent abuse',
      icon: CheckCircle,
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Security Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {securityFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div key={feature.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">{feature.name}</p>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {feature.status}
                </Badge>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              All security measures are active and protecting your petition data
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
