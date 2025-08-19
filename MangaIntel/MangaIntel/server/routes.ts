import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, insertCompanySchema, insertNewsSourceSchema } from "@shared/schema";
import { scheduler } from "./services/scheduler";
import { sentimentAnalyzer } from "./services/sentimentAnalyzer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start scheduled tasks
  scheduler.start();

  // Analytics endpoints
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const articleStats = await storage.getArticleStats();
      const sentimentStats = await storage.getSentimentStats();
      const companyMentions = await storage.getCompanyMentions();
      const marketSentiment = await sentimentAnalyzer.getMarketSentiment();

      res.json({
        articles: articleStats,
        sentiment: sentimentStats,
        companyMentions,
        marketSentiment
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Articles endpoints
  app.get("/api/articles", async (req, res) => {
    try {
      const { category, companyId, limit = "20", offset = "0", search } = req.query;
      
      let articles;
      if (search) {
        articles = await storage.searchArticles(search as string);
      } else {
        articles = await storage.getAllArticles({
          category: category as string,
          companyId: companyId as string,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        });
      }

      // Enrich with company data
      const companies = await storage.getAllCompanies();
      const enrichedArticles = articles.map(article => ({
        ...article,
        company: companies.find(c => c.id === article.companyId)
      }));

      res.json(enrichedArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  app.post("/api/articles", async (req, res) => {
    try {
      const validatedData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(validatedData);
      res.status(201).json(article);
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(400).json({ error: "Invalid article data" });
    }
  });

  // Companies endpoints
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      const companyMentions = await storage.getCompanyMentions();
      
      const enrichedCompanies = companies.map(company => ({
        ...company,
        mentions: companyMentions.find(cm => cm.companyId === company.id)?.mentions || 0
      }));

      res.json(enrichedCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(400).json({ error: "Invalid company data" });
    }
  });

  // Alerts endpoints
  app.get("/api/alerts", async (req, res) => {
    try {
      const { unread } = req.query;
      const alerts = unread === 'true' 
        ? await storage.getUnreadAlerts()
        : await storage.getAllAlerts();
      
      // Enrich with company data
      const companies = await storage.getAllCompanies();
      const enrichedAlerts = alerts.map(alert => ({
        ...alert,
        company: companies.find(c => c.id === alert.companyId)
      }));

      res.json(enrichedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.patch("/api/alerts/:id/read", async (req, res) => {
    try {
      await storage.markAlertAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking alert as read:', error);
      res.status(500).json({ error: "Failed to mark alert as read" });
    }
  });

  // Trends endpoints
  app.get("/api/trends", async (req, res) => {
    try {
      const { period = '24h' } = req.query;
      const trends = await storage.getTrendsByPeriod(period as string);
      res.json(trends);
    } catch (error) {
      console.error('Error fetching trends:', error);
      res.status(500).json({ error: "Failed to fetch trends" });
    }
  });

  // News sources endpoints
  app.get("/api/news-sources", async (req, res) => {
    try {
      const sources = await storage.getAllNewsSources();
      res.json(sources);
    } catch (error) {
      console.error('Error fetching news sources:', error);
      res.status(500).json({ error: "Failed to fetch news sources" });
    }
  });

  app.post("/api/news-sources", async (req, res) => {
    try {
      const validatedData = insertNewsSourceSchema.parse(req.body);
      const source = await storage.createNewsSource(validatedData);
      res.status(201).json(source);
    } catch (error) {
      console.error('Error creating news source:', error);
      res.status(400).json({ error: "Invalid news source data" });
    }
  });

  // Export endpoint
  app.get("/api/export", async (req, res) => {
    try {
      const { format = 'json', category, dateFrom, dateTo } = req.query;
      
      let articles = await storage.getAllArticles();
      
      // Apply filters
      if (category) {
        articles = articles.filter(article => article.category === category);
      }
      
      if (dateFrom) {
        const fromDate = new Date(dateFrom as string);
        articles = articles.filter(article => new Date(article.publishedAt) >= fromDate);
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo as string);
        articles = articles.filter(article => new Date(article.publishedAt) <= toDate);
      }

      if (format === 'csv') {
        // Convert to CSV format
        const csvHeader = 'Title,URL,Published Date,Category,Sentiment,Company\n';
        const csvRows = await Promise.all(articles.map(async article => {
          const company = article.companyId ? 
            (await storage.getCompany(article.companyId))?.name || '' : '';
          return `"${article.title}","${article.url}","${article.publishedAt}","${article.category}","${article.sentiment || ''}","${company}"`;
        }));
        const csvData = csvRows.join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="manga-industry-report.csv"');
        res.send(csvHeader + csvData);
      } else {
        res.json(articles);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);

  // Cleanup on server shutdown
  process.on('SIGTERM', () => {
    scheduler.stop();
  });

  return httpServer;
}
