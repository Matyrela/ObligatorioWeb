import { Injectable } from '@angular/core';
import { fromEvent, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentVisibilityService {
  private visibilityChange$: Observable<boolean>;

  constructor() {
    this.visibilityChange$ = fromEvent(document, 'visibilitychange')
      .pipe(map(() => !document.hidden));
  }

  getVisibilityChangeObservable(): Observable<boolean> {
    return this.visibilityChange$;
  }
}
