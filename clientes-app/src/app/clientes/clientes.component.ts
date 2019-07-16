import { Component, OnInit } from '@angular/core';
import {Cliente} from './cliente';
import {ClienteService } from './cliente.service';
import Swal from 'sweetalert2';
import { map, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {


  clientes: Cliente[];

  constructor(private clienteService: ClienteService) { }

  ngOnInit() {
    let page=0;
    this.clienteService.getClientes(page)
    .pipe(
      tap( response =>{
        console.log('ClientesComponent: tap 3');
        (response.content as Cliente[]).forEach( cliente => {
          console.log(cliente.nombre);
        });
      })
    ).subscribe(response => this.clientes= response.content as Cliente[]);
  }

  delete(cliente: Cliente): void{

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false,
    })

    swalWithBootstrapButtons.fire({
      title: '¿Estas Seguro?',
      text: `¿Seguro que deseas eliminar al  cliente ${cliente.nombre} ${cliente.apellido}?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'No, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.clienteService.delete(cliente.id).subscribe(
          response => {
            this.clientes = this.clientes.filter(cli => cli!==cliente)
            swalWithBootstrapButtons.fire(
              'Cliente Eliminado!',
              `Cliente ${cliente.nombre} ${cliente.apellido} elimnidado con exito`,
              'success'
            )
          }
        )

      } else if (
        // Read more about handling dismissals
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your imaginary file is safe :)',
          'error'
        )
      }
    })

  }

}
