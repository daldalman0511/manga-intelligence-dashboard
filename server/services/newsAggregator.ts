import { storage } from "../storage";
import { type InsertArticle } from "@shared/schema";

export class NewsAggregator {
  async fetchFromRSS(sourceId: string, url: string): Promise<void> {
    try {
      // In a real implementation, you would use an RSS parser library
      // For now, we'll simulate fetching news from RSS feeds
      console.log(`Fetching RSS from ${url} for source ${sourceId}`);
      
      // Update last fetched timestamp
      const source = await storage.getNewsSource(sourceId);
      if (source) {
        await storage.updateNewsSource(sourceId, { ...source, lastFetched: new Date() as any });
      }
    } catch (error) {
      console.error(`Error fetching RSS from ${url}:`, error);
    }
  }

  async scrapeWebsite(sourceId: string, url: string): Promise<void> {
    try {
      // In a real implementation, you would use Cheerio for web scraping
      console.log(`Scraping website ${url} for source ${sourceId}`);
      
      // Update last fetched timestamp
      await storage.updateNewsSource(sourceId, { lastFetched: new Date() });
    } catch (error) {
      console.error(`Error scraping website ${url}:`, error);
    }
  }

  async processArticle(articleData: any, sourceId: string): Promise<void> {
    try {
      // Extract and process article data
      const article: InsertArticle = {
        title: articleData.title,
        content: articleData.content,
        summary: articleData.summary,
        url: articleData.url,
        imageUrl: articleData.imageUrl,
        publishedAt: new Date(articleData.publishedAt),
        sourceId,
        category: this.categorizeArticle(articleData.title, articleData.content),
        language: articleData.language || 'ja',
        keywords: this.extractKeywords(articleData.title + ' ' + articleData.content),
        importance: this.calculateImportance(articleData),
      };

      // Check if article already exists
      const existingArticles = await storage.getAllArticles();
      const exists = existingArticles.some(existing => existing.url === article.url);
      
      if (!exists) {
        await storage.createArticle(article);
        console.log(`Added new article: ${article.title}`);
      }
    } catch (error) {
      console.error('Error processing article:', error);
    }
  }

  private categorizeArticle(title: string, content: string): string {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('partnership') || text.includes('collaboration') || text.includes('alliance')) {
      return 'partnership';
    }
    if (text.includes('global') || text.includes('international') || text.includes('overseas')) {
      return 'global';
    }
    if (text.includes('competitor') || text.includes('line manga') || text.includes('piccoma')) {
      return 'competitor';
    }
    
    return 'market';
  }

  private extractKeywords(text: string): string[] {
    const keywords = [];
    const keywordPatterns = [
      /partnership/gi,
      /collaboration/gi,
      /webtoon/gi,
      /manga/gi,
      /ai/gi,
      /subscription/gi,
      /global/gi,
      /expansion/gi,
    ];

    keywordPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        keywords.push(...matches.map(match => match.toLowerCase()));
      }
    });

    return [...new Set(keywords)]; // Remove duplicates
  }

  private calculateImportance(articleData: any): number {
    let importance = 1;
    
    const title = articleData.title.toLowerCase();
    if (title.includes('breaking') || title.includes('urgent')) importance += 2;
    if (title.includes('partnership') || title.includes('acquisition')) importance += 1;
    if (title.includes('line manga') || title.includes('piccoma')) importance += 1;
    
    return Math.min(importance, 5);
  }

  async fetchAllSources(): Promise<void> {
    const sources = await storage.getActiveNewsSources();
    
    for (const source of sources) {
      try {
        switch (source.type) {
          case 'rss':
            await this.fetchFromRSS(source.id, source.url);
            break;
          case 'scrape':
            await this.scrapeWebsite(source.id, source.url);
            break;
          default:
            console.log(`Unsupported source type: ${source.type}`);
        }
      } catch (error) {
        console.error(`Error fetching from source ${source.name}:`, error);
      }
    }
  }
}

export const newsAggregator = new NewsAggregator();
