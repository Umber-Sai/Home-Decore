import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/shared/services/cart.service';
import { environment } from 'src/environments/environment';
import { CartType } from 'src/types/cart.type';
import { DefaultResponseType } from 'src/types/default-response.type';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit{

  cart: CartType | null = null;
  serverStaticPath: string = environment.serverStaticPath;
  totalAmount: number = 0;
  totalCount: number = 0


  constructor(
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.cartService.getCart().subscribe((data: CartType | DefaultResponseType) => {
      if((data as DefaultResponseType).error !== undefined) {
        throw new Error((data as DefaultResponseType).message);
      }

      this.cart = data as CartType;
      this.calcTotla()
    });
  }

  calcTotla(): void {
    this.totalAmount = 0;
    this.totalCount = 0;
    if(this.cart) {
      this.cart.items.forEach(item => {
        this.totalAmount += item.quantity;
        this.totalCount += item.product.price * item.quantity;
      })
    }
  }

  updateCount(quantity : number, productId: string): void {
    this.cartService.updateCart(productId, quantity)
      .subscribe((cart: CartType | DefaultResponseType) => {
        if((cart as DefaultResponseType).error !== undefined) {
          throw new Error((cart as DefaultResponseType).message);
        }
        this.cart = cart as CartType;
        this.calcTotla()
      })
  }
}
