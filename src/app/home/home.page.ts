import { Component, OnInit, OnDestroy } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DatabaseService, SearchResult, Product } from '../services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  searchQuery: string = '';
  suggestions: SearchResult[] = [];
  results: Product[] = [];
  showSuggestions: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  databaseInfo: {downloadDate: string, totalProducts: number, totalCompanies: number} | null = null;
  private backButtonSubscription: Subscription | null = null;
  
  // Beverage type filters
  selectedFilter: 'all' | 'beer' | 'wine' | 'liquor' = 'all';
  filterOptions = [
    { value: 'all', label: 'All', icon: 'apps-outline' },
    { value: 'beer', label: 'Beer', icon: 'beer-outline' },
    { value: 'wine', label: 'Wine', icon: 'wine-outline' },
    { value: 'liquor', label: 'Liquor', icon: 'flask-outline' }
  ];

  constructor(
    private databaseService: DatabaseService,
    private platform: Platform
  ) {}

  async ngOnInit() {
    try {
      this.isLoading = true;
      await this.databaseService.initializeDatabase();
      this.databaseInfo = await this.databaseService.getDatabaseInfo();
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      this.errorMessage = 'Failed to load database. Please try again.';
      console.error('Database initialization failed:', error);
    }

    // Handle hardware back button on Android
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () => {
      if (this.searchQuery || this.showSuggestions || this.results.length > 0) {
        // Clear search instead of going back if there's active search content
        this.clearSearch();
      } else {
        // Allow default back behavior if no search is active
        (navigator as any).app?.exitApp();
      }
    });
  }

  ngOnDestroy() {
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }

  async onSearchInput(event: any) {
    const query = event.detail.value;
    this.searchQuery = query;
    
    if (!query || query.length < 2) {
      this.hideSuggestions();
      this.hideResults();
      return;
    }

    await this.performSearch();
  }

  onSearchFocus() {
    if (this.searchQuery && this.suggestions.length > 0) {
      this.showSuggestions = true;
    }
  }

  async selectSuggestion(suggestion: SearchResult) {
    this.searchQuery = suggestion.productname;
    this.hideSuggestions();
    await this.showDetailedResults(suggestion.productname);
  }

  async showDetailedResults(query: string) {
    try {
      this.results = await this.databaseService.getDetailedResults(query, this.selectedFilter);
      // Add notesExpanded property to results for UI state
      this.results = this.results.map(result => ({
        ...result,
        notesExpanded: false
      }));
    } catch (error) {
      console.error('Detailed search failed:', error);
      this.errorMessage = 'Failed to load detailed results.';
    }
  }

  async searchCompany(companyName: string) {
    this.searchQuery = companyName;
    this.hideSuggestions();
    await this.showDetailedResults(companyName);
  }

  async openWebsite(url: string) {
    if (!url) return;
    
    // Add https:// if no protocol is specified
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    await Browser.open({ url: formattedUrl });
  }

  toggleNotes(result: any) {
    result.notesExpanded = !result.notesExpanded;
  }

  getStatusText(status: string): string {
    return this.databaseService.getStatusText(status);
  }

  getStatusColor(status: string): string {
    if (!status) return 'medium';
    
    switch(status.toLowerCase()) {
      case 'green': return 'success';
      case 'yellow': return 'warning';
      case 'red': return 'danger';
      default: return 'medium';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return dateString;
    }
  }

  formatNotes(notes: string): string {
    if (!notes) return '';
    return notes
      .replace(/\n/g, '<br>')
      .replace(/\r/g, '')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
      .trim();
  }

  private hideSuggestions() {
    this.showSuggestions = false;
  }

  private hideResults() {
    this.results = [];
  }

  clearSearch() {
    this.searchQuery = '';
    this.selectedFilter = 'all';
    this.hideSuggestions();
    this.hideResults();
    this.errorMessage = '';
  }

  onFilterChange() {
    // Re-run search if there's a query
    if (this.searchQuery && this.searchQuery.length >= 2) {
      this.performSearch();
    }
  }

  selectFilter(value: string) {
    this.selectedFilter = value as 'all' | 'beer' | 'wine' | 'liquor';
    this.onFilterChange();
  }

  private async performSearch() {
    try {
      this.suggestions = await this.databaseService.searchSuggestions(this.searchQuery, this.selectedFilter);
      this.showSuggestions = true;
    } catch (error) {
      console.error('Search failed:', error);
      this.errorMessage = 'Search failed. Please try again.';
    }
  }

  private getBeverageTypeKeywords(filter: 'all' | 'beer' | 'wine' | 'liquor'): string[] {
    switch (filter) {
      case 'beer':
        return ['beer', 'lager', 'ale', 'stout', 'porter', 'ipa', 'pilsner', 'wheat', 'bock', 'saison'];
      case 'wine':
        return ['wine', 'champagne', 'prosecco', 'cava', 'sherry', 'port', 'madeira', 'vermouth', 'sake', 'mead'];
      case 'liquor':
        return ['whiskey', 'whisky', 'vodka', 'gin', 'rum', 'tequila', 'brandy', 'cognac', 'bourbon', 'scotch', 'liqueur', 'absinthe', 'mezcal'];
      case 'all':
      default:
        return [];
    }
  }
}
