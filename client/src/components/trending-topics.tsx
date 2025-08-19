import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TrendingTopics() {
  const { data: trends = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/trends'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trending Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getChangeColor = (change: number) => {
    if (change > 30) return 'bg-accent text-accent-foreground';
    if (change > 15) return 'bg-primary text-primary-foreground';
    if (change > 0) return 'bg-success text-success-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Trending Topics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trends.slice(0, 4).map((topic: any) => (
            <div key={topic.id} className="flex items-center justify-between" data-testid={`trending-topic-${topic.keyword}`}>
              <span className="text-sm font-medium text-foreground">
                #{topic.keyword}
              </span>
              <Badge className={`text-xs ${getChangeColor(topic.changePercentage || 0)}`}>
                +{topic.changePercentage || 0}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
