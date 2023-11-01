import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../enviroment';
import { io, Socket } from "socket.io-client";

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent {
  constructor (private http: HttpClient) {}
  code : string = "";
  roomName : string = "";
  conStatus : string = "";

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

        this.connWebSocket();
      });
    }

  connWebSocket() {
    this.ws = io(env.WebSocket, {
      transports: ['websocket'], // Use WebSocket transport
    });

    this.ws.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.ws.on("playerList", (data: { [key: string]: any }) => {
      this.playerList = new Array<string>();
      data['forEach']((element: any) => {
        if(element['name'] != localStorage.getItem('userName'))
          this.playerList.push(element['name']);
        else
          this.playerList.push(element['name'] + " (Tú)");
      });
    });

    this.ws.on("chatMessage", (data: { [key: string]: any }) => {
      if(data['name'] == localStorage.getItem('userName'))
        this.chatMessages.push(data['name'] + " (Tú): " + this.urlFromText(data['message']));
      else {
        this.chatMessages.push(data['name'] + ": " + this.urlFromText(data['message']));
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

      if(!(data["message"] == "30")){
        this.chatPop.play();
      }

      setTimeout(() => {
        var element = document.getElementById("chat");
        if(element != null)
          element.scrollTop = element.scrollHeight;
      }, 100);
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

  urlFromText(text: string) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
      return '<a href="' + url + '">' + url + '</a>';
    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
  }
  ngOnDestroy() {
    if (this.ws) {
      this.ws.disconnect();
    }
  }
}
