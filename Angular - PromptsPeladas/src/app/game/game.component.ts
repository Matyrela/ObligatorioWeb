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
  myActivities: Activity[] = [];
  allActivities: Activity[] = [];
  stage: number = 0;
  index: number = 0;
  answer: string = "";
  votation: boolean = false;

  anwserSubmitted: boolean = false;

  timer: string = "--";
  show: boolean = false;



  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.http.post(env.baseURL + '/game/reconnect', { token: localStorage.getItem('token') }).subscribe((data: { [key: string]: any }) => {
      if (data['code'] != undefined && data['code'] != null && data['code'] != 'INVALID') {
        this.code = data['code'];
        this.connWebSocket();
      } else {
        this.router.navigate(['/menu']);
      }
    });
  }

  submitAnswer() {
    this.anwserSubmitted = true;
    this.ws.emit('submitAnswer', { 'userName': localStorage.getItem("userName"), 'answer': this.answer });
    this.answer = "";
  }
  scorePoint(score: number) {
    this.ws.emit('scorePoint', {'activity' : this.myActivities[this.index], 'score': score }); 
    }

  connWebSocket() {
    this.ws = io(env.WebSocket + this.code, {
      transports: ['websocket']
    });

    this.ws.on('activityPlayer', (data: { [key: string]: any }) => {
      let content = data['activityPlayer'];
      console.log(content);
      let i = 0;
      if (content != undefined && content != null) {
        while (i < content.length - 1) {
          if (content[i + 1] == localStorage.getItem("userName") || content[i + 2] == localStorage.getItem("userName")) {
            this.myActivities.push(content[i]);
          }
          i += 3;
        }
      }
    });

    this.ws.on('newStage', (data: { [key: string]: any }) => {
      this.show = true;
      this.anwserSubmitted = false;
      setTimeout(() => {
        this.show = false;
      }, 2000);
    });

    this.ws.on('stage', (data: { [key: string]: any }) => {
      this.stage = data['stage'];
      this.index = (data['stage']-1) % this.myActivities.length;
      if (this.stage == 2) {
        console.log("VOTACION");
        this.votation = true;
      }
      console.log("actividades: ",this.activities);
    });

    this.ws.on("timer", (data: { [key: string]: any }) => {
      if (data['timer'] == "¡Se acabó el tiempo!" && this.stage < 2) {
        this.submitAnswer();
      }

      this.timer = data['timer'];
    });
  }
}
