import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ProductType } from 'src/types/product.type';
import { CartService } from '../../services/cart.service';
import { CartType } from 'src/types/cart.type';
import { FavoriteService } from '../../services/favorite.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DefaultResponseType } from 'src/types/default-response.type';
import { FavoriteType } from 'src/types/favorite.type';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {

  @Input() isLight: boolean = false;
  @Input() product!: ProductType;
  @Input() countInCart: number = 0;
  @Input() moveToElement: HTMLElement | null = null;

  serverStaticPath = environment.serverStaticPath;
  count : number = 1;
  isLoged: boolean = this.authService.getIsLoggedIn()
  

  constructor(
    private cartService : CartService,
    private favoriteService : FavoriteService,
    private _snackBar: MatSnackBar,
    private authService : AuthService,
    private router : Router,
    
  ) { }

  ngOnInit(): void {
    if(this.countInCart && this.countInCart > 1) {
      this.count = this.countInCart;
    }
  }

  moveTo ():void {
    if(this.moveToElement) {
      this.moveToElement.scrollIntoView({behavior : 'smooth'})
    }
  }

  addToCart() : void {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.countInCart = this.count;
      })
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.countInCart = 0;
        this.count = 1;
      })
  }

  updateCount(value: number) {
    this.count = value;
    if (this.countInCart > 0) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          this.countInCart = this.count;
        })
    }
  }

  updateFavorite() {
    if(!this.authService.getIsLoggedIn()) {
      this._snackBar.open('Для добавления в избранное необходимо авторизоваться');
      return
    }

    if(this.product.isInFavorite) {
      this.favoriteService.removeFavorite(this.product.id)
      .subscribe((data : DefaultResponseType) => {
        if(data.error) {
          throw new Error(data.message);
        }
        this.product.isInFavorite = false;
      })
    } else {
      this.favoriteService.addToFavorite(this.product.id)
      .subscribe((data: FavoriteType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.product.isInFavorite = true;
        this._snackBar.open('Добавлено в избранное');
      })
    }
    
  }

  navigate() {
    if(this.isLight) {
      this.router.navigate(['/product/' + this.product.url])
    }
  }

}
