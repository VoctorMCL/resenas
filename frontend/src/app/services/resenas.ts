import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Auth } from './auth';

export interface Resena {
  _id: string;
  usuario: string;
  nombreRestaurante: string;
  calificacion: number;
  fechaVisita: string;
  observaciones: string;
  restaurante?: string;
  comentario?: string;
  fecha?: string;
}

export interface ConsultarResenasResponse {
  resenas: Array<Resena>;
  reviews?: Array<Resena>;
  resena?: Array<Resena>;
}

export interface OperacionResenaResponse {
  message: string;
  resena: Resena | null;
  review?: Resena | null;
}

@Injectable({
  providedIn: 'root'
})
export class Resenas {

  private apiUrl = 'http://localhost:2307/api/';

  private http = inject(HttpClient);
  private auth = inject(Auth);

  private getHeaders(): HttpHeaders {
    let token = this.auth.obtenerToken() || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  consultarResenas(): Observable<ConsultarResenasResponse> {
    return this.http.get<ConsultarResenasResponse>(this.apiUrl + 'resenas', { headers: this.getHeaders() });
  }

  consultarPorId(id: string): Observable<{ resena: Resena }> {
    return this.http.get<{ resena: Resena }>(this.apiUrl + 'resena/' + id, { headers: this.getHeaders() });
  }

  crearResena(nombreRestaurante: string, calificacion: number, fechaVisita: string, observaciones: string): Observable<OperacionResenaResponse> {
    let body = {
      nombreRestaurante: nombreRestaurante,
      calificacion: calificacion,
      fechaVisita: fechaVisita,
      observaciones: observaciones
    };

    return this.http.post<OperacionResenaResponse>(this.apiUrl + 'resena', body, { headers: this.getHeaders() });
  }

  actualizarResena(id: string, nombreRestaurante: string, calificacion: number, fechaVisita: string, observaciones: string): Observable<OperacionResenaResponse> {
    let body = {
      nombreRestaurante: nombreRestaurante,
      calificacion: calificacion,
      fechaVisita: fechaVisita,
      observaciones: observaciones
    };

    return this.http.put<OperacionResenaResponse>(this.apiUrl + 'resena/' + id, body, { headers: this.getHeaders() });
  }

  eliminarResena(id: string): Observable<OperacionResenaResponse> {
    return this.http.delete<OperacionResenaResponse>(this.apiUrl + 'resena/' + id, { headers: this.getHeaders() });
  }
}
