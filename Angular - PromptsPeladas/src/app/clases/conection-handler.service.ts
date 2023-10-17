import { Injectable } from '@angular/core';
import {MenuComponent} from "../menu/menu.component";
import {Room} from "./room";
@Injectable({
  providedIn: 'root'
})
export class ConectionHandlerService {

  public webSocket: WebSocket;
  public connStatus: boolean = false;

  public aviableRooms: Array<Room> = [];

  constructor() {
    console.log('Connecting to Java Spring server...');
    this.webSocket = new WebSocket('ws://localhost:8080/public');

    this.webSocket.onopen = () => {
      console.log('Conectado al servidor');
      this.connStatus = true;
    };

    this.webSocket.onerror = (error) => {
      console.error('Error al conectar al servidor:', error);
      this.connStatus = false;
    };

    this.webSocket.onmessage = (event) => {
      let serverData = JSON.parse(event.data);

      if (serverData.requestType == "RequestAviableRooms") {
          for (let room of serverData.responseData) {
            this.aviableRooms.push(new Room(room.id, room.name, room.maxPlayers, room.players));
          }

      } else {
        console.error('Mensaje inesperado recibido:', event.data);
      }
    };
  }


  getAvailableRooms(): void{
    this.webSocket.send('getAvailableRooms');
  }
}
