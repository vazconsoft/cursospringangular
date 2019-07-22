import { Injectable } from '@angular/core';
import { formatDate, DatePipe} from '@angular/common'
import {Cliente} from './cliente';
import {Observable,throwError} from 'rxjs';
import { of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest,HttpEvent } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalService } from './detalle/modal.service';
import { AuthService } from '../usuarios/auth.service';
import { Region } from './region';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private urlEndPoint:string ='http://localhost:8080/api/clientes';

  private httpHeaders = new HttpHeaders({'Content-type':'application/json'})

  constructor(private http: HttpClient,
              private router: Router,
              private authService: AuthService) { }

  //getRegiones(): Observable<Region[]>{

    //  return this.http.get<Region[]>(this.urlEndPoint + '/regiones');
  //}

  private agregarAuthorizationHeader() {
    let token = this.authService.token;
      if (token != null) {
        return this.httpHeaders.append('Authorization', 'Bearer ' + token);
        }
          return this.httpHeaders;
      }

  private isNoAutorizado(e): boolean {
    if (e.status == 401) {
      if (this.authService.isAuthenticated()) {
        this.authService.logout();
      }
      this.router.navigate(['/login']);
      return true;
    }
    if (e.status == 403) {
      Swal.fire('Acceso denegado', `Hola ${this.authService.usuario.username} no tienes acceso a este recurso!`, 'warning');
      this.router.navigate(['/clientes']);
      return true;
    }
    return false;
  }

  getRegiones(): Observable<Region[]> {
    return this.http.get<Region[]>(this.urlEndPoint + '/regiones', { headers: this.agregarAuthorizationHeader() }).pipe(
      catchError(e => {
        this.isNoAutorizado(e);
        return throwError(e);
      })
    );
  }

  getClientes(page: number): Observable<any>{
    return this.http.get<Cliente[]>(this.urlEndPoint+ '/page/' + page).pipe(
        tap((response: any) =>{
          console.log('ClienteService: tap1');
          (response.content as Cliente[]).forEach( cliente => {
            console.log(cliente.nombre);
          });
        }),

        map((response: any) => {
          //let clientes = response as Cliente[];
          (response.content as Cliente[]).map(cliente => {
              cliente.nombre = cliente.nombre.toUpperCase();
              return cliente;
          });
          return response;
        }),
        tap( response =>{
          console.log('ClienteService: tap2');
          (response.content as Cliente[]).forEach( cliente => {
            console.log(cliente.nombre);
          });
        })
    );
  }

  create(cliente: Cliente): Observable<Cliente>{
      return this.http.post<Cliente>(this.urlEndPoint, cliente, {headers: this.httpHeaders}).pipe(
        catchError(e => {
            if(e.status==400){
              return throwError(e);
            }
            console.error(e.error.mensaje);
            Swal.fire({
              type: 'error',
              title: `${e.error.mensaje}`,
              text: `${e.error.error}`,
              footer: '<a href>Why do I have this issue?</a>'
            });
            return throwError(e);
        })
      );
  }

  getCliente(id) : Observable<Cliente>{
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError( e => {
        this.router.navigate(['/clientes']);
        console.error(e.error.mensaje);
        Swal.fire('Error al editar', e.error.mensaje,'error');
        return throwError(e);
      })
    );
  }

  update(cliente: Cliente): Observable<any>{
    return this.http.put<any>(`${this.urlEndPoint}/${cliente.id}`,cliente,{headers: this.httpHeaders}).pipe(
      catchError(e => {
          if(e.status==400){
            return throwError(e);
          }
          console.error(e.error.mensaje);
          Swal.fire(e.error.mensaje, e.error.error,'error');
          return throwError(e);
      })
    );
  }

  delete (id: number): Observable<Cliente>{
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`,{headers: this.httpHeaders}).pipe(
      catchError(e => {

          if (this.isNoAutorizado(e)) {
            return throwError(e);
          }

          console.error(e.error.mensaje);
          Swal.fire(e.error.mensaje, e.error.error,'error');
          return throwError(e);
      })
    );
  }

  //Observable<Cliente>
  subirFoto(archivo: File, id): Observable<HttpEvent<{}>>{
    let formData = new FormData();
    formData.append("archivo",archivo);
    formData.append("id",id);

    const req = new HttpRequest('POST', `${this.urlEndPoint}/upload/`,formData, {
      reportProgress: true
    });
    return this.http.request(req).pipe(
    catchError(e => {
        this.isNoAutorizado(e);
        return throwError(e);
      })
      );
  }
}
