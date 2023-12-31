import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../enviroment';
import { io, Socket } from "socket.io-client";
import { Router } from '@angular/router';
import * as QRCode from 'qrcode';
import * as Toastify from 'toastify-js'
import { DocumentVisibilityService } from '../clases/document-visibility-service.service';
import { Player } from '../clases/Player';
import { Proposal } from '../clases/proposal';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent {
  constructor(private http: HttpClient, private router: Router, private documentVisibilityService: DocumentVisibilityService) { }
  code: string = "";
  roomName: string = "";
  conStatus: string = "";
  admin: string = "";

  viewProposals: boolean = false;

  ls = localStorage;

  playerList: Array<Player> = new Array<Player>();
  private previousPlayerList: Array<Player> = new Array<Player>();
  chatMessages: Array<string> = new Array<string>();

  message: string = "";

  ws!: Socket

  chatPop: HTMLAudioElement = new Audio('assets/sound/chatpop.mp3');

  start: boolean = false;

  proposals: any[] = [];
  selectedProposalID: any = null;

  mp3: HTMLAudioElement = new Audio('assets/sound/life.mp3');

  ngOnInit() {
    this.updateProposalsAll();
    this.http.post(
      env.baseURL + '/game/get', {
      token: localStorage.getItem('token')
    },{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).subscribe((data: { [key: string]: any }) => {

      if(data['error'] == 'Token invalido'){
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        this.router.navigate(['/login']);
      }

      this.code = data['code'];
      this.roomName = data['roomName'];
      this.conStatus = data['status'];
      this.admin = data['admin'];

      if (this.code === "INVALID") {
        this.router.navigate(['menu']);
      } else {
        this.connWebSocket();

        this.generateQR();
      }
    });


    this.documentVisibilityService.getVisibilityChangeObservable()
      .subscribe(isVisible => {
        if (!isVisible) {
          this.ws.emit('clientChangeStatus', {
            name: localStorage.getItem('userName'),
            status: "away"
          });
        } else {
          this.ws.emit('clientChangeStatus', {
            name: localStorage.getItem('userName'),
            status: "active"
          });
        }
      });
  }

  countdown: string = "";

  startCountdown(countDown: number): void {
    if (this.start)
      return;


      if(this.admin == localStorage.getItem("userName")){
        if((this.selectedProposalID == "" || this.selectedProposalID == null)){
          Toastify({
            text: "Debes seleccionar una propuesta",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
              background: "#ff0000",
            },
          }).showToast();
          return;
        }else if(this.playerList.length < 3){
          Toastify({
            text: "Debes tener al menos 3 jugadores",
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
              background: "#ff0000",
            },
          }).showToast();
          return;
        }
      }
      
    
    if(this.mp3.paused == false){
      this.mp3.pause();
    }
    this.start = true;
    let selectedProposal = null;
    this.proposals.forEach(proposal => {
      if (proposal._id == this.selectedProposalID) {
        selectedProposal = proposal;
        return;
      }
    });
    console.log(selectedProposal);

    if (this.ws != null && selectedProposal != null) {
      this.ws.emit('startGame', {
        'name': localStorage.getItem('userName'),
        'proposal': selectedProposal
      });
    }


    const intervalId = setInterval(() => {
      if (countDown >= 1) {

        this.countdown = countDown.toString();

        countDown--;
      } else {
        clearInterval(intervalId);
        this.countdown = "";
        localStorage.setItem("gameCode", this.code);
        this.router.navigate(['game']);
      }
    }, 1000);
  }


  connWebSocket() {
    this.ws = io(env.WebSocket + this.code, {
      transports: ['websocket']
    });

    this.ws.on("startGame", () => {
      this.startCountdown(3);
    })

    this.ws.on("connect", () => {
      this.ws.emit('clientChangeStatus', {
        name: localStorage.getItem('userName'),
        status: "active"
      });
    });

    this.ws.on("clientChangeStatus", (data: { [key: string]: any }) => {
      this.playerList.forEach(player => {
        if (player.name == data["name"]) {
          player.status = data["status"];
        }
      });
    });

    this.ws.on("playerList", (data: string[]) => {
      data.forEach((playerName) => {
        const existingPlayer = this.playerList.find(player => player.name.toLowerCase() === playerName.toLowerCase());

        if (!existingPlayer) {
          const player = new Player(playerName);
          this.playerList.push(player);
        }
      });
      this.playerList = this.playerList.filter(player => data.some(playerName => player.name.toLowerCase() === playerName.toLowerCase()));

      const addedPlayers = this.playerList.filter(player => !this.previousPlayerList.some(prevPlayer => prevPlayer.name === player.name));
      const removedPlayers = this.previousPlayerList.filter(prevPlayer => !this.playerList.some(player => player.name === prevPlayer.name));

      if (this.previousPlayerList.length > 0) {
        addedPlayers.forEach(player => {
          Toastify({
            text: `¡${player.name} se ha unido!`,
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
            text: `¡${player.name} se ha desconectado!`,
            duration: 3000,
            gravity: "top",
            position: "right",
            style: {
              background: "#ff0000",
            },
          }).showToast();
        });
      }

      this.previousPlayerList = this.playerList.slice();
    });

    this.ws.on("adminChange", (data: { [key: string]: any }) => {
      console.log("ADMINCHANGE!!!!!!!!!", data)
      this.admin = data['name'];
      if (this.admin === localStorage.getItem("userName")) {
        Toastify({
          text: data['name'] + " (Tú) es el nuevo administrador",
          duration: 3000,
          gravity: "top",
          position: "right",
          style: {
            background: "#0d6efd",
          },
        }).showToast();
      } else {
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
      if (data['server'] == true) {
        this.chatMessages.push(data['message']);
      } else {
        if (data['name'] == localStorage.getItem('userName'))
          this.chatMessages.push(data['name'] + " (Tú): " + data['message']);
        else {
          this.chatMessages.push(data['name'] + ": " + data['message']);
        }
      }

      //CHAT COMMANDS
      if (data["message"] == "doabarrelroll" || data["message"] == "doflip") {
        if (!document.body.classList.contains("rotate")) {
          document.body.classList.add("rotate");
          setTimeout(() => {
            document.body.classList.remove("rotate");
          }, 1100);
        }
      } else if (data["message"] == "30") {
        var audio = new Audio('assets/sound/wololo.mp3');
        audio.play();
      }else if(data["message"] == "!img:https://media.tenor.com/tC5i46ntiDsAAAAd/life-could-be-a-dream.gif"){
        this.mp3.currentTime = 0;
        if(this.mp3.paused){
          this.mp3.play();
        }
      }
      //END CHAT COMMANDS

      if (data["message"] != "30") {
        this.chatPop.play();
      }

      setTimeout(() => {
        var element = document.getElementById("chat");
        if (element != null)
          element.scrollTop = element.scrollHeight;
      }, 5);
    });
  }

  sendMessage() {
    if (this.message == "")
      return;

    this.ws.emit('chatMessage', {
      name: localStorage.getItem('userName'),
      message: this.message
    });
    this.message = "";
  }

  updateProposals() {
    this.http.post(
      env.baseURL + '/proposal/get', { token: localStorage.getItem('token') }, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).subscribe((data: { [key: string]: any }) => {
        console.log(data);
        this.proposals = data['proposals'];
      });
  }

  updateProposalsAll() {
    this.http.get(
      env.baseURL + '/proposal/getAll',{
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).subscribe((data: { [key: string]: any }) => {
        console.log(data);
        this.proposals = data['proposals'];
      });
  }
  
  checkProposalStatus(event:any){
    if(event.target.checked == true){
      
      let radioValue = event.target.id;
      this.selectedProposalID = radioValue;
    }
  }
  
  ngOnDestroy() {
    if (this.ws) {
      this.ws.disconnect();
    }
  }

  quitRoom() {
    this.http.post(env.baseURL + '/game/quit', {
      token: localStorage.getItem('token')
    },{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).subscribe((data: { [key: string]: any }) => {
      if (data['removed'] == true) {
        if(this.mp3.paused == false){
          this.mp3.pause();
        }
        this.router.navigate(['menu']);
      } else {
        Toastify({
          text: "No se ha podido abandonar la sala",
          duration: 3000,
          gravity: "top",
          position: "right",
          style: {
            background: "#ff0000",
          },
        }).showToast();
      }
    });
  }

  toggleProposals() {
    this.viewProposals = !this.viewProposals
    if(!this.viewProposals){
      //Este setTimeout esta porque angular quita el elemento del DOM con el id qrCode, entonces la funcion tira error, al esperar 15ms, el elemento ya esta en el DOM
      setTimeout(() => {
        this.generateQR();
      }, 15);
      }
  }

  generateQR(){
      let qrCanvas = document.getElementById('qrCode')
      QRCode.toCanvas(qrCanvas, env.angularURL + "menu/" + this.code, function (error: any) {
        if (error) console.error(error)
      })
  }
}
