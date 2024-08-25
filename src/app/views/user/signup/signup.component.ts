import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { DefaultResponseType } from 'src/types/default-response.type';
import { LoginResponseType } from 'src/types/login-response.type';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  signupForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)]],
    passwordRepeat: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)]],
    agree: [false, [Validators.requiredTrue]],
  })

  constructor(private fb: UntypedFormBuilder,
              private authService : AuthService,
              private _snackBar: MatSnackBar,
              private router : Router,
  ) { }

  ngOnInit(): void {
  }

  signup() {
    if(this.signupForm.valid && this.signupForm.value.email && this.signupForm.value.password 
      && this.signupForm.value.passwordRepeat && this.signupForm.value.agree) {
        this.authService.signup(this.signupForm.value.email, this.signupForm.value.password, this.signupForm.value.passwordRepeat)
        .subscribe({
          next: (data: DefaultResponseType | LoginResponseType) => {
            let error = null;
          if((data as DefaultResponseType).error !== undefined) {
            error = (data as DefaultResponseType).message;
          }

          const loginResponseType = data as LoginResponseType;
          if(!loginResponseType.accessToken || !loginResponseType.refreshToken || !loginResponseType.userId) {
            error = 'Ошибка регистрации';
          }
          if(error) {
            this._snackBar.open(error);
            throw new Error(error);
          }

          this.authService.setTokens(loginResponseType.accessToken, loginResponseType.refreshToken);
          this.authService.userId = loginResponseType.userId;

          this._snackBar.open('Вы успешно зарегистрировались');
          this.router.navigate(['/']);
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message)
            } else {
              this._snackBar.open('Ошибка регистрации');
            }
          }
        })
      }
  }

}
