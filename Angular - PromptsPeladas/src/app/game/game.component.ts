import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { env } from '../enviroment';
import { io } from "socket.io-client";
import { Activity } from '../clases/activity';
import { Player } from '../clases/Player';

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
    this.ws.emit('submitAnswer', { 'username': localStorage.getItem("userName"), 'answer': this.answer });
    this.answer = "";
  }

  connWebSocket() {
    this.ws = io(env.WebSocket + this.code, {
      transports: ['websocket']
    });

    this.ws.on('activityPlayer', (data: { [key: string]: any }) => {
      console.log("ESTO SE RECIBIÓ");
      console.log(data);
      let culo = JSON.parse(data['activityPlayer'])as Map<Activity, Player[]>;
      (Array.from(culo.keys())).forEach((element: any) => {
        culo.get(element)?.forEach((element2: Player) => {
          if (element2.name == localStorage.getItem('userName')) {
            this.activities.push(element as Activity);
          }
        });
      });
      console.log("ACTIVITIES:");
      console.log(this.activities.length);
    });

    this.ws.on('newStage', (data: { [key: string]: any }) => {
      console.log("NEW STAGE");
      console.log("---------------------");
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
    });

    this.ws.on("timer", (data: { [key: string]: any }) => {
      console.log("TIMER:");
      console.log(data['timer']);
      console.log("---------------------");

      if (data['timer'] == "¡Se acabó el tiempo!") {
        this.submitAnswer();
      }

      this.timer = data['timer'];
    })
  }
}
