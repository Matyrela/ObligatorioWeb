import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { env } from '../enviroment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {

  constructor(private http: HttpClient, private router: Router ){}

  reg:boolean = false;

  userName: string = "";
  userPassword: string = "";
  userPassword2: string = "";

  login(){
    this.http.post(
    env.baseURL + '/user/login', {userName: this.userName, userPassword: this.userPassword}
    ).subscribe((data: { [key: string]: any }) => {
      if(data['login'] == true){
        localStorage.setItem('token', data['token']);
        localStorage.setItem('userName', this.userName);
        this.router.navigate(['']);
      }else{
        localStorage.setItem('token', 'null');
        localStorage.setItem('userName', 'null');
        alert('Login inválido');
      }
    });
  }

  register(){
    if(this.userPassword == this.userPassword2){
      this.http.post(
        env.baseURL + '/user/register', {userName: this.userName, userPassword: this.userPassword}
      ).subscribe((data: { [key: string]: any }) => {
        if(data['userCreated'] === true){
          alert('Usuario creado');
          this.reg = false;
        }else{
          alert('Usuario ya existe');
        }
      });
    }else{
      alert('Contraseñas no coinciden');
    }
  }

  //Chanchada abajo no mirar mucho
  ngOnInit() {
    document.body.style.backgroundColor = '#3f3f3f';
  }

  ngOnDestroy() {
    document.body.style.backgroundColor = '';
  }
  //Ya podes abrir los ojos otra vez ;)
}
