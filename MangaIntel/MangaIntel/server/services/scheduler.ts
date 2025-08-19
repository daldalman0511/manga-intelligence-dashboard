import { newsAggregator } from "./newsAggregator";
import { sentimentAnalyzer } from "./sentimentAnalyzer";
import { storage } from "../storage";

export class Scheduler {
  private intervals: NodeJS.Timeout[] = [];

  start(): void {
    console.log('Starting scheduled tasks...');

    // Fetch news every 15 minutes
    const newsInterval = setInterval(async () => {
      console.log('Running scheduled news fetch...');
      await newsAggregator.fetchAllSources();
    }, 15 * 60 * 1000);

    // Analyze sentiment every hour
    const sentimentInterval = setInterval(async () => {
      console.log('Running sentiment analysis...');
      await sentimentAnalyzer.analyzeAllArticles();
    }, 60 * 60 * 1000);

    // Update trends every 30 minutes
    const trendsInterval = setInterval(async () => {
      console.log('Updating trends...');
      await this.updateTrends();
    }, 30 * 60 * 1000);

    // Check for alerts every 5 minutes
    const alertsInterval = setInterval(async () => {
      console.log('Checking for new alerts...');
      await this.checkForAlerts();
    }, 5 * 60 * 1000);

    this.intervals.push(newsInterval, sentimentInterval, trendsInterval, alertsInterval);

    // Run initial tasks
    this.runInitialTasks();
  }

  stop(): void {
    console.log('Stopping scheduled tasks...');
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }

  private async runInitialTasks(): Promise<void> {
    try {
      await newsAggregator.fetchAllSources();
      await sentimentAnalyzer.analyzeAllArticles();
      await this.updateTrends();
      await this.checkForAlerts();
    } catch (error) {
      console.error('Error running initial tasks:', error);
    }
  }

  private async updateTrends(): Promise<void> {
    try {
      const articles = await storage.getRecentArticles(24);
      const keywordCounts = new Map<string, number>();

      articles.forEach(article => {
        if (article.keywords) {
          article.keywords.forEach(keyword => {
            keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
          });
        }
      });

      // Update existing trends or create new ones
      for (const [keyword, count] of keywordCounts.entries()) {
        const existingTrends = await storage.getAllTrends();
        const existingTrend = existingTrends.find(t => t.keyword === keyword);

        if (existingTrend) {
          const changePercentage = existingTrend.mentions ? 
            Math.round(((count - existingTrend.mentions) / existingTrend.mentions) * 100) : 0;
          
          await storage.updateTrend(existingTrend.id, {
            mentions: count,
            changePercentage
          });
        } else {
          await storage.createTrend({
            keyword,
            mentions: count,
            sentiment: 'neutral',
            changePercentage: 0
          });
        }
      }
    } catch (error) {
      console.error('Error updating trends:', error);
    }
  }

  private async checkForAlerts(): Promise<void> {
    try {
      const companies = await storage.getAllCompanies();
      const recentArticles = await storage.getRecentArticles(1); // Last hour

      for (const company of companies) {
        const companyArticles = recentArticles.filter(article => 
          article.companyId === company.id
        );

        // Check for high activity
        if (companyArticles.length >= 3) {
          await storage.createAlert({
            title: 'High Activity Alert',
            message: `${company.name} has ${companyArticles.length} new articles in the last hour`,
            type: 'warning',
            priority: 4,
            companyId: company.id
          });
        }

        // Check for breaking news
        const breakingNews = companyArticles.filter(article => article.isBreaking);
        if (breakingNews.length > 0) {
          await storage.createAlert({
            title: 'Breaking News Alert',
            message: `Breaking news about ${company.name}: ${breakingNews[0].title}`,
            type: 'error',
            priority: 5,
            companyId: company.id,
            articleId: breakingNews[0].id
          });
        }

        // Check for negative sentiment
        const negativeArticles = companyArticles.filter(article => 
          article.sentiment === 'negative' && (article.sentimentScore || 0) < -50
        );
        if (negativeArticles.length > 0) {
          await storage.createAlert({
            title: 'Negative Sentiment Alert',
            message: `Negative coverage detected for ${company.name}`,
            type: 'warning',
            priority: 3,
            companyId: company.id
          });
        }
      }
    } catch (error) {
      console.error('Error checking for alerts:', error);
    }
  }
}

export const scheduler = new Scheduler();
