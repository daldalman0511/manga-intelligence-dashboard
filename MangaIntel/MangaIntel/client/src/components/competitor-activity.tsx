import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart, Book } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function CompetitorActivity() {
  const { data: articles = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/articles', { category: 'competitor', limit: 3 }],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Competitor Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCompanyIcon = (companyName: string) => {
    if (companyName?.toLowerCase().includes('line')) return TrendingUp;
    if (companyName?.toLowerCase().includes('piccoma')) return PieChart;
    return Book;
  };

  const getCompanyColor = (companyName: string) => {
    if (companyName?.toLowerCase().includes('line')) return 'bg-blue-100 dark:bg-blue-950 text-primary';
    if (companyName?.toLowerCase().includes('piccoma')) return 'bg-orange-100 dark:bg-orange-950 text-accent';
    return 'bg-green-100 dark:bg-green-950 text-success';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Competitor Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.map((activity: any) => {
            const Icon = getCompanyIcon(activity.company?.name || '');
            return (
              <div key={activity.id} className="flex items-center space-x-3" data-testid={`competitor-activity-${activity.id}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getCompanyColor(activity.company?.name || '')}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground" data-testid={`activity-company-${activity.id}`}>
                    {activity.company?.name || 'Unknown Company'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate" data-testid={`activity-description-${activity.id}`}>
                    {activity.summary?.substring(0, 50) || 'No description'}...
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`activity-time-${activity.id}`}>
                    {formatDistanceToNow(new Date(activity.publishedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
