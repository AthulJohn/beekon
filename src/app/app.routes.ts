import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'update',
    redirectTo: 'home',
  },
  {
    path:'create/:id',
    loadChildren:() => import('./features/edit/edit.module').then(m => m.EditModule),
    data: { mode: 'create' } 
  },
  {
    path: 'update/:id',
    loadChildren: () => import('./features/update/update.module').then(m => m.UpdateModule)
  },
  {
    path: 'update/:id/edit',
    loadChildren: () => import('./features/edit/edit.module').then(m => m.EditModule)
    , data: { mode: 'edit' } 
  },
  {
    path: 'view/:slug',
    loadChildren: () => import('./features/view/view.module').then(m => m.ViewModule)
  }
];
