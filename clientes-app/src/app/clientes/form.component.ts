import { Component, OnInit } from '@angular/core';
import { Cliente} from './cliente';
import { ClienteService} from './cliente.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Region } from './region';
//tester
@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  private cliente: Cliente = new Cliente();
  regiones: Region[];
  private titulo:String = "Crear cliente";
  private errores:string[];

  constructor(private clienteService: ClienteService,
  private router: Router,
  private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      let id = +params.get('id');
      if (id) {
        this.clienteService.getCliente(id).subscribe((cliente) => this.cliente = cliente);
      }
    });
    this.clienteService.getRegiones().subscribe(regiones => this.regiones = regiones);
  }

//  cargarCliente():void{
//    this.activatedRoute.params.subscribe(params => {
//      let id = params['id']
//      if(id)
//      {
//          this.clienteService.getCliente(id).subscribe((cliente) => this.cliente = cliente)
//      }
//    })
//  }

  create(): void{
    console.log(this.cliente);
    this.clienteService.create(this.cliente)
      .subscribe(
        cliente => {
          this.router.navigate(['/clientes']);
          Swal.fire('Nuevo cliente', `El cliente ${cliente.nombre} ha sido creado con Exito`, 'success');
        },
        err => {
          this.errores = err.error.errors as string[];
          console.error('CĂłdigo del error desde el backend: ' + err.status);
          console.error(err.error.errors);
        }
      );
  }

  update():void{
    console.log(this.cliente);
    this.clienteService.update(this.cliente)
      .subscribe(
        json => {
          this.router.navigate(['/clientes']);
          Swal.fire('Cliente Actualizado', `${json.mensaje}: ${json.cliente.nombre}`, 'success');
        },
        err => {
          this.errores = err.error.errors as string[];
          console.error('CĂłdigo del error desde el backend: ' + err.status);
          console.error(err.error.errors);
        }
      )
  }

  compararRegion(r1: Region, r2: Region): boolean {
    if(r1===undefined && r2===undefined){
      return true;
    }
    return r1===null || r2===null ||r1===undefined || r2===undefined ? false : r1.id === r2.id;
  }
}
