import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/shared/services/user.service';
import { DefaultResponseType } from 'src/types/default-response.type';
import { DeliveryType } from 'src/types/delivery.type';
import { OrderType } from 'src/types/order.type';
import { PaymentType } from 'src/types/payment.type';
import { UserInfoType } from 'src/types/user-info.type.';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit{

  // deliveryType: DeliveryType = DeliveryType.delivery
  deliveryTypes = DeliveryType;
  paymentTypes = PaymentType 
  userInfoForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    fatherName: [''],
    phone: ['', ],
    paymentType: [PaymentType.cashToCourier],
    deliveryType: [DeliveryType.delivery],
    email: ['', Validators.required],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: [''],
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private _snackBar: MatSnackBar,
  ){}

  ngOnInit(): void {
    this.userService.getUserInfo()
      .subscribe((data: UserInfoType | DefaultResponseType) => {
        if((data as DefaultResponseType).error) {
          throw new Error((data as DefaultResponseType).message);
        }

        const userInfo = data as UserInfoType;

        const paramsToUpdate = {
          firstName: userInfo.firstName ? userInfo.firstName : '',
          lastName: userInfo.lastName ? userInfo.lastName : '',
          fatherName:  userInfo.fatherName ? userInfo.fatherName : '',
          phone: userInfo.phone ? userInfo.phone : '',
          paymentType: userInfo.paymentType ? userInfo.paymentType : PaymentType.cashToCourier,
          deliveryType: userInfo.deliveryType ? userInfo.deliveryType : DeliveryType.self,
          email: userInfo.email ? userInfo.email : '',
          street: userInfo.street ? userInfo.street : '',
          house: userInfo.house ? userInfo.house : '',
          entrance:  userInfo.entrance ? userInfo.entrance : '',
          apartment: userInfo.apartment ? userInfo.apartment : '',
        }

        this.userInfoForm.setValue(paramsToUpdate)

      })
  }

  changeDeliveryType(param: DeliveryType) :void {
    this.userInfoForm.get('deliveryType')?.setValue(param);
    this.userInfoForm.markAsDirty()
  }

  updateUserInfo():void {
    if(this.userInfoForm.valid && this.userInfoForm.value.email) {

      const paramsObject: UserInfoType = {
        email : this.userInfoForm.value.email,
        deliveryType : this.userInfoForm.value.deliveryType ?  this.userInfoForm.value.deliveryType : DeliveryType.self,
        paymentType : this.userInfoForm.value.paymentType ? this.userInfoForm.value.paymentType : PaymentType.cashToCourier,
      }

      if(this.userInfoForm.value.firstName) {
        paramsObject.firstName = this.userInfoForm.value.firstName
      }

      if(this.userInfoForm.value.lastName) {
        paramsObject.lastName = this.userInfoForm.value.lastName
      }

      if(this.userInfoForm.value.fatherName) {
        paramsObject.fatherName = this.userInfoForm.value.fatherName
      }

      if(this.userInfoForm.value.phone) {
        paramsObject.phone = this.userInfoForm.value.phone
      }

      if(this.userInfoForm.value.street) {
        paramsObject.street = this.userInfoForm.value.street
      }

      if(this.userInfoForm.value.house) {
        paramsObject.house = this.userInfoForm.value.house
      }

      if(this.userInfoForm.value.entrance) {
        paramsObject.entrance = this.userInfoForm.value.entrance
      }

      if(this.userInfoForm.value.apartment) {
        paramsObject.apartment = this.userInfoForm.value.apartment
      }


      this.userService.updateUserInfo(paramsObject)
        .subscribe({
          next :(data : DefaultResponseType) => {
            if(data.error) {
              this._snackBar.open(data.message);
              throw new Error(data.message)
            }

            this._snackBar.open('Данные успешно созранены');
            this.userInfoForm.markAsPristine();
          },
          error : (error : HttpErrorResponse) => {
            if(error.error && error.error.message) {
              this._snackBar.open(error.error.message);
            } else {
              this._snackBar.open('Ошибка сохранения');
            }
          }
        });
    }
  }

}
