// agregar ejercico
const btn_agregar_ejercicio = document.getElementById("btn-agregar-ejercicio");
const txt_agregarEjercico = document.getElementById("txt-agregar-ejercicio");
const lista_ejercicios = document.getElementById("exerciseList");

//agrear ejecicio a lista
function agregarEj_a_Lista (nombre) {
    const li = document.createElement("li");
    li.textContent = nombre;
    li.classList.add("list-group-item");
    lista_ejercicios.appendChild(li);
}

// click en btn agregar ejercicio
btn_agregar_ejercicio.addEventListener("click" , () => {
    let nomEjercicio = txt_agregarEjercico.value.trim();
    agregarEj_a_Lista(nomEjercicio);
    txt_agregarEjercico.value = "";
});