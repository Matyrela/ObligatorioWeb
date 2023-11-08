import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { env } from '../enviroment';
import { Activity } from '../clases/activity';
import { Proposal } from '../clases/proposal';

@Component({
  selector: 'app-create-proposal',
  templateUrl: './create-proposal.component.html',
  styleUrls: ['./create-proposal.component.css']
})
export class CreateProposalComponent {

  activities: Activity[] = []; // Base de datos de actividades
  checkedActivities: Activity[] = []; // Actividades seleccionadas
  proposals: Proposal[] = []; // Base de datos de propuestas
  description: string = ""; // Descripción de la propuesta

  constructor(private http: HttpClient, private router: Router) { }

  // Obtengo todas las actividades disponibles
  ngOnInit(): void {
    this.updateProposals();
    this.updateActivities();
  }

  // Creo una propuesta
  createProposal() {
    // For que chequea las checkbox. Si están seleccionadas,  las agrega a la lista de actividades seleccionadas
    this.http.post(
      env.baseURL + '/proposal/create', { description: this.description, token: localStorage.getItem('token'), activityList: this.checkedActivities }).subscribe((data: { [key: string]: any }) => {
        this.updateProposals();
      });
  }

  removeProposal(id: number) {
    this.http.put(
      env.baseURL + '/proposal/remove', { id: id }).subscribe((data: { [key: string]: any }) => {
        this.updateProposals();
      });
    // throw new Error('Method not implemented.'); // Redirigir a la página principal

  }

  updateProposals() {
    this.http.get(
      env.baseURL + '/proposal/get').subscribe((data: { [key: string]: any }) => {
        this.proposals = data['proposals'];
      });
  }

  updateActivities() {
    this.http.get(
      env.baseURL + '/activity/get').subscribe((data: { [key: string]: any }) => {
        this.activities = data['activities'];
      });
  }

  returnToMenu() {
    this.router.navigate(['menu']);
  }
}
