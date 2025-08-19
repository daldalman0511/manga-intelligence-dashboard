import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartLine, Newspaper, Users, Handshake, Globe, User, Settings } from "lucide-react";

interface Company {
  id: string;
  name: string;
  type: string;
  mentions?: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    category: string;
    companies: string[];
    dateRange: string;
    language: string;
  };
  onFilterChange: (filters: any) => void;
}

export function Sidebar({ isOpen, onClose, filters, onFilterChange }: SidebarProps) {
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  const { data: analytics } = useQuery<{
    articles?: { total?: number; today?: number };
  }>({
    queryKey: ['/api/analytics/stats'],
  });

  const categoryOptions = [
    { id: '', label: 'All News', icon: Newspaper, count: analytics?.articles?.total || 124 },
    { id: 'competitor', label: 'Competitors', icon: Users, count: 18 },
    { id: 'partnership', label: 'Partnerships', icon: Handshake, count: 7 },
    { id: 'global', label: 'Global Markets', icon: Globe, count: 15 },
  ];

  const handleCategoryChange = (category: string) => {
    onFilterChange({ category });
  };

  const handleCompanyToggle = (companyId: string) => {
    const newCompanies = filters.companies.includes(companyId)
      ? filters.companies.filter(id => id !== companyId)
      : [...filters.companies, companyId];
    onFilterChange({ companies: newCompanies });
  };

  return (
    <>
      <aside className={`w-88 bg-surface shadow-lg flex flex-col fixed left-0 top-0 h-full z-30 lg:relative lg:z-auto transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <ChartLine className="text-primary-foreground text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MangaIntel</h1>
              <p className="text-sm text-muted-foreground">Industry Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation & Filters */}
        <nav className="flex-1 p-4 space-y-6">
          {/* Quick Stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Today's Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-blue-50 dark:bg-blue-950 p-3 border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-primary" data-testid="stat-new-articles">
                  {analytics?.articles?.today || 24}
                </div>
                <div className="text-xs text-muted-foreground">New Articles</div>
              </Card>
              <Card className="bg-orange-50 dark:bg-orange-950 p-3 border-orange-200 dark:border-orange-800">
                <div className="text-2xl font-bold text-accent" data-testid="stat-alerts">3</div>
                <div className="text-xs text-muted-foreground">Critical Alerts</div>
              </Card>
            </div>
          </div>

          {/* Category Filters */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Categories</h3>
            <div className="space-y-2">
              {categoryOptions.map(category => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={filters.category === category.id ? "secondary" : "ghost"}
                    className="w-full justify-between p-3 h-auto"
                    onClick={() => handleCategoryChange(category.id)}
                    data-testid={`filter-category-${category.id || 'all'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{category.label}</span>
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Company Filters */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Companies</h3>
            <div className="space-y-2">
              {companies.slice(0, 4).map((company) => (
                <label 
                  key={company.id}
                  className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                  data-testid={`filter-company-${company.id}`}
                >
                  <Checkbox
                    checked={filters.companies.includes(company.id)}
                    onCheckedChange={() => handleCompanyToggle(company.id)}
                  />
                  <span className="text-sm">{company.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {company.mentions || 0}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </nav>

        {/* Settings & Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 p-3 hover:bg-muted rounded-lg cursor-pointer">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="text-primary-foreground text-sm" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">田中太郎</div>
              <div className="text-xs text-muted-foreground">Business Intelligence</div>
            </div>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </aside>
    </>
  );
}
