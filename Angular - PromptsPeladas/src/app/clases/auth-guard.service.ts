import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { env } from '../enviroment';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard{
  constructor(private router: Router, private http: HttpClient) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
      
    let token = localStorage.getItem("token");
    if(token == undefined || token == null){
      this.router.navigate(["login"]);
      return false;
    }

    this.http.post(
      env.baseURL + '/user/validate', {token: token}
    ).subscribe((data: { [key: string]: any }) => {
      if(data['valid'] == true){
        return true;
      }else{
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        this.router.navigate(["login"]);
        return false;
      }
    });

    return true;
  }
}
