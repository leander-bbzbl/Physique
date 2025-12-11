import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { 
  IonIcon
} from '@ionic/angular/standalone';
import { 
  listOutline, 
  list, 
  barbellOutline, 
  barbell, 
  playOutline, 
  play,
  personOutline,
  person
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonIcon
  ],
  template: `
    <div class="bottom-nav-container">
      <div class="bottom-nav">
        <a [routerLink]="['/training-plans']" routerLinkActive="tab-selected" class="nav-item">
          <ion-icon name="list-outline"></ion-icon>
          <span>Trainingspläne</span>
        </a>
        
        <a [routerLink]="['/exercises']" routerLinkActive="tab-selected" class="nav-item">
          <ion-icon name="barbell-outline"></ion-icon>
          <span>Übungen</span>
        </a>
        
        <a [routerLink]="['/active-training']" routerLinkActive="tab-selected" class="nav-item">
          <ion-icon name="play-outline"></ion-icon>
          <span>Starten</span>
        </a>
        
        <a [routerLink]="['/profile']" routerLinkActive="tab-selected" class="nav-item">
          <ion-icon name="person-outline"></ion-icon>
          <span>Profil</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .bottom-nav-container {
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-color);
      padding-bottom: env(safe-area-inset-bottom, 0);
      transition: background-color 0.3s ease, border-color 0.3s ease;
    }

    .bottom-nav {
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 60px;
      max-width: 100%;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      text-decoration: none;
      color: var(--text-secondary);
      padding: 8px;
      transition: color 0.3s ease;
      min-width: 0;
    }

    .nav-item.tab-selected {
      color: #007AFF;
    }

    .nav-item ion-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .nav-item span {
      font-size: 11px;
      font-weight: 500;
      text-align: center;
    }
  `]
})
export class BottomNavComponent {
  constructor(private router: Router) {
    addIcons({ 
      listOutline, 
      list, 
      barbellOutline, 
      barbell, 
      playOutline, 
      play,
      personOutline,
      person
    });
  }
}

