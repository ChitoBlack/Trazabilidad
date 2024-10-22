import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirige a Home
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) }, // Ruta de Home con Lazy Loading
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) }, // Ruta de Login con Lazy Loading
  { path: 'register', loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule) }, // Ruta de Registro con Lazy Loading
  { path: 'inicio', loadChildren: () => import('./inicio/inicio.module').then(m => m.InicioPageModule) } // Ruta de Inicio con Lazy Loading
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}


