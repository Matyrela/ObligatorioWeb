import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { env } from '../enviroment';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard{
  constructor(private router: Router, private http: HttpClient) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
      
    let urlStateArray = route.url.toString().split(',');
    console.log(urlStateArray);

    let token = localStorage.getItem("token");
    if(token == undefined || token == null){
      if(urlStateArray[0] == 'menu'){
        localStorage.setItem("code", urlStateArray[1]);
      }
      this.router.navigate(["login"]);
      return false;
    }

    this.http.post(
      env.baseURL + '/user/validate', {token: token}
    ).subscribe((data: { [key: string]: any }) => {
      if(data['valid'] == true){
        return true;
      }else{
        if(urlStateArray[0] == 'menu'){
          localStorage.setItem("code", urlStateArray[1]);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        this.router.navigate(["login"]);
        return false;
      }
    });

    return true;
  }
}
