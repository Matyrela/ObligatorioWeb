import { Component } from '@angular/core';
import {Room} from "../clases/room";
import {clientStatus} from "../clases/EclientStatus";
import {ConectionHandlerService} from "../clases/conection-handler.service";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  conStatus: clientStatus = clientStatus.disconnected;
  public roomName: string = "";
  isServerConnected: boolean = false;
  conn: ConectionHandlerService;

  public publicRooms: Array<Room> = [];

  constructor(conection: ConectionHandlerService ) {
    this.conn = conection;
    this.loadAvailableRooms();
    this.publicRooms = this.conn.aviableRooms;
  }
  loadAvailableRooms() {
    if(this.conn.connStatus) {
        this.conn.getAvailableRooms();
    }else{
      setTimeout(() => {
        this.loadAvailableRooms();
      });
    }
  }

  createRoom(name: string) {
    this.conStatus = clientStatus.waiting;
    this.roomName = name;
    console.log('Creating room ' + name + '...');
  }

  connectRoom(room: Room) {
    this.conStatus = clientStatus.waiting;
    this.roomName = room.name;
    console.log('Connecting to room ' + room.id + '...');
  }

  protected readonly clientStatus = clientStatus;
  protected readonly console = console;
}
