import { type User, type InsertUser, type Company, type InsertCompany, type NewsSource, type InsertNewsSource, type Article, type InsertArticle, type Alert, type InsertAlert, type Trend, type InsertTrend } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Companies
  getAllCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company | undefined>;

  // News Sources
  getAllNewsSources(): Promise<NewsSource[]>;
  getActiveNewsSources(): Promise<NewsSource[]>;
  createNewsSource(source: InsertNewsSource): Promise<NewsSource>;
  updateNewsSource(id: string, updates: Partial<InsertNewsSource>): Promise<NewsSource | undefined>;

  // Articles
  getAllArticles(filters?: { category?: string; companyId?: string; limit?: number; offset?: number }): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  getArticlesByCompany(companyId: string): Promise<Article[]>;
  getRecentArticles(hours?: number): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, updates: Partial<InsertArticle>): Promise<Article | undefined>;
  searchArticles(query: string): Promise<Article[]>;

  // Alerts
  getAllAlerts(): Promise<Alert[]>;
  getUnreadAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: string): Promise<void>;

  // Trends
  getAllTrends(): Promise<Trend[]>;
  getTrendsByPeriod(period: string): Promise<Trend[]>;
  createTrend(trend: InsertTrend): Promise<Trend>;
  updateTrend(id: string, updates: Partial<InsertTrend>): Promise<Trend | undefined>;

  // Analytics
  getArticleStats(): Promise<{ total: number; today: number; weekGrowth: number }>;
  getSentimentStats(): Promise<{ positive: number; negative: number; neutral: number }>;
  getCompanyMentions(): Promise<{ companyId: string; companyName: string; mentions: number }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private companies: Map<string, Company>;
  private newsSources: Map<string, NewsSource>;
  private articles: Map<string, Article>;
  private alerts: Map<string, Alert>;
  private trends: Map<string, Trend>;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.newsSources = new Map();
    this.articles = new Map();
    this.alerts = new Map();
    this.trends = new Map();

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Companies
    const lineCompany = this.createCompanySync({ name: "LINE Manga", type: "competitor", website: "https://manga.line.me", description: "Digital manga platform by LINE Corporation" });
    const piccomaCompany = this.createCompanySync({ name: "Piccoma", type: "competitor", website: "https://piccoma.com", description: "Webtoon and manga platform" });
    const shueishaCompany = this.createCompanySync({ name: "Shueisha", type: "publisher", website: "https://www.shueisha.co.jp", description: "Major manga publisher" });

    // News Sources
    this.createNewsSourceSync({ name: "Anime News Network", url: "https://www.animenewsnetwork.com/rss.xml", type: "rss", language: "en" });
    this.createNewsSourceSync({ name: "Comic Natalie", url: "https://natalie.mu/comic", type: "scrape", language: "ja" });

    // Sample articles
    this.createArticleSync({
      title: "LINE Manga announces strategic partnership with major Korean webtoon publisher",
      content: "LINE Manga has announced a strategic partnership with a major Korean webtoon publisher to bring exclusive content to the Japanese market...",
      summary: "The collaboration aims to bring premium Korean webtoon content to the Japanese market, potentially disrupting current market dynamics and increasing competition.",
      url: "https://example.com/line-manga-partnership",
      publishedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      companyId: lineCompany.id,
      category: "competitor",
      sentiment: "positive",
      sentimentScore: 75,
      keywords: ["partnership", "webtoon", "Korean", "exclusive"],
      isBreaking: true,
      importance: 5
    });

    this.createArticleSync({
      title: "Piccoma expands AI-powered recommendation system with machine learning partnership",
      content: "Piccoma has announced the expansion of its AI-powered recommendation system through a new machine learning partnership...",
      summary: "The new system promises to increase user engagement by 40% through personalized content discovery and reading pattern analysis.",
      url: "https://example.com/piccoma-ai-expansion",
      publishedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      companyId: piccomaCompany.id,
      category: "competitor",
      sentiment: "neutral",
      sentimentScore: 10,
      keywords: ["AI", "recommendation", "machine learning", "engagement"],
      importance: 4
    });

    // Sample alerts
    this.createAlertSync({
      title: "High Competition Alert",
      message: "LINE Manga market share increased 5%",
      type: "error",
      priority: 5,
      companyId: lineCompany.id
    });

    this.createAlertSync({
      title: "Partnership Opportunity",
      message: "New Korean publisher seeking distribution",
      type: "warning",
      priority: 3
    });

    // Sample trends
    this.createTrendSync({ keyword: "WebtoonExpansion", mentions: 47, sentiment: "positive", changePercentage: 47 });
    this.createTrendSync({ keyword: "AIRecommendations", mentions: 23, sentiment: "positive", changePercentage: 23 });
    this.createTrendSync({ keyword: "SubscriptionModel", mentions: 19, sentiment: "positive", changePercentage: 19 });
  }

  private createCompanySync(company: InsertCompany): Company {
    const id = randomUUID();
    const newCompany: Company = { 
      ...company, 
      id, 
      isActive: company.isActive ?? true,
      description: company.description ?? null,
      website: company.website ?? null
    };
    this.companies.set(id, newCompany);
    return newCompany;
  }

  private createNewsSourceSync(source: InsertNewsSource): NewsSource {
    const id = randomUUID();
    const newSource: NewsSource = { 
      ...source, 
      id, 
      isActive: source.isActive ?? true, 
      lastFetched: null,
      language: source.language ?? 'ja'
    };
    this.newsSources.set(id, newSource);
    return newSource;
  }

  private createArticleSync(article: InsertArticle): Article {
    const id = randomUUID();
    const newArticle: Article = { 
      ...article, 
      id,
      summary: article.summary ?? null,
      content: article.content ?? null,
      imageUrl: article.imageUrl ?? null,
      companyId: article.companyId ?? null,
      sourceId: article.sourceId ?? null,
      sentiment: article.sentiment ?? null,
      sentimentScore: article.sentimentScore ?? null,
      language: article.language ?? 'ja',
      keywords: article.keywords ?? null,
      isBreaking: article.isBreaking ?? false,
      importance: article.importance ?? 1
    };
    this.articles.set(id, newArticle);
    return newArticle;
  }

  private createAlertSync(alert: InsertAlert): Alert {
    const id = randomUUID();
    const newAlert: Alert = { 
      ...alert, 
      id, 
      isRead: alert.isRead ?? false, 
      createdAt: new Date(),
      companyId: alert.companyId ?? null,
      articleId: alert.articleId ?? null,
      priority: alert.priority ?? 1
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  private createTrendSync(trend: InsertTrend): Trend {
    const id = randomUUID();
    const newTrend: Trend = { 
      ...trend, 
      id, 
      period: trend.period ?? '24h', 
      updatedAt: new Date(),
      sentiment: trend.sentiment ?? null,
      mentions: trend.mentions ?? 0,
      changePercentage: trend.changePercentage ?? 0
    };
    this.trends.set(id, newTrend);
    return newTrend;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Company methods
  async getAllCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const id = randomUUID();
    const newCompany: Company = { 
      ...company, 
      id, 
      isActive: company.isActive ?? true,
      description: company.description ?? null,
      website: company.website ?? null
    };
    this.companies.set(id, newCompany);
    return newCompany;
  }

  async updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    const updated = { ...company, ...updates };
    this.companies.set(id, updated);
    return updated;
  }

  // News Source methods
  async getAllNewsSources(): Promise<NewsSource[]> {
    return Array.from(this.newsSources.values());
  }

  async getNewsSource(id: string): Promise<NewsSource | undefined> {
    return this.newsSources.get(id);
  }

  async getActiveNewsSources(): Promise<NewsSource[]> {
    return Array.from(this.newsSources.values()).filter(source => source.isActive);
  }

  async createNewsSource(source: InsertNewsSource): Promise<NewsSource> {
    const id = randomUUID();
    const newSource: NewsSource = { 
      ...source, 
      id, 
      isActive: source.isActive ?? true, 
      lastFetched: null,
      language: source.language ?? 'ja'
    };
    this.newsSources.set(id, newSource);
    return newSource;
  }

  async updateNewsSource(id: string, updates: Partial<InsertNewsSource>): Promise<NewsSource | undefined> {
    const source = this.newsSources.get(id);
    if (!source) return undefined;
    const updated = { ...source, ...updates };
    this.newsSources.set(id, updated);
    return updated;
  }

  // Article methods
  async getAllArticles(filters?: { category?: string; companyId?: string; limit?: number; offset?: number }): Promise<Article[]> {
    let articles = Array.from(this.articles.values()).sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    if (filters?.category) {
      articles = articles.filter(article => article.category === filters.category);
    }

    if (filters?.companyId) {
      articles = articles.filter(article => article.companyId === filters.companyId);
    }

    const offset = filters?.offset ?? 0;
    const limit = filters?.limit ?? articles.length;
    
    return articles.slice(offset, offset + limit);
  }

  async getArticle(id: string): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticlesByCompany(companyId: string): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(article => article.companyId === companyId);
  }

  async getRecentArticles(hours: number = 24): Promise<Article[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.articles.values())
      .filter(article => new Date(article.publishedAt) > cutoff)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const newArticle: Article = { 
      ...article, 
      id,
      summary: article.summary ?? null,
      content: article.content ?? null,
      imageUrl: article.imageUrl ?? null,
      companyId: article.companyId ?? null,
      sourceId: article.sourceId ?? null,
      sentiment: article.sentiment ?? null,
      sentimentScore: article.sentimentScore ?? null,
      language: article.language ?? 'ja',
      keywords: article.keywords ?? null,
      isBreaking: article.isBreaking ?? false,
      importance: article.importance ?? 1
    };
    this.articles.set(id, newArticle);
    return newArticle;
  }

  async updateArticle(id: string, updates: Partial<InsertArticle>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    const updated = { ...article, ...updates };
    this.articles.set(id, updated);
    return updated;
  }

  async searchArticles(query: string): Promise<Article[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.articles.values()).filter(article =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.content?.toLowerCase().includes(searchTerm) ||
      article.summary?.toLowerCase().includes(searchTerm) ||
      article.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  }

  // Alert methods
  async getAllAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort((a, b) => 
      (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0)
    );
  }

  async getUnreadAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => !alert.isRead)
      .sort((a, b) => (b.priority || 1) - (a.priority || 1));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const newAlert: Alert = { 
      ...alert, 
      id, 
      isRead: alert.isRead ?? false, 
      createdAt: new Date(),
      companyId: alert.companyId ?? null,
      articleId: alert.articleId ?? null,
      priority: alert.priority ?? 1
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async markAlertAsRead(id: string): Promise<void> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.isRead = true;
      this.alerts.set(id, alert);
    }
  }

  // Trend methods
  async getAllTrends(): Promise<Trend[]> {
    return Array.from(this.trends.values()).sort((a, b) => (b.changePercentage || 0) - (a.changePercentage || 0));
  }

  async getTrendsByPeriod(period: string): Promise<Trend[]> {
    return Array.from(this.trends.values())
      .filter(trend => trend.period === period)
      .sort((a, b) => (b.changePercentage || 0) - (a.changePercentage || 0));
  }

  async createTrend(trend: InsertTrend): Promise<Trend> {
    const id = randomUUID();
    const newTrend: Trend = { 
      ...trend, 
      id, 
      period: trend.period ?? '24h', 
      updatedAt: new Date(),
      sentiment: trend.sentiment ?? null,
      mentions: trend.mentions ?? 0,
      changePercentage: trend.changePercentage ?? 0
    };
    this.trends.set(id, newTrend);
    return newTrend;
  }

  async updateTrend(id: string, updates: Partial<InsertTrend>): Promise<Trend | undefined> {
    const trend = this.trends.get(id);
    if (!trend) return undefined;
    const updated = { ...trend, ...updates, updatedAt: new Date() };
    this.trends.set(id, updated);
    return updated;
  }

  // Analytics methods
  async getArticleStats(): Promise<{ total: number; today: number; weekGrowth: number }> {
    const total = this.articles.size;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayArticles = Array.from(this.articles.values()).filter(
      article => new Date(article.publishedAt) >= today
    ).length;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekArticles = Array.from(this.articles.values()).filter(
      article => new Date(article.publishedAt) >= weekAgo
    ).length;
    const previousWeekArticles = Array.from(this.articles.values()).filter(
      article => {
        const date = new Date(article.publishedAt);
        return date >= new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000) && date < weekAgo;
      }
    ).length;

    const weekGrowth = previousWeekArticles > 0 ? Math.round(((thisWeekArticles - previousWeekArticles) / previousWeekArticles) * 100) : 0;

    return { total, today: todayArticles, weekGrowth };
  }

  async getSentimentStats(): Promise<{ positive: number; negative: number; neutral: number }> {
    const articles = Array.from(this.articles.values());
    const positive = articles.filter(a => a.sentiment === 'positive').length;
    const negative = articles.filter(a => a.sentiment === 'negative').length;
    const neutral = articles.filter(a => a.sentiment === 'neutral').length;
    return { positive, negative, neutral };
  }

  async getCompanyMentions(): Promise<{ companyId: string; companyName: string; mentions: number }[]> {
    const companyCounts = new Map<string, number>();
    
    Array.from(this.articles.values()).forEach(article => {
      if (article.companyId) {
        companyCounts.set(article.companyId, (companyCounts.get(article.companyId) ?? 0) + 1);
      }
    });

    const result = [];
    for (const [companyId, mentions] of Array.from(companyCounts.entries())) {
      const company = this.companies.get(companyId);
      if (company) {
        result.push({ companyId, companyName: company.name, mentions });
      }
    }

    return result.sort((a, b) => b.mentions - a.mentions);
  }
}

export const storage = new MemStorage();
