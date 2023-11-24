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
  votation: boolean = false;
  winner: string ="";
  winnerCheck : boolean = false;
  anwserSubmitted: boolean = false;

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
    this.ws.emit('submitAnswer', {'activities' : this.myActivities[this.stage] , 'userName': localStorage.getItem("userName"), 'answer': this.answer });
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
      let content = data['answerActivities'] as any[];
      let orderContent : any[] = [];
      let i = 0;
      while (content.length != orderContent.length) { 
        if (!orderContent.includes(content[i])) {
          orderContent.push(content[i]);
          orderContent.push(content[i + 1]);
          orderContent.push(content[i + 2]);
          let j = i+3;
          while (j < content.length - 1) {
            if (content[j]?.id === content[i]?.id && content[i+1] === content[j+1] && content[j+2] !== '') {
              orderContent.push(content[j]);
              orderContent.push(content[j + 1]);
              orderContent.push(content[j + 2]);
              break;
            }
            j += 3;
          }
        }
        
        i += 3;
      }
      i = 0;
      let finalList : any[] = []; //tengo que hacer esto porque ts es una basura y no me eliminaba los strings vacios, que por algun motivo eran muchos
      while (i < orderContent.length) {
        if (orderContent[i + 2] === "" || orderContent[i+1] === "" || orderContent[i] === "") {
          orderContent.splice(i, 3);
        }else{
          if (orderContent[i+1] !== localStorage.getItem("userName") && orderContent[i+2] !== localStorage.getItem("userName")){
            finalList.push(orderContent[i]);
            finalList.push(orderContent[i+1]);
            finalList.push(orderContent[i+2]);
          } //poner este if para que el jugador no pueda votar sus propias respuestas
          
        }
        i += 3;
      }
      this.answerActivities = finalList;
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
        this.votation = true;
        console.log("votation" + this.votation);
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
      this.votation = false;
      this.winnerCheck = true;
    })
  }
}
