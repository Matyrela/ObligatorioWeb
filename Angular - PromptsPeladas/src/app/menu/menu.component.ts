import { Component, ViewChild } from '@angular/core';
import {clientStatus} from "../clases/EclientStatus";
import { env } from "../enviroment"
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as Toastify from 'toastify-js';
import { scan } from 'rxjs';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  roomName: string = "";
  roomId: string = "";
  isServerConnected: boolean = false;
  
  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

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
    this.videoElement = document.getElementById("videoqr") as HTMLVideoElement;
  }

  videoElement!: HTMLVideoElement;

  scanQR() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        import('qr-scanner').then(QrScanner => {
          if (this.videoElement) {
            this.videoElement.classList.remove("hidden");
  
            let scanner = new QrScanner.default(
              this.videoElement,
              result => {
                if (result.data.includes('http') && result.data.includes("menu")) {
                  scanner.pause();
                  scanner.stop();
                  scanner.destroy();
                  setTimeout(() => {
                    this.connectRoom(result.data.split("menu/")[1]);
                  }, 1000);
                }
              },
              {
                onDecodeError: error => {
                  console.error(error);
                },
                highlightScanRegion: true,
                highlightCodeOutline: true,
              }
            );
  
            scanner.start();
          }
        });
      })
      .catch(error => {
        console.error('Error al acceder a la cámara:', error);
        // Puedes manejar el error de acceso a la cámara aquí
      });
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
    code = code.toUpperCase();
    
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
            text: `¡No se pudo conectar a la sala ${code}!`,
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