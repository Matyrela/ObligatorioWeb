import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../enviroment';
import { Router } from '@angular/router';


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
<<<<<<< HEAD
  
=======

  ws : WebSocket = new WebSocket(env.WebSocket + this.code);
>>>>>>> fb2204f247d36761b0f167124603a999fec9d1a3
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
    
    quitRoom() {
      this.http.post(env.baseURL + '/game/quit', {
        token : localStorage.getItem('token')
      }).subscribe((data: { [key: string]: any }) => {
        this.router.navigate(['menu']);
      });
    }

}
