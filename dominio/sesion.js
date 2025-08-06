export class Sesion {
    constructor (fecha) {
        this.fecha = fecha;
        this.series = [];
    }

    agregarSerie(peso, repeticiones) {
        this.series.push(new serie(peso,repeticiones));
    }
}