import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  standalone: true,
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  authService = inject(Auth);
  router = inject(Router);

  formularioLogin = new FormGroup({
    nombre: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl('')
  });

  esRegistro = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');

  toggleModo() {
    this.esRegistro.set(!this.esRegistro());
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }

  iniciarSesion() {
    let nombre = (this.formularioLogin.value.nombre || '').trim();
    let email = (this.formularioLogin.value.email || '').trim();
    let password = this.formularioLogin.value.password || '';

    if (!email || !password) {
      this.mensajeError.set('Ingrese su usuario y contraseña');
      return;
    }

    if (this.esRegistro() && !nombre) {
      this.mensajeError.set('Ingrese su nombre');
      return;
    }

    if (this.esRegistro()) {
      this.authService.registrar(email, password, nombre).subscribe({
        next: respuesta => {
          this.mensajeExito.set('Usuario creado con éxito. Iniciando sesión...');
          this.authService.login(email, password).subscribe({
            next: loginResp => {
              if (loginResp.token) {
                this.authService.guardarToken(loginResp.token);
                this.router.navigate(['/home']);
              }
            },
            error: () => {
              this.mensajeError.set('Usuario registrado pero error al iniciar sesión');
            }
          });
        },
        error: error => {
          this.mensajeError.set(error?.error?.message || 'Error al crear el usuario');
        }
      });
    } else {
      this.authService.login(email, password).subscribe({
        next: respuesta => {
          if (respuesta.token) {
            this.authService.guardarToken(respuesta.token);
            this.router.navigate(['/home']);
          } else {
            this.mensajeError.set('No se recibió token');
          }
        },
        error: error => {
          this.mensajeError.set(error?.error?.message || 'Error de inicio de sesión');
        }
      });
    }
  }

}
