import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DefaultTitleStrategy } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CartType } from 'src/types/cart.type';
import { DefaultResponseType } from 'src/types/default-response.type';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  count: number = 0;

  constructor(private http : HttpClient) { }

  getCart(): Observable<CartType | DefaultResponseType> {
    return this.http.get<CartType | DefaultResponseType>(environment.api + 'cart', {withCredentials: true});
  }

  updateCart(productId: string, quantity: number): Observable<CartType | DefaultResponseType>  {
    return this.http.post<CartType | DefaultResponseType>(environment.api + 'cart', {productId, quantity}, {withCredentials: true})
    .pipe(
      tap(data => {
        if (!data.hasOwnProperty('error')) {
          this.count = 0;
          (data as CartType).items.forEach(item => {
            this.count += item.quantity;
          });
        }

      })
    );
  }

  getCartCount(): Observable<{count : number} | DefaultResponseType> {
    return this.http.get<{count : number} | DefaultResponseType>(environment.api + 'cart/count', {withCredentials: true})
    .pipe(
      tap(data => {
        if(!data.hasOwnProperty('error')) {
          this.count = (data as {count : number}).count;
        }
        
      })
    );;
  }

}
