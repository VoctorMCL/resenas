import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Resena {
  _id: string;
  usuario: string;
  nombreRestaurante: string;
  calificacion: number;
  fechaVisita: string;
  observaciones: string;
}

export interface ConsultarResenasResponse {
  resenas: Array<Resena>;
}

export interface OperacionResenaResponse {
  message: string;
  resena: Resena | null;
}

@Injectable({
  providedIn: 'root'
})
export class Resenas {

  private apiUrl = 'http://localhost:2307/api/';

  private http = inject(HttpClient);

  consultarResenas(): Observable<ConsultarResenasResponse> {
    return this.http.get<ConsultarResenasResponse>(this.apiUrl + 'resenas');
  }

  consultarPorId(id: string): Observable<{ resena: Resena }> {
    return this.http.get<{ resena: Resena }>(this.apiUrl + 'resena/' + id);
  }

  crearResena(nombreRestaurante: string, calificacion: number, fechaVisita: string, observaciones: string): Observable<OperacionResenaResponse> {
    let body = {
      nombreRestaurante: nombreRestaurante,
      calificacion: calificacion,
      fechaVisita: fechaVisita,
      observaciones: observaciones
    };

    return this.http.post<OperacionResenaResponse>(this.apiUrl + 'resena', body);
  }

  actualizarResena(id: string, nombreRestaurante: string, calificacion: number, fechaVisita: string, observaciones: string): Observable<OperacionResenaResponse> {
    let body = {
      nombreRestaurante: nombreRestaurante,
      calificacion: calificacion,
      fechaVisita: fechaVisita,
      observaciones: observaciones
    };

    return this.http.put<OperacionResenaResponse>(this.apiUrl + 'resena/' + id, body);
  }

  eliminarResena(id: string): Observable<OperacionResenaResponse> {
    return this.http.delete<OperacionResenaResponse>(this.apiUrl + 'resena/' + id);
  }
}
