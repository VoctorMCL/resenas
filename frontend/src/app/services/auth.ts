import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
  usuario?: { _id: string; username: string };
  message?: string;
}

export interface RegistroResponse {
  message: string;
  usuario?: { _id: string; username: string };
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

  obtenerNombre(): string {
    let token = this.obtenerToken() || '';
    try {
      let partes = token.split('.');
      if (partes.length > 1) {
        let base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        let payload = JSON.parse(atob(base64));
        return payload.nombre || payload.username || '';
      }
    } catch {
      return '';
    }
    return '';
  }

  estaLogueado(): boolean {
    let token = this.obtenerToken();

    if (token) {
      return true;
    } else {
      return false;
    }
  }

  cerrarSesion(): void {
    sessionStorage.removeItem('token');
  }
}
