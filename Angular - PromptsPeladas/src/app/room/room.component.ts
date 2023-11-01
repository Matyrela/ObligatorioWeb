import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../enviroment';
import { io, Socket } from "socket.io-client";
import { Router } from '@angular/router';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent {
  constructor (private http: HttpClient, private router: Router) {}
  code : string = "";
  roomName : string = "";
  conStatus : string = "";
  admin : string = "";

  ls = localStorage;

  playerList : Array<string> = new Array<string>();
  chatMessages: Array<string> = new Array<string>();

  message: string = "";

  ws!: Socket

  chatPop: HTMLAudioElement = new Audio('assets/sound/chatpop.mp3');

  ngOnInit() {
      this.http.post(
      env.baseURL + '/game/get', {
        token : localStorage.getItem('token')
      }).subscribe((data: { [key: string]: any }) => {
        this.code = data['code'];
        this.roomName = data['roomName'];
        this.conStatus = data['status'];
        this.admin = data['admin'].name;

        this.connWebSocket();

        let qrCanvas = document.getElementById('qrCode')
        QRCode.toCanvas(qrCanvas,  this.code, function (error: any) {
          if (error) console.error(error)
        })
      });
    }

  connWebSocket() {
    this.ws = io(env.WebSocket + this.code , {
      transports: ['websocket']
    });

    this.ws.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.ws.on("playerList", (data: { [key: string]: any }) => {
      this.playerList = new Array<string>();
      data['forEach']((element: any) => {
        this.playerList.push(element['name']);
      });
    });

    this.ws.on("chatMessage", (data: { [key: string]: any }) => {
      if(data['name'] == localStorage.getItem('userName'))
        this.chatMessages.push(data['name'] + " (Tú): " + data['message']);
      else {
        this.chatMessages.push(data['name'] + ": " + data['message']);
      }

      //CHAT COMMANDS
      if(data["message"] == "doabarrelroll" || data["message"] == "doflip"){
        if(!document.body.classList.contains("rotate")){
          document.body.classList.add("rotate");
          setTimeout(() => {
            document.body.classList.remove("rotate");
          }, 1100);
        }
      }else if(data["message"] == "30"){
        var audio = new Audio('assets/sound/wololo.mp3');
        audio.play();
      }
      //END CHAT COMMANDS

      if(data["message"] != "30"){
        this.chatPop.play();
      }

      setTimeout(() => {
        var element = document.getElementById("chat");
        if(element != null)
          element.scrollTop = element.scrollHeight;
      }, 5);
    });
  }

  sendMessage(){
    if(this.message == "")
      return;

    this.ws.emit('chatMessage', {
      name: localStorage.getItem('userName'),
      message: this.message
    });
    this.message = "";
  }

  ngOnDestroy() {
    if (this.ws) {
      this.ws.disconnect();
    }
  }
    
  quitRoom() {
    this.http.post(env.baseURL + '/game/quit', {
      token : localStorage.getItem('token')
    }).subscribe((data: { [key: string]: any }) => {
      if(data['removed'] == true)
        this.router.navigate(['menu']);
    });
  }
}
