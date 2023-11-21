import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { env } from '../enviroment';
import { io } from "socket.io-client";
import { Activity } from '../../app/clases/activity';
import { Player } from '../clases/Player';
import { type } from 'os';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
  ws!: any;

  code: string = "";
  activities: Activity[] = [];
  stage:number = 0;
  answer: string = "";
  votation : boolean = false;

  anwserSubmitted: boolean = false;

  timer: string = "--";
  show: boolean = false;



  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.http.post(env.baseURL + '/game/reconnect', { token: localStorage.getItem('token') }).subscribe((data: { [key: string]: any }) => {
      if (data['code'] != undefined && data['code'] != null && data['code'] != 'INVALID') {
        this.code = data['code'];
        this.connWebSocket();
      }
    });
  }

  submitAnswer() {
    this.anwserSubmitted = true;
    this.ws.emit('submitAnswer', { 'userName': localStorage.getItem("userName"), 'answer': this.answer });
    this.answer = "";
  }

  connWebSocket() {
    this.ws = io(env.WebSocket + this.code, {
      transports: ['websocket']
    });

    this.ws.on('activityPlayer', (data: { [key: string]: any }) => {
      let content = data['activityPlayer'];
      let i = 0;
      while (i < content.length - 1) {
        if (content[i+1].name == localStorage.getItem("userName") || content[i + 2].name == localStorage.getItem("userName")){
          this.activities.push(content[i]);
        }
        i += 3;
    }});

    this.ws.on('newStage', (data: { [key: string]: any }) => {
      this.show = true;
      this.anwserSubmitted = false;
      setTimeout(() => {
        this.show = false;
      }, 2000);
    });

    this.ws.on('stage', (data: { [key: string]: any }) => {
      console.log("STAGE:");
      console.log(data['stage']);
      console.log("---------------------");
      this.stage = data['stage'];
      console.log(this.stage);
      if(this.stage == 2){
        console.log("VOTACION");
        this.votation = true;
      }
      console.log("actividades: ",this.activities);
    });

    this.ws.on("timer", (data: { [key: string]: any }) => {
      if (data['timer'] == "¡Se acabó el tiempo!") {
        this.submitAnswer();
      }

      this.timer = data['timer'];
    });
  }
}
