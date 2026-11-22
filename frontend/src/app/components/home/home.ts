import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { Resena, Resenas } from '../../services/resenas';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  imports: [ReactiveFormsModule, DatePipe],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {

  authService = inject(Auth);
  resenasService = inject(Resenas);
  router = inject(Router);

  resenas = signal<Array<Resena>>([]);
  mensajeError = signal('');
  mensajeExito = signal('');
  editandoId = signal<string | null>(null);
  estrellas = [1, 2, 3, 4, 5];
  resenasBorradas = signal<number>(0);
  progresoAviso = signal<number>(100);
  private temporizadorAviso: ReturnType<typeof setInterval> | null = null;
  private duracionAviso = 6000;

  get hoy(): string {
    return this.obtenerHoy();
  }

  get nombreUsuario(): string {
    return this.authService.obtenerNombre();
  }

  private obtenerHoy(): string {
    let fecha = new Date();
    let mes = String(fecha.getMonth() + 1).padStart(2, '0');
    let dia = String(fecha.getDate()).padStart(2, '0');
    return fecha.getFullYear() + '-' + mes + '-' + dia;
  }

  promedioCalificacion(): string {
    let lista = this.resenas();
    if (!lista.length) {
      return '0';
    }
    let total = lista.reduce((suma, resena) => suma + Number(resena.calificacion), 0);
    let promedio = Number((total / lista.length).toFixed(2));
    return String(promedio);
  }

  porcentajeTotal(calificacion: number | string | null | undefined): string {
    return (Math.max(0, Math.min(5, Number(calificacion) || 0)) / 5) * 100 + '%';
  }

  porcentajeEstrella(calificacion: number | string | null | undefined, posicion: number): string {
    let valor = Number(calificacion) || 0;
    let fraccion = Math.max(0, Math.min(1, valor - (posicion - 1)));
    return fraccion * 100 + '%';
  }

  formatearCalificacion(calificacion: number | string | null | undefined): string {
    return (Number(calificacion) || 0).toFixed(1);
  }

  cambiarCalificacionTexto(valor: string): void {
    this.formularioResena.controls.calificacion.setValue(valor);
  }

  normalizarCalificacion(): void {
    let control = this.formularioResena.controls.calificacion;
    let texto = String(control.value ?? '').trim().replace(',', '.');

    if (texto === '' || isNaN(Number(texto))) {
      control.setValue('');
      return;
    }

    control.setValue(String(this.limitarCalificacion(Number(texto))));
  }

  ajustarCalificacion(delta: number): void {
    let actual = Number(this.formularioResena.value.calificacion);
    if (isNaN(actual)) {
      actual = 0;
    }
    this.formularioResena.controls.calificacion.setValue(String(this.limitarCalificacion(actual + delta)));
  }

  private limitarCalificacion(valor: number): number {
    return Math.round(Math.max(0, Math.min(5, valor)) * 10) / 10;
  }

  formularioResena = new FormGroup({
    nombreRestaurante: new FormControl(''),
    calificacion: new FormControl('1.0'),
    fechaVisita: new FormControl(''),
    observaciones: new FormControl('')
  });

  ngOnInit(): void {
    this.cargarBorradas();
    this.consultarResenas();
  }

  private claveBorradas(): string {
    let token = this.authService.obtenerToken() || '';
    let id = token;
    try {
      let partes = token.split('.');
      if (partes.length > 1) {
        let base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        let payload = JSON.parse(atob(base64));
        id = payload.sub || token;
      }
    } catch {
      id = token;
    }
    return 'resenas_borradas_' + id;
  }

  private cargarBorradas(): void {
    try {
      let valor = Number(localStorage.getItem(this.claveBorradas()) || '0');
      this.resenasBorradas.set(isNaN(valor) ? 0 : valor);
    } catch {
      this.resenasBorradas.set(0);
    }
  }

  private registrarBorrada(): void {
    this.resenasBorradas.update(total => total + 1);
    try {
      localStorage.setItem(this.claveBorradas(), String(this.resenasBorradas()));
    } catch {
      // El contador sigue visible en pantalla aunque no se pueda persistir
    }
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }

  private mensajeDelBackend(error: any, respuesta: string): string {
    let detalle = error?.error?.message;
    return detalle ? `${respuesta}: ${detalle}` : respuesta;
  }

  mostrarAviso(tipo: 'exito' | 'error', texto: string): void {
    this.limpiarTemporizador();
    this.mensajeExito.set(tipo === 'exito' ? texto : '');
    this.mensajeError.set(tipo === 'error' ? texto : '');
    this.progresoAviso.set(100);

    let inicio = Date.now();
    this.temporizadorAviso = setInterval(() => {
      let transcurrido = Date.now() - inicio;
      let restante = Math.max(0, 100 - (transcurrido / this.duracionAviso) * 100);
      this.progresoAviso.set(restante);
      if (restante <= 0) {
        this.limpiarAviso();
      }
    }, 50);
  }

  limpiarAviso(): void {
    this.limpiarTemporizador();
    this.mensajeExito.set('');
    this.mensajeError.set('');
    this.progresoAviso.set(100);
  }

  private limpiarTemporizador(): void {
    if (this.temporizadorAviso !== null) {
      clearInterval(this.temporizadorAviso);
      this.temporizadorAviso = null;
    }
  }

  ngOnDestroy(): void {
    this.limpiarTemporizador();
  }

  private ordenarResenas(lista: Array<Resena>): Array<Resena> {
    return [...lista].sort((a, b) =>
      new Date(b.fechaVisita).getTime() - new Date(a.fechaVisita).getTime());
  }

  consultarResenas(): void {
    this.resenasService.consultarResenas().subscribe({
      next: respuesta => {
        this.resenas.set(respuesta.resenas || []);
      },
      error: error => {
        this.mostrarAviso('error', this.mensajeDelBackend(error, 'No se pudieron consultar las reseñas'));
        console.error(error);
      }
    });
  }

  editarResena(resena: Resena): void {
    this.editandoId.set(resena._id);
    let fecha = '';
    if (resena.fechaVisita) {
      fecha = new Date(resena.fechaVisita).toISOString().substring(0, 10);
    }
    this.formularioResena.setValue({
      nombreRestaurante: resena.nombreRestaurante || '',
      calificacion: String(resena.calificacion),
      fechaVisita: fecha,
      observaciones: resena.observaciones || ''
    });
    this.limpiarAviso();
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.formularioResena.reset({ calificacion: '1.0' });
    this.limpiarAviso();
  }

  guardarResena(): void {
    this.normalizarCalificacion();

    let nombreRestaurante = this.formularioResena.value.nombreRestaurante || '';
    let calificacionCruda = this.formularioResena.value.calificacion;
    let calificacion = Number(calificacionCruda);
    let fechaVisita = this.formularioResena.value.fechaVisita || '';
    let observaciones = this.formularioResena.value.observaciones || '';

    if (!nombreRestaurante.trim() || !fechaVisita || !observaciones.trim() ||
      calificacionCruda === '' || calificacionCruda === null || calificacionCruda === undefined || isNaN(calificacion)) {
      this.mostrarAviso('error', 'Todos los campos son obligatorios: Nombre Restaurante, Calificación, Fecha Visita y Observaciones');
      return;
    }

    if (calificacion < 0 || calificacion > 5) {
      this.mostrarAviso('error', 'La calificación debe estar entre 0 y 5');
      return;
    }

    if (fechaVisita > this.hoy) {
      this.mostrarAviso('error', 'La fecha de visita no puede ser futura');
      return;
    }

    let id = this.editandoId();

    if (id) {
      // Actualizar reseña
      this.resenasService.actualizarResena(id, nombreRestaurante, calificacion, fechaVisita, observaciones).subscribe({
        next: respuesta => {
          let actualizada = respuesta.resena!;
          let lista = this.resenas().map(item => item._id === id ? actualizada : item);
          this.resenas.set(this.ordenarResenas(lista));
          this.cancelarEdicion();
          this.mostrarAviso('exito', 'Reseña actualizada exitosamente');
        },
        error: error => {
          this.mostrarAviso('error', this.mensajeDelBackend(error, 'No se pudo actualizar la reseña'));
          console.error(error);
        }
      });
    } else {
      // Crear reseña
      this.resenasService.crearResena(nombreRestaurante, calificacion, fechaVisita, observaciones).subscribe({
        next: respuesta => {
          this.resenas.update(lista => this.ordenarResenas([...lista, respuesta.resena!]));
          this.formularioResena.reset({ calificacion: '1.0' });
          this.mostrarAviso('exito', 'Reseña creada exitosamente');
        },
        error: error => {
          this.mostrarAviso('error', this.mensajeDelBackend(error, 'No se pudo crear la reseña'));
          console.error(error);
        }
      });
    }
  }

  eliminarResena(id: string): void {
    const respuesta = confirm('¿Estás seguro de que deseas eliminar este registro?');
    if (respuesta) {
      this.resenasService.eliminarResena(id).subscribe({
        next: () => {
          let lista = this.resenas().filter(r => r._id !== id);
          this.resenas.set(lista);
          this.registrarBorrada();
          if (this.editandoId() === id) {
            this.cancelarEdicion();
          }
          this.mostrarAviso('exito', 'Reseña eliminada');
        },
        error: error => {
          this.mostrarAviso('error', this.mensajeDelBackend(error, 'No se pudo eliminar la reseña'));
          console.error(error);
        }
      });
    }
  }

}
