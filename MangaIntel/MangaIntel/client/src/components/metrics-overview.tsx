import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, AlertTriangle, TrendingUp, Rss } from "lucide-react";

interface Analytics {
  articles?: { total?: number; today?: number; weekGrowth?: number };
  marketSentiment?: { percentage?: number };
}

export function MetricsOverview() {
  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ['/api/analytics/stats'],
  });

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </section>
    );
  }

  const metrics = [
    {
      title: "Total Articles",
      value: analytics?.articles?.total || 0,
      change: `+${analytics?.articles?.weekGrowth || 0}% from last week`,
      changeType: "positive" as const,
      icon: Newspaper,
      bgColor: "bg-blue-100 dark:bg-blue-950",
      iconColor: "text-primary"
    },
    {
      title: "Critical Alerts", 
      value: 15,
      change: "+3 new today",
      changeType: "warning" as const,
      icon: AlertTriangle,
      bgColor: "bg-orange-100 dark:bg-orange-950",
      iconColor: "text-accent"
    },
    {
      title: "Market Sentiment",
      value: `${analytics?.marketSentiment?.percentage || 72}%`,
      change: "Positive trend",
      changeType: "positive" as const,
      icon: TrendingUp,
      bgColor: "bg-green-100 dark:bg-green-950",
      iconColor: "text-success"
    },
    {
      title: "Data Sources",
      value: 28,
      change: "All active",
      changeType: "neutral" as const,
      icon: Rss,
      bgColor: "bg-purple-100 dark:bg-purple-950",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground" data-testid={`metric-title-${index}`}>
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground" data-testid={`metric-value-${index}`}>
                    {metric.value}
                  </p>
                  <p className={`text-sm flex items-center mt-1 ${
                    metric.changeType === 'positive' 
                      ? 'text-success' 
                      : metric.changeType === 'warning' 
                      ? 'text-warning' 
                      : 'text-muted-foreground'
                  }`}>
                    {metric.changeType !== 'neutral' && (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    )}
                    {metric.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${metric.iconColor} h-6 w-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
