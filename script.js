import { Ejercicio } from './dominio/ejercicio.js';
import { Rutina } from './dominio/rutina.js';
import { Sistema } from './dominio/sistema.js';
import { Sesion } from './dominio/sesion.js';

const btn_agregar_ejercicio = document.getElementById("btn-agregar-ejercicio");
const txt_agregarEjercico = document.getElementById("txt-agregar-ejercicio");
const lista_ejercicios = document.getElementById("exerciseList");
const btn_agregarEjercicio_rutina = document.getElementById("btn-buscar-ejercicio");
const txtBuscarEjercicioRutina = document.getElementById("buscar-ejercicio-rutina");
const dropdownEjercicios = document.getElementById("dropdown-ejercicios");
const btnCrearRutina = document.getElementById("crear-rutina");
const nombreRutina = document.getElementById("nombre-rutina");



let sistema = new Sistema();

// Variable global para la rutina activa
let rutinaActiva = null;

function ocultarTodo () {
    document.getElementById("ejercicios").classList.remove("show", "active");
    document.getElementById("ver-rutinas").classList.remove("show", "active");
    document.getElementById("detalle-rutina").classList.remove("show", "active");
    document.getElementById("rutinas").classList.remove("show", "active");
    document.getElementById("ejercicios-tab").classList.remove("active");
    document.getElementById("ver-rutinas-tab").classList.remove("active");
    document.getElementById("rutinas-tab").classList.remove("active");
}

// Función para mostrar lista de ejercicio en pestana ejercicios
function mostrarLista() {
    lista_ejercicios.innerHTML = "";
    sistema.ejercicios.forEach((ej, idx) => {
        const card = document.createElement("div");
        card.className = "card mb-3";

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        const cardTitle = document.createElement("h5");
        cardTitle.className = "card-title";
        cardTitle.textContent = ej.nombre;

        const formContainer = document.createElement("div");
        formContainer.id = `form-ejercicio-${idx}`;
        formContainer.style.display = "none";
        formContainer.innerHTML = `
            <div class='input-group input-group-sm mb-2' style='max-width:350px;'>
                <input type='text' class='form-control' placeholder='Detalles' id='input-detalles-${idx}'>
                <button class='btn btn-success' id='btn-guardar-${idx}'>Guardar</button>
            </div>
        `;

        
        formContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        card.style.cursor = "pointer";
        card.addEventListener("mouseenter", () => {
            card.classList.add("border-primary", "shadow");
        });
        card.addEventListener("mouseleave", () => {
            card.classList.remove("border-primary", "shadow");
        });

        card.addEventListener("click", () => {
            formContainer.style.display = formContainer.style.display === "none" ? "block" : "none";
        });

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(formContainer);
        card.appendChild(cardBody);
        lista_ejercicios.appendChild(card);

        formContainer.querySelector(`#btn-guardar-${idx}`).addEventListener("click", (e) => {
            e.stopPropagation(); 
            const detalles = document.getElementById(`input-detalles-${idx}`).value.trim();

            if (detalles === "") {
                alert("Por favor, ingresa detalles.");
                return;
            }

            console.log(`Detalles guardados para ${ej.nombre}: ${detalles}`);
            formContainer.style.display = "none";
            const form = document.getElementById(`input-detalles-${idx}`);
            form.value = "";
            ej.notas = detalles;
            guardarSistema();
            console.log(ej.notas + ej.nombre);
            // Aquí puedes guardar los detalles en sistema.ejercicios[idx].detalles
        });
    });
}



// ===== Guardar datos en localStorage =====
function guardarSistema() {
   const data = {
    ejercicios: sistema.ejercicios.map(ej => ({
        nombre: ej.nombre,
        sesion: ej.sesion
    })),
    rutinas: sistema.rutinas.map(r => ({
        nombre: r.nombre,
        ejercicios: r.ejercicios.map(e => e.nombre)
    }))
};
    localStorage.setItem("sistema", JSON.stringify(data));
}

// ===== Cargar datos y reconstruir objetos =====
function cargarSistema() {
    const guardado = localStorage.getItem("sistema");
    if (!guardado) return;

    const data = JSON.parse(guardado);

    // reconstruir ejercicios
sistema.ejercicios = data.ejercicios.map(e => {
    const ej = new Ejercicio(e.nombre);
    ej.sesion = e.sesion || [];
    return ej;
});


    // reconstruir rutinas
    sistema.rutinas = data.rutinas.map(r => {
        const rutina = new Rutina(r.nombre);
        rutina.ejercicios = r.ejercicios
            .map(nombre => sistema.ejercicios.find(e => e.nombre === nombre))
            .filter(Boolean);
        return rutina;
    });
}

// ===== Verificar localStorage y mostrar error si no está disponible =====
function verificarLocalStorage() {
    try {
        localStorage.setItem('test', 'ok');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        const container = document.querySelector('.container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger mt-3';
            errorDiv.textContent = 'Error: Tu navegador no permite guardar datos localmente. Activa el almacenamiento o usa otro navegador.';
            container.prepend(errorDiv);
        }
        return false;
    }
}

// ===== Al cargar la página =====
window.onload = function() {
    if (!verificarLocalStorage()) return;
    // Activar la pestaña "Ver Rutinas" al cargar la página
    const verRutinasTab = document.getElementById("ver-rutinas-tab");
    verRutinasTab.classList.add("active");
    document.getElementById("ver-rutinas").classList.add("show", "active");
    document.getElementById("ejercicios-tab").classList.remove("active");
    document.getElementById("ejercicios").classList.remove("show", "active");
    document.getElementById("rutinas-tab").classList.remove("active");
    document.getElementById("rutinas").classList.remove("show", "active");

    cargarSistema();
    mostrarLista();
    mostrarRutinasCreadas();
};

// ===== Evento para agregar ejercicio =====
btn_agregar_ejercicio.addEventListener("click", () => {
    const nomEjercicio = txt_agregarEjercico.value.trim();
    if (nomEjercicio === "") return;

    const nuevoEjercicio = new Ejercicio(nomEjercicio);
    sistema.agregarEjercicio(nuevoEjercicio);

    guardarSistema();
    mostrarLista();

    txt_agregarEjercico.value = "";
});

// Lista temporal de ejercicios para la rutina
let ejerciciosRutinaTemp = [];

// Función para mostrar la lista temporal en el HTML
function mostrarEjerciciosRutinaTemp() {
    const lista = document.getElementById("lista-ejercicio-rutina");
    lista.innerHTML = "";
    ejerciciosRutinaTemp.forEach((ej, idx) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center mt-2";
        li.textContent = ej.nombre;
        // Botón para eliminar
        const btnEliminar = document.createElement("button");
        btnEliminar.className = "btn btn-danger btn-sm";
        btnEliminar.textContent = "Eliminar";
        btnEliminar.onclick = () => {
            ejerciciosRutinaTemp.splice(idx, 1);
            mostrarEjerciciosRutinaTemp();
        };
        li.appendChild(btnEliminar);
        lista.appendChild(li);
    });
}

btn_agregarEjercicio_rutina.addEventListener("click", () => {
    const nombreEjercicio = txtBuscarEjercicioRutina.value.trim();
    
    const ejercicio = sistema.ejercicios.find(ej => ej.nombre === nombreEjercicio);
    if (ejercicio && !ejerciciosRutinaTemp.includes(ejercicio)) {
        ejerciciosRutinaTemp.push(ejercicio);
        mostrarEjerciciosRutinaTemp();
        txtBuscarEjercicioRutina.value = "";
    }
});

// Autocompletar ejercicios en rutina
// Actualiza el dropdown con ejercicios que coinciden
function mostrarDropdownEjercicios(filtro) {
    const ejercicios = sistema.ejercicios.filter(ej => ej.nombre.toLowerCase().includes(filtro.toLowerCase()));
    dropdownEjercicios.innerHTML = "";
    if (filtro.length === 0 || ejercicios.length === 0) {
        dropdownEjercicios.style.display = "none";
        return;
    }
    ejercicios.forEach(ej => {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action";
        li.textContent = ej.nombre;
        li.onclick = () => {
            txtBuscarEjercicioRutina.value = ej.nombre;
            dropdownEjercicios.style.display = "none";
        };
        dropdownEjercicios.appendChild(li);
    });
    dropdownEjercicios.style.display = "block";
}

txtBuscarEjercicioRutina.addEventListener("input", (e) => {
    mostrarDropdownEjercicios(e.target.value);
});

txtBuscarEjercicioRutina.addEventListener("blur", () => {
    setTimeout(() => dropdownEjercicios.style.display = "none", 150);
});


// Crear rutina
btnCrearRutina.addEventListener("click", () => {
    const nombre = nombreRutina.value.trim();
    if (nombre === "") {
        alert("El nombre de la rutina no puede estar vacío.");
        return;
    }
    const nuevo = new Rutina(nombre);
    ejerciciosRutinaTemp.forEach(ej => nuevo.agregarEjercicio(ej));
    sistema.rutinas.push(nuevo);
    ejerciciosRutinaTemp = [];
    mostrarEjerciciosRutinaTemp();
    nombreRutina.value = "";
    txtBuscarEjercicioRutina.value = "";
    guardarSistema();
    mostrarRutinasCreadas();
    const aviso_creado = document.getElementById("alert-creo-rutina");
    aviso_creado.textContent = `Rutina "${nombre}" creada`;
});

// Función para mostrar rutinas creadas
function mostrarRutinasCreadas() {
    const lista = document.getElementById("lista-rutinas-creadas");
    lista.innerHTML = "";
    sistema.rutinas.forEach((r, idx) => {
        const card = document.createElement("div");
        card.className = "card mb-3";
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        const cardTitle = document.createElement("h5");
        cardTitle.className = "card-title";
        cardTitle.textContent = r.nombre;
        cardBody.appendChild(cardTitle);
        card.appendChild(cardBody);
        card.style.cursor = "pointer";
        card.addEventListener("mouseenter", () => {
            card.classList.add("border-primary", "shadow");
        });
        card.addEventListener("mouseleave", () => {
            card.classList.remove("border-primary", "shadow");
        });
        // Listener para ver detalle de la rutina
        card.addEventListener("click", () => {
            // Cambiar a la pestaña de detalle
            document.getElementById("ver-rutinas").classList.remove("show", "active");
            document.getElementById("detalle-rutina").classList.add("show", "active");
            document.getElementById("ver-rutinas-tab").classList.remove("active");
            // Mostrar nombre y ejercicios
            document.getElementById("detalle-rutina-nombre").textContent = r.nombre;
            const ul = document.getElementById("detalle-rutina-ejercicios");
            ul.innerHTML = "";
            r.ejercicios.forEach(ej => {
                const li = document.createElement("li");
                li.className = "list-group-item";
                li.textContent = ej.nombre;
                ul.appendChild(li);
            });
        });
        lista.appendChild(card);
    });
}

// Volver a la lista de rutinas desde el detalle
const volverBtn = document.getElementById("volver-a-rutinas");
if (volverBtn) {
    volverBtn.addEventListener("click", () => {
        document.getElementById("detalle-rutina").classList.remove("show", "active");
        document.getElementById("ver-rutinas").classList.add("show", "active");
        document.getElementById("ver-rutinas-tab").classList.add("active");
    });
}

const btnComenzarRutina = document.getElementById("comenzar-rutina");
if (btnComenzarRutina) {
    // Si hay una rutina activa al cargar, deshabilitar el botón
    if (rutinaActiva) {
        btnComenzarRutina.disabled = true;
        btnComenzarRutina.classList.add("disabled");
        btnComenzarRutina.style.opacity = "0.6";
        btnComenzarRutina.style.cursor = "not-allowed";
    }
    btnComenzarRutina.addEventListener("click", () => {
        // Obtener la rutina seleccionada del detalle
        const nombreRutinaSeleccionada = document.getElementById("detalle-rutina-nombre").textContent;
        const rutinaSeleccionada = sistema.rutinas.find(r => r.nombre === nombreRutinaSeleccionada);
        if (!rutinaSeleccionada) return;
        if (rutinaActiva) {
            // No hacer nada si ya hay una rutina activa
            return;
        }
        // Activar la rutina
        rutinaActiva = rutinaSeleccionada;
        // Deshabilitar el botón
        btnComenzarRutina.disabled = true;
        btnComenzarRutina.classList.add("disabled");
        btnComenzarRutina.style.opacity = "0.6";
        btnComenzarRutina.style.cursor = "not-allowed";
        // Mostrar la rutina activa en la pestaña
        const div = document.getElementById("rutina-activa");
        let html = `<h2 class='mb-3'>Rutina Activa: ${rutinaActiva.nombre}</h2>`;
        rutinaActiva.ejercicios.forEach((ej, ejIdx) => {
            html += `<div class='mb-3' id='ejercicio-activo-${ejIdx}'>`;
            html += `<h5>${ej.nombre}</h5>`;
            // Buscar la última sesión del ejercicio
            let ultimaSesion = null;
            if (ej.sesion && ej.sesion.length > 0) {
                ultimaSesion = ej.sesion[ej.sesion.length - 1];
            }
            if (ultimaSesion && ultimaSesion.series && ultimaSesion.series.length > 0) {
                html += `<table class='table table-sm table-bordered' id='tabla-series-${ejIdx}'>`;
                html += `<thead><tr><th>Peso previo</th><th>Reps previas</th><th>Peso hoy</th><th>Reps hoy</th></tr></thead><tbody>`;
                ultimaSesion.series.forEach((serie, idx) => {
                    html += `<tr>`;
                    html += `<td>${serie.peso}</td>`;
                    html += `<td>${serie.repeticiones}</td>`;
                    html += `<td><input type='number' min='0' class='form-control form-control-sm peso-hoy-input' data-ejidx='${ejIdx}' data-serieidx='${idx}' value='${serie.peso}'></td>`;
                    html += `<td><input type='number' min='0' class='form-control form-control-sm reps-hoy-input' data-ejidx='${ejIdx}' data-serieidx='${idx}' placeholder='Reps hoy' value=''></td>`;
                    html += `</tr>`;
                });
                html += `</tbody></table>`;
                html += `<div class='text-muted small'>Fecha previa: ${ultimaSesion.fecha || 'Sin fecha'}</div>`;
            }
            // Botón para mostrar inputs de agregar serie
            html += `<button class='btn btn-outline-primary btn-sm mb-2' id='btn-toggle-agregar-serie-${ejIdx}'>Agregar serie</button>`;
            html += `<div id='agregar-serie-form-${ejIdx}' style='display:none;'>
                <div class='input-group input-group-sm mb-2' style='max-width:350px;'>
                    <input type='number' min='0' class='form-control' placeholder='Peso' id='input-peso-nueva-${ejIdx}'>
                    <input type='number' min='1' class='form-control' placeholder='Reps' id='input-reps-nueva-${ejIdx}'>
                    <button class='btn btn-success' id='btn-agregar-serie-nueva-${ejIdx}'>Guardar</button>
                    <button class='btn btn-secondary' id='btn-cerrar-serie-form-${ejIdx}'>Cerrar</button>
                </div>
            </div>`;
            html += `</div>`;
        });
        html += `<button class='btn btn-danger' id='finalizar-rutina-activa'>Finalizar Rutina</button>`;
        div.innerHTML = html;
        ocultarTodo();
        div.classList.add("show", "active");
        document.getElementById("rutina-activa-tab").classList.add("active");

        // 🔹 Listener combinado para guardar Peso y Reps hoy automáticamente
        const inputs = div.querySelectorAll('.peso-hoy-input, .reps-hoy-input');
        inputs.forEach(input => {
            input.addEventListener('change', function() {
                const ejIdx = parseInt(this.getAttribute('data-ejidx'));
                const serieIdx = parseInt(this.getAttribute('data-serieidx'));
                const ej = rutinaActiva.ejercicios[ejIdx];

                // Buscar o crear la sesión de hoy
                const hoy = new Date().toISOString().slice(0,10);
                let sesionHoy = ej.sesion && ej.sesion.find(s => s.fecha === hoy);
                if (!sesionHoy) {
                    sesionHoy = new Sesion(hoy);
                    ej.sesion = ej.sesion || [];
                    ej.sesion.push(sesionHoy);
                }

                // Buscar o crear la serie correspondiente
                if (!sesionHoy.series[serieIdx]) {
                    sesionHoy.series[serieIdx] = { peso: 0, repeticiones: 0 };
                }

                // Obtener valores de ambos inputs
                const pesoInput = div.querySelector(`.peso-hoy-input[data-ejidx='${ejIdx}'][data-serieidx='${serieIdx}']`);
                const repsInput = div.querySelector(`.reps-hoy-input[data-ejidx='${ejIdx}'][data-serieidx='${serieIdx}']`);

                const pesoHoy = parseFloat(pesoInput.value) || 0;
                const repsHoy = parseInt(repsInput.value) || 0;

                // Guardar en la serie de hoy
                sesionHoy.series[serieIdx].peso = pesoHoy;
                sesionHoy.series[serieIdx].repeticiones = repsHoy;

                guardarSistema();
            });
        });

        // Listeners para mostrar/ocultar el form de agregar serie y guardar la nueva serie
        rutinaActiva.ejercicios.forEach((ej, ejIdx) => {
            const btnToggle = document.getElementById(`btn-toggle-agregar-serie-${ejIdx}`);
            const formDiv = document.getElementById(`agregar-serie-form-${ejIdx}`);
            btnToggle.addEventListener('click', () => {
                formDiv.style.display = formDiv.style.display === 'none' ? 'block' : 'none';
            });
            // Botón para cerrar el form
            const btnCerrar = document.getElementById(`btn-cerrar-serie-form-${ejIdx}`);
            btnCerrar.addEventListener('click', () => {
                formDiv.style.display = 'none';
            });
            const btnGuardar = document.getElementById(`btn-agregar-serie-nueva-${ejIdx}`);
            btnGuardar.addEventListener('click', () => {
                const peso = parseFloat(document.getElementById(`input-peso-nueva-${ejIdx}`).value);
                const reps = parseInt(document.getElementById(`input-reps-nueva-${ejIdx}`).value);
                if (isNaN(peso) || isNaN(reps) || reps < 1) {
                    alert('Completa peso y repeticiones válidos.');
                    return;
                }
                // Buscar o crear la sesión de hoy
                const hoy = new Date().toISOString().slice(0,10);
                let sesionHoy = ej.sesion && ej.sesion.find(s => s.fecha === hoy);
                if (!sesionHoy) {
                    sesionHoy = new Sesion(hoy);
                    ej.sesion = ej.sesion || [];
                    ej.sesion.push(sesionHoy);
                }
                sesionHoy.series.push({ peso, repeticiones: reps });
                guardarSistema();
                // Limpiar inputs y ocultar el form
                document.getElementById(`input-peso-nueva-${ejIdx}`).value = '';
                document.getElementById(`input-reps-nueva-${ejIdx}`).value = '';
                formDiv.style.display = 'none';
                // Recargar la pestaña de rutina activa para actualizar todo y resaltar
                mostrarRutinaActiva(ejIdx);
            });
        });

        // Listener para finalizar rutina activa
        document.getElementById("finalizar-rutina-activa").onclick = () => {
            rutinaActiva = null;
            // Limpiar la pestaña de rutina activa
            div.innerHTML = `<h2 class='mb-3'>Rutina Activa</h2><p>No hay rutina activa.</p>`;
            // Habilitar el botón nuevamente
            btnComenzarRutina.disabled = false;
            btnComenzarRutina.classList.remove("disabled");
            btnComenzarRutina.style.opacity = "1";
            btnComenzarRutina.style.cursor = "pointer";
        };
    });
}



const tabButtons = document.querySelectorAll('#myTab .nav-link');
tabButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
        ocultarTodo();
        const target = btn.getAttribute('data-bs-target');
        if (target) {
            document.querySelector(target).classList.add('show', 'active');
            btn.classList.add('active');
        }
    });
});

// Nueva función para refrescar la vista de la rutina activa
function mostrarRutinaActiva(destacarEjIdx = null) {
    if (!rutinaActiva) return;
    const div = document.getElementById("rutina-activa");
    let html = `<h2 class='mb-3'>Rutina Activa: ${rutinaActiva.nombre}</h2>`;
    rutinaActiva.ejercicios.forEach((ej, ejIdx) => {
        html += `<div class='mb-3' id='ejercicio-activo-${ejIdx}'>`;
        html += `<h5>${ej.nombre}</h5>`;
        // Buscar la última sesión del ejercicio
        let ultimaSesion = null;
        if (ej.sesion && ej.sesion.length > 0) {
            ultimaSesion = ej.sesion[ej.sesion.length - 1];
        }
        if (ultimaSesion && ultimaSesion.series && ultimaSesion.series.length > 0) {
            html += `<table class='table table-sm table-bordered' id='tabla-series-${ejIdx}'>`;
            html += `<thead><tr><th>Peso</th><th>Reps previas</th><th>Reps hoy</th></tr></thead><tbody>`;
            ultimaSesion.series.forEach((serie, idx) => {
                html += `<tr>`;
                html += `<td>${serie.peso}</td>`;
                html += `<td>${serie.repeticiones}</td>`;
                // Siempre dejar el input de reps hoy vacío al cargar
                html += `<td><input type='number' min='0' class='form-control form-control-sm reps-hoy-input' data-ejidx='${ejIdx}' data-serieidx='${idx}' placeholder='Reps hoy' value=''></td>`;
                html += `</tr>`;
            });
            html += `</tbody></table>`;
            html += `<div class='text-muted small'>Fecha previa: ${ultimaSesion.fecha || 'Sin fecha'}</div>`;
        }
        // Botón para mostrar inputs de agregar serie
        html += `<button class='btn btn-outline-primary btn-sm mb-2' id='btn-toggle-agregar-serie-${ejIdx}'>Agregar serie</button>`;
        html += `<div id='agregar-serie-form-${ejIdx}' style='display:none;'>
            <div class='input-group input-group-sm mb-2' style='max-width:350px;'>
                <input type='number' min='0' class='form-control' placeholder='Peso' id='input-peso-nueva-${ejIdx}'>
                <input type='number' min='1' class='form-control' placeholder='Reps' id='input-reps-nueva-${ejIdx}'>
                <button class='btn btn-success' id='btn-agregar-serie-nueva-${ejIdx}'>Guardar</button>
                <button class='btn btn-secondary' id='btn-cerrar-serie-form-${ejIdx}'>Cerrar</button>
            </div>
        </div>`;
        html += `</div>`;
    });
    html += `<button class='btn btn-danger' id='finalizar-rutina-activa'>Finalizar Rutina</button>`;
    div.innerHTML = html;
    ocultarTodo();
    div.classList.add("show", "active");
    document.getElementById("rutina-activa-tab").classList.add("active");
    // Listeners para guardar reps hoy automáticamente
    const repsInputs = div.querySelectorAll('.reps-hoy-input');
    repsInputs.forEach(input => {
        input.addEventListener('change', function() {
            const ejIdx = parseInt(this.getAttribute('data-ejidx'));
            const serieIdx = parseInt(this.getAttribute('data-serieidx'));
            const repsHoy = parseInt(this.value);
            if (isNaN(repsHoy) || repsHoy < 0) return;
            const ej = rutinaActiva.ejercicios[ejIdx];
            const peso = ej.sesion[ej.sesion.length-1].series[serieIdx].peso;
            // Buscar o crear la sesión de hoy
            const hoy = new Date().toISOString().slice(0,10);
            let sesionHoy = ej.sesion && ej.sesion.find(s => s.fecha === hoy);
            if (!sesionHoy) {
                sesionHoy = new Sesion(hoy);
                ej.sesion = ej.sesion || [];
                ej.sesion.push(sesionHoy);
            }
            // Buscar si ya existe la serie para ese peso hoy
            let serieHoy = sesionHoy.series.find(s => s.peso === peso);
            if (!serieHoy) {
                serieHoy = { peso, repeticiones: repsHoy };
                sesionHoy.series.push(serieHoy);
            } else {
                serieHoy.repeticiones = repsHoy;
            }
            guardarSistema();
        });
    });
    // Listeners para mostrar/ocultar el form de agregar serie y guardar la nueva serie
    rutinaActiva.ejercicios.forEach((ej, ejIdx) => {
        const btnToggle = document.getElementById(`btn-toggle-agregar-serie-${ejIdx}`);
        const formDiv = document.getElementById(`agregar-serie-form-${ejIdx}`);
        btnToggle.addEventListener('click', () => {
            formDiv.style.display = formDiv.style.display === 'none' ? 'block' : 'none';
        });
        // Botón para cerrar el form
        const btnCerrar = document.getElementById(`btn-cerrar-serie-form-${ejIdx}`);
        btnCerrar.addEventListener('click', () => {
            formDiv.style.display = 'none';
        });
        const btnGuardar = document.getElementById(`btn-agregar-serie-nueva-${ejIdx}`);
        btnGuardar.addEventListener('click', () => {
            const peso = parseFloat(document.getElementById(`input-peso-nueva-${ejIdx}`).value);
            const reps = parseInt(document.getElementById(`input-reps-nueva-${ejIdx}`).value);
            if (isNaN(peso) || isNaN(reps) || reps < 1) {
                alert('Completa peso y repeticiones válidos.');
                return;
            }
            // Buscar o crear la sesión de hoy
            const hoy = new Date().toISOString().slice(0,10);
            let sesionHoy = ej.sesion && ej.sesion.find(s => s.fecha === hoy);
            if (!sesionHoy) {
                sesionHoy = new Sesion(hoy);
                ej.sesion = ej.sesion || [];
                ej.sesion.push(sesionHoy);
            }
            sesionHoy.series.push({ peso, repeticiones: reps });
            guardarSistema();
            // Limpiar inputs y ocultar el form
            document.getElementById(`input-peso-nueva-${ejIdx}`).value = '';
            document.getElementById(`input-reps-nueva-${ejIdx}`).value = '';
            formDiv.style.display = 'none';
            // Recargar la pestaña de rutina activa para actualizar todo y resaltar
            mostrarRutinaActiva(ejIdx);
        });
    });
    // Listener para finalizar rutina activa
    document.getElementById("finalizar-rutina-activa").onclick = () => {
        rutinaActiva = null;
        // Limpiar la pestaña de rutina activa
        div.innerHTML = `<h2 class='mb-3'>Rutina Activa</h2><p>No hay rutina activa.</p>`;
        // Habilitar el botón nuevamente
        btnComenzarRutina.disabled = false;
        btnComenzarRutina.classList.remove("disabled");
        btnComenzarRutina.style.opacity = "1";
        btnComenzarRutina.style.cursor = "pointer";
    };
}