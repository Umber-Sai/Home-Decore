import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CartService } from 'src/app/shared/services/cart.service';
import { FavoriteService } from 'src/app/shared/services/favorite.service';
import { ProductService } from 'src/app/shared/services/product.service';
import { environment } from 'src/environments/environment';
import { CartType } from 'src/types/cart.type';
import { DefaultResponseType } from 'src/types/default-response.type';
import { FavoriteType } from 'src/types/favorite.type';
import { ProductType } from 'src/types/product.type';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit{

  product: ProductType = {} as ProductType;
  serverStaticPath = environment.serverStaticPath;
  customOptions: OwlOptions = {
    margin: 24,
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false
  }
  products: ProductType[] = [];
  count: number = 1;


  constructor(
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private favoriteService : FavoriteService,
    private _snackBar: MatSnackBar,
    private authService : AuthService,
  ) {}

  ngOnInit(): void {
    

    this.activatedRoute.params.subscribe(productUrl => {
      if (productUrl && productUrl['url']) {

        this.productService.getProduct(productUrl['url'])
          .subscribe((resp: ProductType) => {
            if (!resp.id) this.router.navigate(['/']);
            this.product = resp;

            if(this.authService.getIsLoggedIn()){
              this.favoriteService.getFavorites()
              .subscribe((data: FavoriteType[] | DefaultResponseType) => {
                if ((data as DefaultResponseType).error) {
                  throw new Error((data as DefaultResponseType).message)
                }
                const inFavorite = (data as FavoriteType[]).find(dataItem => dataItem.id === this.product.id);
                if (inFavorite) this.product.isInFavorite = true;
              })
            }
            
            this.cartService.getCart()
              .subscribe((cart: CartType | DefaultResponseType) => {
                if((cart as DefaultResponseType).error !== undefined) {
                  throw new Error((cart as DefaultResponseType).message);
                }
                const cartData = cart as CartType;
                if (cartData) {
                  const productInCart = cartData.items.find(item => item.product.id === resp.id);
                  if (productInCart) {
                    this.product.countInCart = productInCart.quantity;
                    this.count = productInCart.quantity;
                  }
                }
              });
          });
      }
    })

  }

  updateCount(value:number) {
    this.count = value;
    if(this.product.countInCart) {
      this.addToCart();
    }
  }

  addToCart() {
    this.cartService.updateCart(this.product.id, this.count)
    .subscribe((data: CartType | DefaultResponseType) => {
      if((data as DefaultResponseType).error !== undefined) {
        throw new Error((data as DefaultResponseType).message);
      }
      this.product.countInCart = this.count
    })
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0) 
      .subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        delete this.product.countInCart;
        this.count = 1
      })
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

}
