import { Ejercicio } from './ejercicio.js'; 
import { Rutina } from './rutina.js'; 

export class Sistema {
   constructor() {
  this.ejercicios = [];
  this.rutinas = [];

  this.lunes = { rutina: null, ejerciciosExtras: [] };
  this.martes = { rutina: null, ejerciciosExtras: [] };
  this.miercoles = { rutina: null, ejerciciosExtras: [] };
  this.jueves = { rutina: null, ejerciciosExtras: [] };
  this.viernes = { rutina: null, ejerciciosExtras: [] };
  this.sabado = { rutina: null, ejerciciosExtras: [] };
  this.domingo = { rutina: null, ejerciciosExtras: [] };
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

    asignarRutinaADia(dia, nombreRutina) {
        
  const rutina = this.rutinas.find(r => r.nombre === nombreRutina) || null;
  if (!this.hasOwnProperty(dia)) {
    console.error("Día inválido");
    return;
  }
  this[dia].rutina = rutina;
  if (rutina !== null) {
    console.log(`Rutina ${nombreRutina} asignada al día ${dia}`);
    for (let rut of this[dia].rutina.ejercicios) {
        console.log(rut.nombre);
    }
}
}

    
}