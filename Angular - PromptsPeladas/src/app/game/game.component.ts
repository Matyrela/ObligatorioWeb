import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { env } from '../enviroment';
import { io } from "socket.io-client";
import { Activity } from '../../app/clases/activity';
import { Player } from '../clases/Player';
import { type } from 'os';
import { log } from 'console';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {

  ws!: any;

  code: string = "";
  myActivities: Activity[] = [];
  answerActivities: any[] = [];
  stage: number = 0;
  index: number = -3;
  answer: string = "";
  winner: string ="";
  anwserSubmitted: boolean = false;
  answerTime : boolean = true;
  votationTime: boolean = false;
  winnerCheck : boolean = false;

  timer: string = "--";
  show: boolean = false;



  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.http.post(env.baseURL + '/game/reconnect', { token: localStorage.getItem('token') }).subscribe((data: { [key: string]: any }) => {
      console.log(data);
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
    if (this.answer != "") {
      this.ws.emit('submitAnswer', {'activities' : this.myActivities[this.stage] , 'userName': localStorage.getItem("userName"), 'answer': this.answer });
    }
    this.answer = "";
  }
  scorePoint(userName: string) {
    this.ws.emit('scorePoint', {'userName' : userName}); 
    }

  connWebSocket() {
    this.ws = io(env.WebSocket + this.code, {
      transports: ['websocket']
    });

    this.ws.on('activityPlayer', (data: { [key: string]: any }) => {
      let content = data['activityPlayer'] as any[];
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
    this.ws.on('answerActivities', (data: { [key: string]: any }) => {
      let answers = data['answerActivities'] as any[];
      let toAnswer = data['toAnswer'] as number;
      let i = 0;
      //me quedo con las respuestas que debo votar (osea no las que corresponden a mis preguntas contestadas)
      while (i < answers.length) {
        if(answers[i+1] == localStorage.getItem("userName")){
          let id = answers[i]?.id;
          answers.splice(i, 3);
          answers.forEach(element => {
            if (element.id == id) {
              let index = answers.indexOf(element);
              answers.splice(index, 3);
            }
          });
        }
        i += 3;
      }
      i= 0;
      //ordeno las respuestas por id para que tenga sentido la votacion
      while (this.answerActivities.length < toAnswer * 3) {
        this.answerActivities.push(answers[i]);
        this.answerActivities.push(answers[i + 1]);
        this.answerActivities.push(answers[i + 2]);
        let j = i+3;
        while (j < answers.length) {
          if (answers[j].id == answers[i].id) {
            this.answerActivities.push(answers[j]);
            this.answerActivities.push(answers[j + 1]);
            this.answerActivities.push(answers[j + 2]);
          }
          j += 3;
        }
        i += 3;
      }
      console.log(this.answerActivities);
    });
    this.ws.on('newStage', (data: { [key: string]: any }) => {
      this.show = true;
      this.anwserSubmitted = false;
      setTimeout(() => {
        this.show = false;
      }, 2000);
    });

    this.ws.on('stage', (data: { [key: string]: any }) => {
      console.log("stage" + data['stage'])
      this.stage = data['stage'] as number;
      if (this.stage == 2) {
        this.votationTime = true;
        this.answerTime = false;
        this.index = 0;
      }
      if (this.stage > 2)
        this.index += 6;

    });

    this.ws.on("timer", (data: { [key: string]: any }) => {
      if (data['timer'] == "¡Se acabó el tiempo!" && this.stage < 2) {
        this.submitAnswer();
      }

      this.timer = data['timer'];
    });
    this.ws.on("winner", (data: { [key: string]: any})=>{
      this.winner = data['playerWinner'];
      this.votationTime = false;
      this.winnerCheck = true;
    })
  }
}
