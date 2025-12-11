import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>('dark');
  public theme$: Observable<Theme> = this.themeSubject.asObservable();

  constructor() {
    this.loadTheme();
  }

  private loadTheme() {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    this.setTheme(theme);
  }

  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  setTheme(theme: Theme) {
    this.themeSubject.next(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  toggleTheme() {
    const newTheme = this.themeSubject.value === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  private applyTheme(theme: Theme) {
    const body = document.body;
    
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }
}

