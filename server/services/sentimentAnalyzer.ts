import { storage } from "../storage";

export class SentimentAnalyzer {
  private positiveWords = [
    'success', 'growth', 'increase', 'expansion', 'partnership', 'collaboration',
    'innovative', 'breakthrough', 'launch', 'positive', 'excellent', 'strong'
  ];

  private negativeWords = [
    'decline', 'decrease', 'loss', 'failure', 'crisis', 'problem',
    'concern', 'negative', 'weak', 'poor', 'difficult', 'challenge'
  ];

  analyzeSentiment(text: string): { sentiment: string; score: number } {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (this.positiveWords.includes(word)) {
        score += 1;
      } else if (this.negativeWords.includes(word)) {
        score -= 1;
      }
    });

    // Normalize score to -100 to 100 range
    const normalizedScore = Math.max(-100, Math.min(100, score * 10));
    
    let sentiment = 'neutral';
    if (normalizedScore > 20) sentiment = 'positive';
    else if (normalizedScore < -20) sentiment = 'negative';

    return { sentiment, score: normalizedScore };
  }

  async analyzeAllArticles(): Promise<void> {
    const articles = await storage.getAllArticles();
    
    for (const article of articles) {
      if (!article.sentiment || !article.sentimentScore) {
        const text = `${article.title} ${article.content || ''} ${article.summary || ''}`;
        const analysis = this.analyzeSentiment(text);
        
        await storage.updateArticle(article.id, {
          sentiment: analysis.sentiment,
          sentimentScore: analysis.score
        });
      }
    }
  }

  async getMarketSentiment(): Promise<{ sentiment: string; percentage: number }> {
    const recentArticles = await storage.getRecentArticles(24);
    
    if (recentArticles.length === 0) {
      return { sentiment: 'neutral', percentage: 0 };
    }

    const totalScore = recentArticles.reduce((sum, article) => 
      sum + (article.sentimentScore || 0), 0
    );
    
    const averageScore = totalScore / recentArticles.length;
    const percentage = Math.round(((averageScore + 100) / 200) * 100);
    
    let sentiment = 'neutral';
    if (averageScore > 10) sentiment = 'positive';
    else if (averageScore < -10) sentiment = 'negative';

    return { sentiment, percentage };
  }
}

export const sentimentAnalyzer = new SentimentAnalyzer();
