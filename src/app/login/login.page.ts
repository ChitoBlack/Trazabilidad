import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)]],
      password: ['', [Validators.required, Validators.maxLength(8)]]
    });
  }

  async login() {
    if (this.loginForm.valid) {
      try {
        const { email, password } = this.loginForm.value;
        await this.authService.login(email, password);
        this.router.navigateByUrl('/inicio');
      } catch (error) {
        console.error('Error en el inicio de sesión:', error);
      }
    } else {
      console.log('Formulario inválido');
    }
  }

  get emailError() {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'El correo es obligatorio';
    } else if (emailControl?.hasError('email')) {
      return 'Ingresa un correo válido';
    } else if (emailControl?.hasError('pattern')) {
      return 'El correo debe terminar en @gmail.com';
    }
    return '';
  }

  get passwordError() {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'La contraseña es obligatoria';
    } else if (passwordControl?.hasError('maxlength')) {
      return 'La contraseña debe tener un máximo de 8 caracteres';
    }
    return '';
  }
}



