import { Component, Input, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ProductService } from '../../services/product.service';
import { ProductType } from 'src/types/product.type';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'product-carousel',
  templateUrl: './product-carousel.component.html',
  styleUrls: ['./product-carousel.component.scss']
})
export class ProductCarouselComponent implements OnInit{

  @Input() isLight: boolean = false;
  @Input() title : string = '';
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

  products: ProductType[] = []

  constructor(private productService : ProductService, private activeRoute : ActivatedRoute) { }

  ngOnInit(): void {
    this.activeRoute.params.subscribe(val => {
      this.productService.getBestProducts()
        .subscribe((data: ProductType[]) => {
          this.products = data;
        })
    })
  }


}
