import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/shared/services/cart.service';
import { FavoriteService } from 'src/app/shared/services/favorite.service';
import { environment } from 'src/environments/environment';
import { CartType } from 'src/types/cart.type';
import { DefaultResponseType } from 'src/types/default-response.type';
import { FavoriteType } from 'src/types/favorite.type';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit{

  products : FavoriteType[] = [];
  serverStaticPath: string = environment.serverStaticPath

  constructor(
    private favoriteService : FavoriteService,
    private cartService : CartService,
  ) {

  }

  ngOnInit(): void {
    this.favoriteService.getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }

        this.cartService.getCart()
          .subscribe((cartData: CartType | DefaultResponseType) => {
            if((cartData as DefaultResponseType).error) {
              const error = (cartData as DefaultResponseType).message;
              throw new Error(error);
            }

            const cartProducts = cartData as CartType
            this.products = (data as FavoriteType[]).map(product => {
              const productInCart = cartProducts.items.find(cartProduct => cartProduct.product.id === product.id)
              if(productInCart) {
                product.inCartCount = productInCart.quantity
              }
              return product
            });
            console.log(this.products)
      })

        
      });
  }

  removeFromFavorites(id: string) :void {
    this.favoriteService.removeFavorite(id)
      .subscribe((data: DefaultResponseType) => {
        if(data.error) {
          throw new Error(data.message);
        }

        this.products = this.products.filter(item => item.id !== id);
      })
  }

  updateCount(id: string, quantity: number) {
    console.log('hello')
    this.cartService.updateCart(id, quantity)
      .subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error) {
          throw new Error((data as DefaultResponseType).message);
        }
        const updatedProductInCart = this.products.find(item => item.id === id);
        if(updatedProductInCart) {
          if(quantity === 0) {
            delete updatedProductInCart?.inCartCount;
          } else {
            updatedProductInCart.inCartCount = quantity;
          }
        } else {
          throw new Error('product not found')
        }
      })
  }
}
