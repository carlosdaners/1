export class Ejercicio {

    constructor(nombre) {
        this.nombre = nombre;
        this.sesion = [];
        this.notas = [];
    }

    agregarSesion (sesion) {
        this.sesion.push(sesion);
    }

    ultimaSesion () {
        if (this.sesion.length === 0) return null;
        return this.sesion[this.sesion.length-1];
    }

    agregarNota (nota) {
        if (nota === undefined || nota === null || typeof nota !== 'string' || nota.length === 0) {
            return;
        } else {
        this.notas.push(nota);
        }
    }
    
}