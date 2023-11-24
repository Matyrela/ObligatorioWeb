import { Component, ViewChild } from '@angular/core';
import {clientStatus} from "../clases/EclientStatus";
import { env } from "../enviroment"
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as Toastify from 'toastify-js';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  roomName: string = "";
  roomId: string = "";
  isServerConnected: boolean = false;
  userName: string = "";
  
  constructor(private http: HttpClient, public router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      if(params.get('code') != null && params.get('code') != undefined){
        this.connectRoom(params.get('code') as string);
      }
    });
   if(localStorage.getItem('code') != undefined && localStorage.getItem('code') != null && localStorage.getItem('code') != 'null'){
      this.connectRoom(localStorage.getItem('code') as string);
      localStorage.removeItem('code');
   }

   this.userName = localStorage.getItem('userName') as string;

    document.body.style.background = "rgb(134,203,255)";
    document.body.style.background = "linear-gradient(90deg, rgba(134,203,255,1) 0%, rgba(180,170,213,1) 50%, rgba(134,203,255,1) 100%)";
    let menu = document.getElementById("menu");
    let menuSize = menu?.clientHeight;
    let documentSize = document.documentElement.clientHeight;
    if(menuSize != undefined && menuSize != null && documentSize != undefined && documentSize != null){
      let marginTop = (documentSize - menuSize) / 2;
      menu?.setAttribute("style", "margin-top: " + marginTop + "px;");
    }

  


    this.http.get(env.baseURL + '/ping').subscribe((data: { [key: string]: any }) => {
      if(data['ping'] == 'pong'){
        this.isServerConnected = true;
      }
    });
    
    this.http.post(env.baseURL + '/game/reconnect', {
      token: localStorage.getItem('token')
    }).subscribe((data: { [key: string]: any }) => {
      if(data['code'] != undefined && data['code'] != null && data['code'] != 'INVALID'){
        if(data['started'] == true){
          this.router.navigate(['game']);
        }else{
          this.connectRoom(data['code']);
        }
      }
    });
    this.videoElement = document.getElementById("videoqr") as HTMLVideoElement;
  }

  videoElement!: HTMLVideoElement;
  scanning: boolean = false;
  scanner: any;

  scanQR() {
      if (!this.scanning) {
        this.scanning = true;

        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(stream => {
        import('qr-scanner').then(QrScanner => {
          if (this.videoElement) {
            this.videoElement.classList.remove("hidden");
  
            this.scanner = new QrScanner.default(
              this.videoElement,
              result => {
                if (result.data.includes('http') && result.data.includes("menu")) {
                  this.scanner.pause();
                  this.scanner.stop();
                  this.scanner.destroy();
                  setTimeout(() => {
                    this.connectRoom(result.data.split("menu/")[1]);
                  }, 1000);
                }
              },
              {
                onDecodeError: error => {},
                highlightScanRegion: true,
                highlightCodeOutline: true,
              }
            );
  
            this.scanner.start();
          }
        });
      })
      .catch(error => {
        console.error('Error al acceder a la cámara:', error);
      });
    }
    else{
      this.scanning = false;
      this.videoElement.classList.add("hidden");
      this.scanner.pause();
      this.scanner.stop();
      this.scanner.destroy();
    }
    
  }

  logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    this.router.navigate(['login']);
  }

  createRoom(name: string) {
    this.roomName = name;
    let token = localStorage.getItem('token');
    if(token != null && token != undefined && token != 'null'){
    this.http.post(env.baseURL + '/game/create', {
      token: token,
      roomName: name
    }).subscribe((data: { [key: string]: any }) => {
      if(data['gameCreated']){
        Toastify({
          text: `¡Sala ${name} creada!`,
          duration: 3000,
          gravity: "bottom",
          position: "right",
          style: {
            background: "#0d6efd",
          },
        }).showToast();
        this.connectRoom(data['code']);
      }else{
        Toastify({
          text: `¡No se pudo crear la sala ${name}!`,
          duration: 3000,
          gravity: "bottom",
          position: "right",
          style: {
            background: "#ff0000",
          },
        }).showToast();

        this.http.post(env.baseURL + '/user/validate', {
          token: localStorage.getItem('token')
        }).subscribe((data: { [key: string]: any }) => {
          if(data['valid'] == false){
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            Toastify({
              text: `¡Login invalido!`,
              duration: 3000,
              gravity: "bottom",
              position: "right",
              style: {
                background: "#ff0000",
              },
            }).showToast();
            this.router.navigate(['login']);
          }
        });

      }
    }); 
    }else{
      this.router.navigate(['login']);
    }
  }
  
  connectRoom(code: string) {
    if(code.length < 4){
      Toastify({
        text: `¡El codigo debe tener 4 caracteres!`,
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: {
          background: "#ff0000",
        },
      }).showToast();
      return;
    }

    let token = localStorage.getItem('token');
    if(token != null && token != undefined && token != 'null'){
      this.http.post(env.baseURL + '/game/join', {  
        token: token,
        code: code
      }).subscribe((data: { [key: string]: any }) => {
        if(data['joined'] == true){
          Toastify({
            text: `¡Uniendote a ${code}!`,
            duration: 3000,
            gravity: "bottom",
            position: "right",
            style: {
              background: "#0d6efd",
            },
          }).showToast();
          this.router.navigate(['room']);
        }else{
          Toastify({
            text: `¡No se pudo encontrar la sala ${code}!`,
            duration: 3000,
            gravity: "bottom",
            position: "right",
            style: {
              background: "#ff0000",
            },
          }).showToast();
        }
      });
    }else{
      this.router.navigate(['login']);
    }
  }

  ngOnDestroy(): void {
    document.body.style.background = "white";
  }

  protected readonly clientStatus = clientStatus;
  protected readonly console = console;
}