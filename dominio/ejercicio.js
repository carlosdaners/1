export class Ejercicio {

    constructor(nombre) {
        this.nombre = nombre;
        this.sesion = [];
        this.notas;
    }

    agregarSesion (sesion) {
        this.sesion.push(sesion);
    }

    ultimaSesion () {
        if (this.sesion.length === 0) return null;
        return this.sesion[this.sesion.length-1];
    }
    
}