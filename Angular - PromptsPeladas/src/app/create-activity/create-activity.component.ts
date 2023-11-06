import { Component, Input } from '@angular/core';
import { Activity } from '../clases/activity';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { env } from '../enviroment';

@Component({
  selector: 'app-create-activity',
  templateUrl: './create-activity.component.html',
  styleUrls: ['./create-activity.component.css']
})
export class CreateActivityComponent {

  activities: Activity[] = []; // Base de datos de actividades
  description: string = ""; // Descripción de la actividad

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.updateActivities();
  }

  removeActivity(id: number) {
    this.http.put(
      env.baseURL + '/activity/remove', { id: id}).subscribe((data: { [key: string]: any }) => {
        this.updateActivities();
      });
    // throw new Error('Method not implemented.'); // Redirigir a la página principal

  }

  addActivity() {
    this.http.post(
      env.baseURL + '/activity/create', { description: this.description, token: localStorage.getItem('token') }).subscribe((data: { [key: string]: any }) => {
        this.updateActivities();
      });

  }

  returnToMenu() {
    throw new Error('Method not implemented.'); // Redirigir a la página principal
  }

  updateActivities() {
    this.http.get(
      env.baseURL + '/activity/get').subscribe((data: { [key: string]: any }) => {
        this.activities = data['activities'];
      });
  }


}
