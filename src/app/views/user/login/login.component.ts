import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { DefaultResponseType } from 'src/types/default-response.type';
import { LoginResponseType } from 'src/types/login-response.type';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  })

  constructor(private fb: UntypedFormBuilder,
              private authService : AuthService,
              private _snackBar: MatSnackBar,
              private router : Router,
  ) { }

  ngOnInit(): void {
  }

  login(): void {
    if(this.loginForm.valid && this.loginForm.value.email && this.loginForm.value.password) {
      this.authService.login(this.loginForm.value.email, this.loginForm.value.password, !!this.loginForm.value.rememberMe)
      .subscribe({
        next: (data: LoginResponseType | DefaultResponseType) => {
          let error = null;
          if((data as DefaultResponseType).error !== undefined) {
            error = (data as DefaultResponseType).message;
          }

          const loginResponseType = data as LoginResponseType;
          if(!loginResponseType.accessToken || !loginResponseType.refreshToken || !loginResponseType.userId) {
            error = 'Ошибка авторизации';
          }
          if(error) {
            this._snackBar.open(error);
            throw new Error(error);
          }

          this.authService.setTokens(loginResponseType.accessToken, loginResponseType.refreshToken);
          this.authService.userId = loginResponseType.userId;

          this._snackBar.open('Вы успешно авторизовались');
          this.router.navigate(['/']);

        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.error && errorResponse.error.message) {
            this._snackBar.open(errorResponse.error.message)
          } else {
            this._snackBar.open('Ошибка авторизации');
          }
        }
      })
    }
  }

}
