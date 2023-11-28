import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { env } from '../enviroment';
import { Activity } from '../clases/activity';
import { Proposal } from '../clases/proposal';
import { Console } from 'console';

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

  // Use ViewChildren to get all checkboxes in the template
  @ViewChildren('activityCheckbox') activityCheckboxes!: QueryList<any>;

  constructor(private http: HttpClient, private router: Router) { }

  // Obtengo todas las actividades disponibles
  ngOnInit(): void {
    this.updateProposals();
    this.updateActivities();

    document.body.style.background = "#6cc7d9";
    document.body.style.background = "linear-gradient(to left, #6cc7d9,  #f9a8d4)";
  }

  // Creo una propuesta
  createProposal() {
    //Si están seleccionadas,  las agrega a la lista de actividades seleccionadas
    console.log("checkboxes: ", this.activityCheckboxes);
    this.checkedActivities = [];
    this.activityCheckboxes.forEach((checkbox, index) => {
      if (checkbox.nativeElement.checked) {
        this.checkedActivities.push(this.activities[index]);
      }
    });
    console.log("actividades: ", this.checkedActivities);
    
    this.http.post(
      env.baseURL + '/proposal/create', { description: this.description, token: localStorage.getItem('token'), activityList: this.checkedActivities },{
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).subscribe((data: { [key: string]: any }) => {
        console.log(data);
        this.updateProposals();
      });
  }

  removeProposal(id: string) {
    this.http.put(
      env.baseURL + '/proposal/remove', { id: id },{
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).subscribe((data: { [key: string]: any }) => {
        this.updateProposals();
      });
  }

  updateProposals() {
    this.http.post(
    env.baseURL + '/proposal/get', { token: localStorage.getItem('token'), activityList: this.checkedActivities }).subscribe((data: { [key: string]: any }) => {
      console.log(data);
      this.proposals = data['proposals'];
    });
  }

  updateActivities() {
    this.http.get(
      env.baseURL + '/activity/getAll').subscribe((data: { [key: string]: any }) => {
        this.activities = data['activities'];
      });
  }

  returnToMenu() {
    this.router.navigate(['menu']);
  }

  ngOnDestroy(): void {
    document.body.style.background = "white";
  }
}
