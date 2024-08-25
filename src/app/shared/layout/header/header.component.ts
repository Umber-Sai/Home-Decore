
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CategoryWithTypeType } from 'src/types/categoryWithType.type copy';
import { CartService } from '../../services/cart.service';
import { DefaultResponseType } from 'src/types/default-response.type';
import { ProductService } from '../../services/product.service';
import { ProductType } from 'src/types/product.type';
import { environment } from 'src/environments/environment';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  searchField = new FormControl();
  showedSearch: boolean = false;
  isLogged: boolean = false;
  count: number = 0
  searchValue: string = '';
  products: ProductType[] = []
  serverStaticPath = environment.serverStaticPath;

  @Input() categories: CategoryWithTypeType[] = [];

  constructor(
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private router : Router,
    public cartService: CartService,
    private productService: ProductService,
  ) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    this.searchField.valueChanges
    .pipe(
      debounceTime(500)
    )
    .subscribe(value => {
        if (value && value.length > 2) {
          this.productService.searchProduct(value)
            .subscribe((data: ProductType[]) => {
              
              this.products = data;
              this.showedSearch = true
            });
        } else {
          this.products = [];
        }
      })
    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
    });

    this.cartService.getCartCount()
      .subscribe((count : DefaultResponseType | {count : number}) => {
        if((count as DefaultResponseType).error !== undefined) {
          throw new Error((count as DefaultResponseType).message);
        }
        this.count = (count as {count : number}).count ;
      })
  }

  logout():void {
    this.authService.logout()
    .subscribe(() => {
    })
    this.authService.removeTokens();
    this.authService.userId = null
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/']);
  }

  // changedSearchValue(newValue: string) {
  //   this.searchValue = newValue;

  //   if(this.searchValue && this.searchValue.length > 2) {
  //     this.productService.searchProduct(this.searchValue)
  //       .subscribe((data: ProductType[]) => {
  //         this.products = data;
  //       })
  //   }
  // }

  selectProduct(url: string) {
    this.searchField.setValue('');
    this.router.navigate(['product/' + url]);
  }

  changeShowedSearch(value: boolean) {
    setTimeout(() => {
      this.showedSearch = value;
    }, 100);
    
  }

  @HostListener('document:click', ['$event']) 
  click(event: Event) {
    if(this.showedSearch && (event.target as HTMLElement).className.indexOf('search-product') === -1) {
      this.showedSearch = false
    }
  }

}
