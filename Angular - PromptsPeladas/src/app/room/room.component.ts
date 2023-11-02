import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../enviroment';
import { io, Socket } from "socket.io-client";
import { Router } from '@angular/router';
import * as QRCode from 'qrcode';
import * as Toastify from 'toastify-js'

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
  private previousPlayerList: string[] = [];
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
        QRCode.toCanvas(qrCanvas,  env.angularURL + "menu/" + this.code, function (error: any) {
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
      this.playerList = data['map']((element: any) => element['name']);

      const addedPlayers = this.playerList.filter(player => !this.previousPlayerList.includes(player));
      const removedPlayers = this.previousPlayerList.filter(player => !this.playerList.includes(player));

      console.log(this.previousPlayerList);

      if(this.previousPlayerList.length > 0){
        addedPlayers.forEach(player => {
          Toastify({
            text: `¡${player} se ha unido!`,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
              background: "#0d6efd",
            },
          }).showToast();
        });
      
        removedPlayers.forEach(player => {
          Toastify({
            text: `¡${player} se ha desconectado!`,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
              background: "#ff0000",
            },
          }).showToast();
        });
      }
    
      this.previousPlayerList = this.playerList;

    });

    this.ws.on("adminChange", (data: { [key: string]: any }) => {
      this.admin = data['name'];
      if(this.admin === localStorage.getItem("userName")){
        Toastify({
          text: data['name'] + " (Tú) es el nuevo administrador",
          duration: 3000,
          gravity: "top",
          position: "right",
          style: {
            background: "#0d6efd",
          },
        }).showToast();
      }else{
        Toastify({
          text: data['name'] + " es el nuevo administrador",
          duration: 3000,
          gravity: "top",
          position: "right",
          style: {
            background: "#0d6efd",
          },
        }).showToast();
      }
      
    });

    this.ws.on("chatMessage", (data: { [key: string]: any }) => {
      if(data['server'] == true){
        this.chatMessages.push(data['message']);
      }else{
        if(data['name'] == localStorage.getItem('userName'))
          this.chatMessages.push(data['name'] + " (Tú): " + data['message']);
        else {
          this.chatMessages.push(data['name'] + ": " + data['message']);
        }
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
