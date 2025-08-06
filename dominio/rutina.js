import { Ejercicio } from './ejercicio.js'; 

export class Rutina {
    constructor (nombre) {
        this.nombre = nombre;
        this.ejercicios = [];
    }

    agregarEjercicio (ejercicio) {
        if (ejercicio instanceof Ejercicio ) {
        this.ejercicios.push(ejercicio);
        } else {
          console.log("ejercicio no valido");
        }
    } 

      eliminarEjercicio(nombreEjercicio) {
    this.ejercicios = this.ejercicios.filter(
      e => e.nombre.toLowerCase() !== nombreEjercicio.toLowerCase()
    );
  }
  
}