import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Globe, TrendingUp, TrendingDown, Minus, Bookmark, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NewsTimelineProps {
  filters: {
    category: string;
    companies: string[];
    dateRange: string;
    language: string;
  };
}

export function NewsTimeline({ filters }: NewsTimelineProps) {
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(0);
  const limit = 10;

  const { data: articles = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/articles', { 
      category: filters.category, 
      companyId: filters.companies[0], // Simplified for demo
      limit, 
      offset: page * limit 
    }],
  });

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-warning" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-destructive';
      default:
        return 'text-warning';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Latest Industry News</h2>
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Latest Industry News</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="sentiment">Sentiment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {articles.map((article: any) => (
          <Card key={article.id} className="border-border hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <article className="flex items-start space-x-4">
                <img
                  src={article.imageUrl || `https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=100&h=100&fit=crop`}
                  alt="Article thumbnail"
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  data-testid={`article-image-${article.id}`}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {article.isBreaking && (
                      <Badge variant="destructive" className="text-xs font-medium">
                        BREAKING
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs font-medium">
                      {article.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground" data-testid={`article-time-${article.id}`}>
                      {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2 leading-tight" data-testid={`article-title-${article.id}`}>
                    {article.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2" data-testid={`article-summary-${article.id}`}>
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {article.company && (
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          <span data-testid={`article-company-${article.id}`}>{article.company.name}</span>
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        <span>Japan</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`flex items-center space-x-1 ${getSentimentColor(article.sentiment || 'neutral')}`}>
                        {getSentimentIcon(article.sentiment || 'neutral')}
                        <span className="text-sm font-medium capitalize" data-testid={`article-sentiment-${article.id}`}>
                          {article.sentiment || 'Neutral'}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" data-testid={`button-bookmark-${article.id}`}>
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-share-${article.id}`}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center pt-4">
        <Button 
          variant="outline" 
          onClick={() => setPage(page + 1)}
          data-testid="button-load-more"
        >
          Load More Articles
        </Button>
      </div>
    </div>
  );
}
