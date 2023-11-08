import { NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { MenuComponent } from './menu/menu.component';
import { LoginComponent } from './login/login.component';
import { RoomComponent } from './room/room.component';
import { HttpClient } from '@angular/common/http';
import { AuthGuard } from './clases/auth-guard.service';
import { CreateActivityComponent } from './create-activity/create-activity.component';
import { GameComponent } from './game/game.component';
import { CreateProposalComponent } from './create-proposal/create-proposal.component';

const routes: Routes = [
  { path: '', component: MenuComponent, canActivate: [AuthGuard]},
  { path: 'menu', component: MenuComponent, canActivate: [AuthGuard]},
  { path: 'menu/:code', component: MenuComponent, canActivate: [AuthGuard]},
  { path: 'room', component: RoomComponent, canActivate: [AuthGuard]},
  { path: 'game', component: GameComponent, canActivate: [AuthGuard]},

  { path: 'login', component: LoginComponent},
  { path: 'activity', component: CreateActivityComponent, canActivate: [AuthGuard]},
  { path: 'proposal', component: CreateProposalComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})

export class AppRoutingModule {
  constructor(private router: Router, private http: HttpClient) {}

}