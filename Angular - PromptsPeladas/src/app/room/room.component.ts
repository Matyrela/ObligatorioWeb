import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../enviroment';

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

  ws : WebSocket = new WebSocket(env.WebSocket + this.code);
  ngOnInit() {
    this.ws.onopen = () => {
      console.log('WebSocket Client Connected to ' + this.code);
    };

    this.ws.onmessage = (message) => {
      console.log("WS SEND: " + message.data);
    }

    this.ws.send(JSON.stringify({
      'name' : localStorage.getItem('name')
    }));
    

    this.http.post(
      env.baseURL + '/game/get', {
        token : localStorage.getItem('token')
      }).subscribe((data: { [key: string]: any }) => {
        this.code = data['code'];
        this.roomName = data['roomName'];
        this.conStatus = data['status'];
      });

    }
  

}
