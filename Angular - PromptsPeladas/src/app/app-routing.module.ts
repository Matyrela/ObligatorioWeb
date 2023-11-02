import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { LoginComponent } from './login/login.component';
import { RoomComponent } from './room/room.component';
import { HttpClient } from '@angular/common/http';
import { AuthGuard } from './clases/auth-guard.service';

const routes: Routes = [
  { path: '', component: MenuComponent, canActivate: [AuthGuard]},
  
  { path: 'menu', component: MenuComponent, canActivate: [AuthGuard]},
  { path: 'menu/:code', component: MenuComponent, canActivate: [AuthGuard]},

  { path: 'room', component: RoomComponent, canActivate: [AuthGuard]},

  { path: 'login', component: LoginComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})

export class AppRoutingModule {
  constructor(private router: Router, private http: HttpClient) {}

}