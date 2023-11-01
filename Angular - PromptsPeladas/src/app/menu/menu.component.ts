import { Component } from '@angular/core';
import {Room} from "../clases/room";
import {clientStatus} from "../clases/EclientStatus";
import { env } from "../enviroment"
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  conStatus: clientStatus = clientStatus.disconnected;
  roomName: string = "";
  roomId: string = "";
  isServerConnected: boolean = false;
  
  constructor(private http: HttpClient, private router: Router) {}
  
  ngOnInit(): void {
    document.body.style.background = "rgb(134,203,255)";
    document.body.style.background = "linear-gradient(90deg, rgba(134,203,255,1) 0%, rgba(180,170,213,1) 50%, rgba(134,203,255,1) 100%)";

    this.http.get(env.baseURL + '/ping').subscribe((data: { [key: string]: any }) => {
      if(data['ping'] == 'pong'){
        this.isServerConnected = true;
      }
    });
    this.http.post(env.baseURL + '/game/reconnect', {
      token: localStorage.getItem('token')
    }).subscribe((data: { [key: string]: any }) => {
      if(data['code'] != undefined && data['code'] != null && data['code'] != 'INVALID'){
        this.connectRoom(data['code']);
      }
    });
  }
  createRoom(name: string) {
    this.conStatus = clientStatus.waiting;
    this.roomName = name;
    console.log('Creating room ' + name + '...');
    
    this.http.post(env.baseURL + '/game/create', {
      token: localStorage.getItem('token'),
      roomName: name
    }).subscribe((data: { [key: string]: any }) => {
      if(data['gameCreated']){
        console.log('Sala creada con exito');
        this.conStatus = clientStatus.connected;
        this.connectRoom(data['code']);
      }else{
        console.log('Error al crear la sala');
        this.conStatus = clientStatus.disconnected;
      }
    }); 
  }
  
  connectRoom(code: string) {
    let token = localStorage.getItem('token');
    if(token != null && token != undefined && token != 'null'){
      this.http.post(env.baseURL + '/game/join', {  
        token: token,
        code: code
      }).subscribe((data: { [key: string]: any }) => {
        if(data['joined']){
          console.log('Conectado a la sala');
          this.router.navigate(['room']);
          this.conStatus = clientStatus.connected;
        }else{
          console.log('Error al conectarse a la sala');
          this.conStatus = clientStatus.disconnected;
        }
      });
    }
  }

  ngOnDestroy(): void {
    document.body.style.background = "white";
  }

  protected readonly clientStatus = clientStatus;
  protected readonly console = console;
}