import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Item {
  id?: number;  // Optional because it's not needed for creation
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private baseUrl = 'https://localhost:7059/items';  // Adjust the port as per your .NET application
  private httpHeaders = new HttpHeaders({
    'accept': 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    'referer': 'https://localhost:7059/swagger/index.html',
    'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  });
  constructor(private http: HttpClient) { }

  // Create a new item
  addItem(item: Item): Observable<Item> {
    return this.http.post<Item>(this.baseUrl, item, { headers: this.httpHeaders });
  }
  buildAddItemRequest(item: Item): HttpRequest<Item> {
    return new HttpRequest<Item>('POST', this.baseUrl, item, { headers: this.httpHeaders });
  }
  // Get all items
  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.baseUrl, { headers: this.httpHeaders });
  }

  // Get a single item by id
  getItemById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.baseUrl}/${id}`,{ headers: this.httpHeaders });
  }

  // Update an item
  updateItem(id: number, item: Item): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, item,{ headers: this.httpHeaders });
  }
  buildUpdateItemRequest(id: number, item: Item): HttpRequest<Item> {
    return new HttpRequest<Item>('PUT', `${this.baseUrl}/${id}`, item, { headers: this.httpHeaders });
  }
  // Delete an item
  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`,{ headers: this.httpHeaders });
  }
  buildDeleteItemRequest(id: number): HttpRequest<any> {
    return new HttpRequest<any>('DELETE', `${this.baseUrl}/${id}`, { headers: this.httpHeaders });
  }
}
