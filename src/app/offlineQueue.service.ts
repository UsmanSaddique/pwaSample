// offline-queue.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OfflineQueueService {
  private online = navigator.onLine;
  private cache: { [url: string]: HttpRequest<any>[] } = {};
  private onlineStatusChanged = new Subject<boolean>();
  
  constructor(private http: HttpClient) {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.online = false);
  }

  addRequest(request: HttpRequest<any>) {
    const url = request.url;
    if (!this.cache[url]) {
      this.cache[url] = [];
    }
    this.cache[url].push(request);
  }

  private handleOnline() {
    this.online = true;
    this.onlineStatusChanged.next(true);
    Object.keys(this.cache).forEach(url => {
      const requests = this.cache[url];
      requests.forEach(request => {
        this.http.request(request).pipe(
          tap(() => {
            console.log(`Request to ${url} successfully replayed.`);
          }),
          catchError((error: any) => {
            console.error(`Failed to replay request to ${url}:`, error);
            return of(error);
          })
        ).subscribe();
      });
      debugger
      delete this.cache[url];
    });
    
  }

  isOnline(): boolean {
    return this.online;
  }
  getOnlineStatusChanged(): Subject<boolean> {
    return this.onlineStatusChanged;
  }
}
