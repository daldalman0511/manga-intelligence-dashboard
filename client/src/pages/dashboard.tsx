import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MetricsOverview } from "@/components/metrics-overview";
import { NewsTimeline } from "@/components/news-timeline";
import { TrendingTopics } from "@/components/trending-topics";
import { CompetitorActivity } from "@/components/competitor-activity";
import { AlertsWidget } from "@/components/alerts-widget";

export default function Dashboard() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    companies: [] as string[],
    dateRange: 'today',
    language: 'ja'
  });

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar 
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        data-testid="sidebar"
      />
      
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsMobileSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      <main className="flex-1 lg:ml-0">
        <Header 
          onToggleMobileSidebar={toggleMobileSidebar}
          filters={filters}
          onFilterChange={handleFilterChange}
          data-testid="header"
        />

        <div className="p-6 space-y-6">
          <MetricsOverview data-testid="metrics-overview" />

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <NewsTimeline 
                filters={filters}
                data-testid="news-timeline"
              />
            </div>

            <div className="space-y-6">
              <TrendingTopics data-testid="trending-topics" />
              <CompetitorActivity data-testid="competitor-activity" />
              <AlertsWidget data-testid="alerts-widget" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
