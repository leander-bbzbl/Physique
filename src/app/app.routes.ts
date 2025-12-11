import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/training-plans',
    pathMatch: 'full'
  },
  {
    path: 'training-plans',
    loadComponent: () => import('./pages/training-plans/training-plans.page').then(m => m.TrainingPlansPage)
  },
  {
    path: 'training-plan/:id',
    loadComponent: () => import('./pages/training-plan-detail/training-plan-detail.page').then(m => m.TrainingPlanDetailPage)
  },
  {
    path: 'exercises',
    loadComponent: () => import('./pages/exercises/exercises.page').then(m => m.ExercisesPage)
  },
  {
    path: 'active-training',
    loadComponent: () => import('./pages/active-training/active-training.page').then(m => m.ActiveTrainingPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
  }
];

