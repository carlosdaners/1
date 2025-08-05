const btn_agregar_ejercicio = document.getElementById("btn-agregar-ejercicio");
const txt_agregarEjercico = document.getElementById("txt-agregar-ejercicio");
const lista_ejercicios = document.getElementById("exerciseList");

let ejercicios = []; // array en memoria

// Función para mostrar ejercicio en la lista HTML
function agregarEj_a_Lista(nombre) {
    const li = document.createElement("li");
    li.textContent = nombre;
    li.classList.add("list-group-item");
    lista_ejercicios.appendChild(li);
}

// Función para guardar el array en localStorage
function guardarEjercicios() {
    localStorage.setItem('ejercicios', JSON.stringify(ejercicios));
}

// Función para cargar los ejercicios guardados (o un array vacío si no hay)
function cargarEjercicios() {
    const guardados = localStorage.getItem('ejercicios');
    return guardados ? JSON.parse(guardados) : [];
}

// Al cargar la página, cargar y mostrar los ejercicios guardados
window.onload = function() {
    ejercicios = cargarEjercicios();
    ejercicios.forEach(ej => agregarEj_a_Lista(ej));
}

// Evento para agregar ejercicio nuevo
btn_agregar_ejercicio.addEventListener("click", () => {
    let nomEjercicio = txt_agregarEjercico.value.trim();
    if (nomEjercicio === "") return; // no agregar vacío

    ejercicios.push(nomEjercicio);   // añadir a array en memoria
    guardarEjercicios();              // guardar en localStorage
    agregarEj_a_Lista(nomEjercicio); // mostrar en pantalla

    txt_agregarEjercico.value = "";  // limpiar input
});
