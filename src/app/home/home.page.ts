import { Component, OnInit } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { DatabaseService, SearchResult, Product } from '../services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  searchQuery: string = '';
  suggestions: SearchResult[] = [];
  results: Product[] = [];
  showSuggestions: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private databaseService: DatabaseService) {}

  async ngOnInit() {
    try {
      this.isLoading = true;
      await this.databaseService.initializeDatabase();
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      this.errorMessage = 'Failed to load database. Please try again.';
      console.error('Database initialization failed:', error);
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

    try {
      this.suggestions = await this.databaseService.searchSuggestions(query);
      this.showSuggestions = true;
    } catch (error) {
      console.error('Search failed:', error);
      this.errorMessage = 'Search failed. Please try again.';
    }
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
      this.results = await this.databaseService.getDetailedResults(query);
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
}
