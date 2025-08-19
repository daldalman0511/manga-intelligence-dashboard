import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Menu, Search, Bell, Download, X, Plus } from "lucide-react";

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  filters: {
    category: string;
    companies: string[];
    dateRange: string;
    language: string;
  };
  onFilterChange: (filters: any) => void;
}

export function Header({ onToggleMobileSidebar, filters, onFilterChange }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.dateRange) params.append('dateRange', filters.dateRange);
    
    window.open(`/api/export?${params.toString()}&format=csv`, '_blank');
  };

  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case 'category':
        onFilterChange({ category: '' });
        break;
      case 'dateRange':
        onFilterChange({ dateRange: '' });
        break;
      case 'company':
        if (value) {
          onFilterChange({ 
            companies: filters.companies.filter(id => id !== value) 
          });
        }
        break;
    }
  };

  const activeFilters = [
    ...(filters.dateRange ? [{ type: 'dateRange', label: 'Today', value: filters.dateRange }] : []),
    ...(filters.category ? [{ type: 'category', label: 'Competitors', value: filters.category }] : []),
    ...filters.companies.map(companyId => ({ type: 'company', label: 'Company', value: companyId }))
  ];

  return (
    <header className="bg-surface shadow-sm border-b border-border sticky top-0 z-20">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu & Search */}
          <div className="flex items-center space-x-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onToggleMobileSidebar}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Search news, companies, keywords..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={filters.language === 'ja' ? "secondary" : "ghost"}
                size="sm"
                className="text-sm font-medium"
                onClick={() => onFilterChange({ language: 'ja' })}
                data-testid="button-language-ja"
              >
                日本語
              </Button>
              <Button
                variant={filters.language === 'en' ? "secondary" : "ghost"}
                size="sm"
                className="text-sm font-medium"
                onClick={() => onFilterChange({ language: 'en' })}
                data-testid="button-language-en"
              >
                EN
              </Button>
            </div>

            {/* Real-time Status */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-success">Live</span>
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>

            {/* Export */}
            <Button
              onClick={handleExport}
              className="flex items-center space-x-2"
              data-testid="button-export"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Filter Tags */}
        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {activeFilters.map((filter, index) => (
              <Badge
                key={`${filter.type}-${filter.value}-${index}`}
                variant="secondary"
                className="flex items-center space-x-2"
                data-testid={`filter-tag-${filter.type}`}
              >
                <span>{filter.label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => removeFilter(filter.type, filter.value)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="text-sm"
              data-testid="button-add-filter"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Filter
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
