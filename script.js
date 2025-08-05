const btn_agregar_ejercicio = document.getElementById("btn-agregar-ejercicio");
const txt_agregarEjercico = document.getElementById("txt-agregar-ejercicio");
const lista_ejercicios = document.getElementById("exerciseList");

// Cargar ejercicios guardados al inicio
let ejercicios = cargarEjercicios(); // función que definiremos abajo

// Mostrar ejercicios guardados en la lista al cargar la página
ejercicios.forEach(ej => agregarEj_a_Lista(ej));

function agregarEj_a_Lista(nombre) {
    const li = document.createElement("li");
    li.textContent = nombre;
    li.classList.add("list-group-item");
    lista_ejercicios.appendChild(li);
}

// Función para guardar el array en localStorage
function guardarEjercicios(ejercicios) {
    localStorage.setItem('ejercicios', JSON.stringify(ejercicios));
}

// Función para cargar los ejercicios guardados (o un array vacío si no hay)
function cargarEjercicios() {
    const guardados = localStorage.getItem('ejercicios');
    return guardados ? JSON.parse(guardados) : [];
}

btn_agregar_ejercicio.addEventListener("click", () => {
    let nomEjercicio = txt_agregarEjercico.value.trim();
    if (nomEjercicio === "") return; // Evita agregar vacío

    agregarEj_a_Lista(nomEjercicio);

    ejercicios.push(nomEjercicio);       // Agregar al array en memoria
    guardarEjercicios(ejercicios);       // Guardar array actualizado en localStorage

    txt_agregarEjercico.value = "";      // Limpiar input
});
