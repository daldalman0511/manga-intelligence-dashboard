import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function AlertsWidget() {
  const queryClient = useQueryClient();
  
  const { data: alerts = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/alerts', { unread: true }],
  });

  const markAsReadMutation = useMutation({
    mutationFn: (alertId: string) => apiRequest('PATCH', `/api/alerts/${alertId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Active Alerts
            <Button variant="ghost" size="sm">Manage</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="text-destructive mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="text-warning mt-0.5" />;
      default:
        return <Info className="text-info mt-0.5" />;
    }
  };

  const getAlertTextColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-destructive';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-info';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Active Alerts
          <Button variant="ghost" size="sm" data-testid="button-manage-alerts">
            Manage
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active alerts
            </p>
          ) : (
            alerts.slice(0, 3).map((alert: any) => (
              <div 
                key={alert.id} 
                className={`p-3 border rounded-lg cursor-pointer transition-opacity ${getAlertStyle(alert.type)} ${
                  alert.isRead ? 'opacity-50' : ''
                }`}
                onClick={() => !alert.isRead && markAsReadMutation.mutate(alert.id)}
                data-testid={`alert-${alert.id}`}
              >
                <div className="flex items-start space-x-2">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${getAlertTextColor(alert.type)}`} data-testid={`alert-title-${alert.id}`}>
                      {alert.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1" data-testid={`alert-message-${alert.id}`}>
                      {alert.message}
                    </p>
                    {alert.company && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.company.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
