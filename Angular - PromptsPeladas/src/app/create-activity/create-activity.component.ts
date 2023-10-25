import { Component, Input } from '@angular/core';
import { Activity } from '../clases/activity';

@Component({
  selector: 'app-create-activity',
  templateUrl: './create-activity.component.html',
  styleUrls: ['./create-activity.component.css']
})
export class CreateActivityComponent {

  @Input() activity ?: Activity;
  activities: Activity[] = []; // Base de datos de actividades

  constructor() { }

  deleteActivity(_t18: any) {
    throw new Error('Method not implemented.'); // Eliminar actividad de la base de datos
  }

  addActivity() {
    throw new Error('Method not implemented.'); // Añadir actividad a la base de datos
  }

  returnToMenu() {
    throw new Error('Method not implemented.'); // Redirigir a la página principal
  }


}
