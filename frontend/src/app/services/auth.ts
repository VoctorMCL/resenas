import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
  usuario?: { _id: string; username: string; nombre?: string };
  message?: string;
}

export interface RegistroResponse {
  message: string;
  usuario?: { _id: string; username: string; nombre?: string };
}

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private apiUrl = 'http://localhost:2307/api/usuario/';

  private http = inject(HttpClient);

  login(username: string, password: string): Observable<LoginResponse> {
    let body = {
      username: username,
      password: password
    };

    return this.http.post<LoginResponse>(this.apiUrl + 'login', body);
  }

  registrar(username: string, password: string, nombre: string): Observable<RegistroResponse> {
    let body = {
      username: username,
      password: password,
      nombre: nombre
    };

    return this.http.post<RegistroResponse>(this.apiUrl + 'registrar', body);
  }

  guardarToken(token: string): void {
    sessionStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return sessionStorage.getItem('token');
  }

  private obtenerPayload(): any {
    let token = this.obtenerToken() || '';
    try {
      let partes = token.split('.');
      if (partes.length !== 3) {
        return null;
      }
      let base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }

  obtenerNombre(): string {
    let payload = this.obtenerPayload();
    return payload ? (payload.nombre || payload.username || '') : '';
  }

  estaLogueado(): boolean {
    let payload = this.obtenerPayload();
    if (!payload) {
      return false;
    }

    let expiracion = Number(payload.exp);
    if (expiracion && Date.now() / 1000 >= expiracion) {
      this.cerrarSesion();
      return false;
    }

    return true;
  }

  cerrarSesion(): void {
    sessionStorage.removeItem('token');
  }
}
