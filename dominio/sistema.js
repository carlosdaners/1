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
        this[dia].ejerciciosExtras = []; 
        if (rutina !== null) {
            console.log(`Rutina ${nombreRutina} asignada al día ${dia}`);
            for (let rut of this[dia].rutina.ejercicios) {
                console.log(rut.nombre);
            }
        }
    }

    asignarEjercicioADia(dia, ejercicio) {
        const ej = this.ejercicios.find(e => e.nombre === ejercicio.nombre) || null;
       if (!this.hasOwnProperty(dia)) {
            console.error("Día inválido");
            return;
        }
            let yaEsta = false;
            for (let e of this[dia].ejerciciosExtras) {
                if (e.nombre === ej.nombre) {
                    yaEsta = true;
                    console.log(`El ejercicio ${ej.nombre} ya está asignado al día ${dia}`);
                    break;
                }
            }
            if (ej !== null && !yaEsta) {
                this[dia].ejerciciosExtras.push(ej);
                console.log("----------------------------");
                console.log(this[dia].ejerciciosExtras);
            }
    }

    borrarRutina (nomRutina) {
        const dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
        for (const dia of dias) {
            if (this[dia] && this[dia].rutina && this[dia].rutina.nombre === nomRutina) {
                this.rutina = null;
            }
        }

        for (let i = 0; i < this.rutinas.length; i++) {
        if (this.rutinas[i].nombre === nomRutina) {
            this.rutinas.splice(i, 1); 
            break;
        }
        
    }
    }

    
}