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
  
  ngOnInit() {
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
