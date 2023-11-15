import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { env } from '../enviroment';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

  reg: boolean = false;

  userName: string = "";
  userPassword: string = "";
  userPassword2: string = "";

  statusTitle: string = "";
  status: string = "";

  login() {
    this.statusTitle = "";
    this.status = "";

    this.http.post(
      env.baseURL + '/user/login', { userName: this.userName, userPassword: this.userPassword }
    ).subscribe((data: { [key: string]: any }) => {
      if (data['login'] == true) {
        localStorage.setItem('token', data['token']);
        localStorage.setItem('userName', this.userName);
        this.router.navigate(['']);
      } else {
        localStorage.setItem('token', 'null');
        localStorage.setItem('userName', 'null');
        this.statusTitle = "Error";
        this.status = "Usuario o contraseña incorrectos";
      }
    });
  }

  register() {
    this.statusTitle = "";
    this.status = "";

    if (this.userPassword == this.userPassword2) {
      this.http.post(
        env.baseURL + '/user/register', { userName: this.userName, userPassword: this.userPassword }
      ).subscribe((data: { [key: string]: any }) => {
        if (data['userCreated'] === true) {
          this.statusTitle = "Success";
          this.status = "Usuario creado con éxito";
          this.reg = false;
        } else {
          this.statusTitle = "Error";
          this.status = "El usuario ya existe";
        }
      });
    } else {
      this.statusTitle = "Error";
      this.status = "Las contraseñas no coinciden";
    }
  }

  ngOnInit() {
    let token = localStorage.getItem('token');
    if (token != null && token != undefined && token != 'null') {
      this.http.post(env.baseURL + '/user/validate', {
        token: token
      }).subscribe((data: { [key: string]: any }) => {
        if (data['valid'] == true) {
          this.router.navigate(['']);
        }
      });
    }
    console.log(token);
    //Chanchada abajo no mirar mucho
    document.body.style.backgroundColor = '#3f3f3f';
  }

  ngOnDestroy() {
    document.body.style.backgroundColor = '';
  }
  //Ya podes abrir los ojos otra vez ;)
}
