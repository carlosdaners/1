import { Ejercicio } from './ejercicio.js'; 
import { Rutina } from './rutina.js'; 

export class Sistema {
    constructor () {
        this.ejercicios = [];
        this.rutinas = [];
    }

   agregarEjercicio(ejercicio) {
    if (ejercicio instanceof Ejercicio) {
        this.ejercicios.push(ejercicio);
    } else {
        console.log("No es una instancia de Ejercicio");
    }
}


    crearRutina (nombre) {
        const nuevo = new rutina(nombre);
        this.rutinas.push(nuevo);
    }

    // Buscar ejercicio por nombre
    buscarEjercicio(nombre) {
        return this.ejercicios.find(e => e.nombre === nombre);
    }

    // Buscar rutina por nombre
    buscarRutina(nombre) {
        return this.rutinas.find(r => r.nombre === nombre);
    }

    existeEjercicio (nombre) {
        for (aux of this.ejercicios) {
            if (aux.nombre == nombre) {
                return true;
            }
        }
        return false;
    }
    
}