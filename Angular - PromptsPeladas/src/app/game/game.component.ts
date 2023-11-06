import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { env } from '../enviroment';
import { io } from "socket.io-client";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
  ws!: any;

  code : string = "";
  prompt: string = "";
  author: string = "";
  answer: string = "";

  anwserSubmitted: boolean = false;

  timer: string = "--";
  show: boolean = false;

  constructor (private http: HttpClient, private router: Router) {}
  
  ngOnInit(){
    this.http.post(env.baseURL + '/game/reconnect', { token: localStorage.getItem('token') }).subscribe((data: { [key: string]: any }) => {
      if(data['code'] != undefined && data['code'] != null && data['code'] != 'INVALID'){
        this.code = data['code'];
        this.connWebSocket();
      }
    });
  }

  submitAnswer() {
    this.anwserSubmitted = true;
    this.ws.emit('submitAnswer', {'username' : localStorage.getItem("userName"), 'answer' : this.answer });
    this.answer = "";
  }

  connWebSocket() {
    this.ws = io(env.WebSocket + this.code , {
      transports: ['websocket']
    });

    this.ws.on("currentActivity", (data: { [key: string]: any }) => {
      this.prompt = data['description'];
      this.author = data['playerName'];
      this.show = true;
      setTimeout(() => {
        this.show = false;
      }, 3000);
    })

    this.ws.on("timer", (data: { [key: string]: any }) => {
      if(data['timer'] == 0){
        this.submitAnswer();
      }

      this.timer = data['timer'] < 10 ? "0" + data['timer'] : "" + data['timer'];
    })
  }
}
