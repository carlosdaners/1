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

// variable global para el dia de hoy 
let diaHoy = null;

function ocultarTodo () {
    document.getElementById("ejercicios").classList.remove("show", "active");
    document.getElementById("ver-rutinas").classList.remove("show", "active");
    document.getElementById("detalle-rutina").classList.remove("show", "active");
    document.getElementById("rutinas").classList.remove("show", "active");
    document.getElementById("ejercicios-tab").classList.remove("active");
    document.getElementById("ver-rutinas-tab").classList.remove("active");
    document.getElementById("rutinas-tab").classList.remove("active");
    document.getElementById("asignacion-rutina-dia-tab").classList.remove("show", "active");
    
}

// Función para mostrar lista de ejercicio en pestana ejercicios
function mostrarLista(filtro = "") {
    lista_ejercicios.innerHTML = "";

    let ejercicios;
    if (filtro && filtro.trim() !== "") {
        ejercicios = sistema.ejercicios.filter(ej => 
            ej.nombre.toLowerCase().includes(filtro.toLowerCase())
        );
    } else {
        ejercicios = sistema.ejercicios;
    }

    ejercicios.forEach((ej, idx) => {
        const card = document.createElement("div");
        card.className = "card shadow-sm rounded-3 mb-4";

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
           
            <div style="display: flex; gap: 8px;">
                <select id="select-dia-${idx}" class="form-select form-select-sm">
                    <option value="">Seleccionar día</option>
                    <option value="lunes">Lunes</option>
                    <option value="martes">Martes</option>
                    <option value="miercoles">Miércoles</option>
                    <option value="jueves">Jueves</option>
                    <option value="viernes">Viernes</option>
                    <option value="sabado">Sábado</option>
                    <option value="domingo">Domingo</option>
                </select>

                <button class="btn btn-primary btn-sm w-100" id="btn-agregar-ejercicio-dia-${idx}">
                    Agregar a día
                </button>
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
            if (formContainer.style.display === "none") {
                formContainer.style.display = "block";
            } else {
                formContainer.style.display = "none";
            }
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

            formContainer.style.display = "none";
            const form = document.getElementById(`input-detalles-${idx}`);
            form.value = "";
            ej.agregarNota(detalles);
            guardarSistema();

            ej.notas.forEach((nota, notaIdx) => {
                console.log(`Nota ${notaIdx + 1} para ${ej.nombre}: ${nota}`);
            });
        });

        formContainer.querySelector(`#btn-agregar-ejercicio-dia-${idx}`).addEventListener("click", (e) => {
         e.stopPropagation();
         // falta agregar la funcionalidad para asignar el ejercicio al día
         const selectDia = document.getElementById(`select-dia-${idx}`).value;
         sistema.asignarEjercicioADia(selectDia, ej);
        guardarSistema();
        });
    });
}




// ===== Guardar datos en localStorage =====
function guardarSistema() {
  const data = {
    ejercicios: sistema.ejercicios.map(ej => ({
      nombre: ej.nombre,
      sesion: ej.sesion,
      notas: ej.notas || []
    })),
    rutinas: sistema.rutinas.map(r => ({
      nombre: r.nombre,
      ejercicios: r.ejercicios.map(e => e.nombre)
    })),
    asignacionDias: {}
  };

  // Guardar asignación por día
  ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'].forEach(dia => {
    const objDia = sistema[dia];
    data.asignacionDias[dia] = {
      rutina: objDia.rutina ? objDia.rutina.nombre : null,
      ejerciciosExtras: objDia.ejerciciosExtras.map(e => e.nombre)
    };
  });

  localStorage.setItem("sistema", JSON.stringify(data));
}


// ===== Cargar datos y reconstruir objetos =====
function cargarSistema() {
  const guardado = localStorage.getItem("sistema");
  if (!guardado) return;

  const data = JSON.parse(guardado);

  sistema.ejercicios = data.ejercicios.map(e => {
    const ej = new Ejercicio(e.nombre);
    ej.sesion = e.sesion || [];
    ej.notas = e.notas || [];
    return ej;
  });

  sistema.rutinas = data.rutinas.map(r => {
    const rutina = new Rutina(r.nombre);
    rutina.ejercicios = r.ejercicios
      .map(nombre => sistema.ejercicios.find(e => e.nombre === nombre))
      .filter(Boolean);
    return rutina;
  });

  // Cargar asignaciones por día
  if (data.asignacionDias) {
    for (const dia in data.asignacionDias) {
      if (sistema.hasOwnProperty(dia)) {
        const diaData = data.asignacionDias[dia];
        const rutina = sistema.rutinas.find(r => r.nombre === diaData.rutina) || null;
        const extras = (diaData.ejerciciosExtras || [])
          .map(nombre => sistema.ejercicios.find(e => e.nombre === nombre))
          .filter(Boolean);

        sistema[dia] = {
          rutina: rutina,
          ejerciciosExtras: extras
        };
      }
    }
  }
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
    actualizarDia();
    cargarRutinaDeHoy(rutinaDeHoy());
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
        card.className = "card shadow-sm rounded-3 mb-4";
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        const cardTitle = document.createElement("h5");
        cardTitle.className = "card-title text-center";
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

//boton para comenzar rutina activa
const btnComenzarRutina = document.getElementById("comenzar-rutina");

if (btnComenzarRutina) {
  btnComenzarRutina.addEventListener("click", () => {
    const nombreRutinaSeleccionada = document.getElementById("detalle-rutina-nombre").textContent;
    const rutinaSeleccionada = sistema.rutinas.find(r => r.nombre === nombreRutinaSeleccionada);
    if (!rutinaSeleccionada) return;

    if (rutinaActiva) {
      return;
    }

    rutinaActiva = rutinaSeleccionada;

    btnComenzarRutina.disabled = true;
    btnComenzarRutina.classList.add("disabled");
    btnComenzarRutina.style.opacity = "0.6";
    btnComenzarRutina.style.cursor = "not-allowed";

    // Mostrar la rutina activa en la interfaz
    mostrarRutinaActiva();
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

//función para refrescar la vista de la rutina activa
function mostrarRutinaActiva(destacarEjIdx = null) {
    if (!rutinaActiva) return;

    const div = document.getElementById("rutina-activa");
    let html = `<h2 class='mb-3 fs-2 fw-bold'>Rutina Activa: ${rutinaActiva.nombre}</h2>`;

    rutinaActiva.ejercicios.forEach((ej, ejIdx) => {
        html += `<div class='mb-3' id='ejercicio-activo-${ejIdx}'>`;
        html += `<h5 class='fs-4 fw-bold'>${ej.nombre}</h5>`;

        // Mostrar notas con botón para borrar
        html += `<ul class="list-group list-group-flush mb-3" id="lista-nota-ejercicio-${ejIdx}">`;
        ej.notas.forEach((nota, idxNota) => {
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center small">
                    ${nota}
                    <button class="btn btn-danger btn-sm" id="btn-borrar-nota-${ejIdx}-${idxNota}">x</button>
                </li>
            `;
        });
        html += `</ul>`;

        // Mostrar última sesión con series
        let ultimaSesion = null;
        if (ej.sesion && ej.sesion.length > 0) {
            ultimaSesion = ej.sesion[ej.sesion.length - 1];
        }

        if (ultimaSesion && ultimaSesion.series && ultimaSesion.series.length > 0) {
    html += `<div class="card shadow-sm mb-3">`;
    html += `<div class="card-body">`;

    html += `<table class='table table-sm table-borderless align-middle' id='tabla-series-${ejIdx}'>`;
    html += `<thead class="table-light text-center">
                <tr>
                    <th>Serie</th>
                    <th>Anterior</th>
                    <th>Peso</th>
                    <th>Reps</th>
                </tr>
             </thead><tbody>`;

    ultimaSesion.series.forEach((serie, idx) => {
        html += `<tr class="text-center">`;
        html += `<td>${idx+1}</td>`;
        html += `<td class="text-muted">${serie.peso} x ${serie.repeticiones}</td>`;
        html += `<td><input type="number" inputmode="numeric" pattern="[0-9]*" 
                    class="form-control form-control-sm text-center rounded-3" 
                    data-ejidx="${ejIdx}" data-serieidx="${idx}" 
                    value="${serie.peso}"></td>`;
        html += `<td><input type="number" inputmode="numeric" pattern="[0-9]*" 
                    class="form-control form-control-sm text-center rounded-3" 
                    data-ejidx="${ejIdx}" data-serieidx="${idx}" 
                    placeholder="Reps hoy"></td>`;
        html += `</tr>`;
    });

    html += `</tbody></table>`;
    html += `<div class='text-muted small'>Fecha previa: ${ultimaSesion.fecha || 'Sin fecha'}</div>`;
    html += `</div></div>`;
}


        // Botón y formulario para agregar nueva serie
        html += `<button class='btn btn-outline-primary btn-sm mb-2 w-100' id='btn-toggle-agregar-serie-${ejIdx}'>Agregar serie</button>`;
        html += `
            <div id='agregar-serie-form-${ejIdx}' style='display:none;'>
                <div class='input-group input-group-sm mb-2' style='max-width:350px;'>
                    <input type='number' min='0' class='form-control' placeholder='Peso' id='input-peso-nueva-${ejIdx}'>
                    <input type='number' min='1' class='form-control' placeholder='Reps' id='input-reps-nueva-${ejIdx}'>
                    <button class='btn btn-success' id='btn-agregar-serie-nueva-${ejIdx}'>Guardar</button>
                    <button class='btn btn-secondary' id='btn-cerrar-serie-form-${ejIdx}'>Cerrar</button>
                </div>
            </div>
        `;

        html += `</div>`; 
    });
        html += `<div id="ejercicios-extras-rutina-activa" class="mb-3"></div>`;

    html += `<button class='btn btn-danger w-100' id='finalizar-rutina-activa'>Finalizar Rutina</button>`;
     html += `<div style="height: 80px;"></div>`;
     // padding para el boton de finalizr rutina 
    div.innerHTML = html;

    ocultarTodo();
    div.classList.add("show", "active");
    document.getElementById("rutina-activa-tab").classList.add("active");

    // --- Asignar eventos a botones para borrar notas ---
    rutinaActiva.ejercicios.forEach((ej, ejIdx) => {
        ej.notas.forEach((nota, idxNota) => {
            const btnBorrar = document.getElementById(`btn-borrar-nota-${ejIdx}-${idxNota}`);
            if (btnBorrar) {
                btnBorrar.addEventListener('click', () => {
                    rutinaActiva.ejercicios[ejIdx].notas.splice(idxNota, 1);
                    guardarSistema();
                    mostrarRutinaActiva(ejIdx); 
                });
            }
        });
    });

    // --- Guardar automáticamente peso y reps hoy cuando se cambian ---
    const inputs = div.querySelectorAll('.peso-hoy-input, .reps-hoy-input');
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            const ejIdx = parseInt(this.getAttribute('data-ejidx'));
            const serieIdx = parseInt(this.getAttribute('data-serieidx'));
            const ej = rutinaActiva.ejercicios[ejIdx];

            // Buscar o crear sesión de hoy
            const hoy = new Date().toISOString().slice(0,10);
            let sesionHoy = ej.sesion && ej.sesion.find(s => s.fecha === hoy);
            if (!sesionHoy) {
                sesionHoy = new Sesion(hoy);
                ej.sesion = ej.sesion || [];
                ej.sesion.push(sesionHoy);
            }

            // Asegurar que la serie existe
            if (!sesionHoy.series[serieIdx]) {
                sesionHoy.series[serieIdx] = { peso: 0, repeticiones: 0 };
            }

            // Obtener valores de inputs peso y reps
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

    // --- Eventos para mostrar/ocultar formulario agregar serie ---
    rutinaActiva.ejercicios.forEach((ej, ejIdx) => {
        const btnToggle = document.getElementById(`btn-toggle-agregar-serie-${ejIdx}`);
        const formDiv = document.getElementById(`agregar-serie-form-${ejIdx}`);

        btnToggle.addEventListener('click', () => {
            formDiv.style.display = formDiv.style.display === 'none' ? 'block' : 'none';
        });

        // Botón cerrar form
        const btnCerrar = document.getElementById(`btn-cerrar-serie-form-${ejIdx}`);
        btnCerrar.addEventListener('click', () => {
            formDiv.style.display = 'none';
        });

        // Botón guardar nueva serie
        const btnGuardar = document.getElementById(`btn-agregar-serie-nueva-${ejIdx}`);
        btnGuardar.addEventListener('click', () => {
            const peso = parseFloat(document.getElementById(`input-peso-nueva-${ejIdx}`).value);
            const reps = parseInt(document.getElementById(`input-reps-nueva-${ejIdx}`).value);

            if (isNaN(peso) || isNaN(reps) || reps < 1) {
                alert('Completa peso y repeticiones válidos.');
                return;
            }

            // Buscar o crear sesión hoy
            const hoy = new Date().toISOString().slice(0,10);
            let sesionHoy = ej.sesion && ej.sesion.find(s => s.fecha === hoy);
            if (!sesionHoy) {
                sesionHoy = new Sesion(hoy);
                ej.sesion = ej.sesion || [];
                ej.sesion.push(sesionHoy);
            }

            sesionHoy.series.push({ peso, repeticiones: reps });
            guardarSistema();

            // Limpiar inputs y ocultar form
            document.getElementById(`input-peso-nueva-${ejIdx}`).value = '';
            document.getElementById(`input-reps-nueva-${ejIdx}`).value = '';
            formDiv.style.display = 'none';

            mostrarRutinaActiva(ejIdx); // recargar y destacar ejercicio
        });
        
    });

    // --- Botón para finalizar rutina activa ---
    document.getElementById("finalizar-rutina-activa").onclick = () => {
      if (rutinaActiva) {
        rutinaActiva.ejercicios.forEach(ej => {
            if (ej.sesion && ej.sesion.length > 0) {
                ej.sesion.forEach(sesion => {
                    sesion.series = sesion.series.filter(serie => {
                        return serie.repeticiones && serie.repeticiones > 0;
                    });
                });
                ej.sesion = ej.sesion.filter(sesion => sesion.series.length > 0);
            }
        });
        guardarSistema();
    }
        rutinaActiva = null;
        div.innerHTML = `<h2 class='mb-3'>Rutina Activa</h2><p>No hay rutina activa.</p>`;

        // Rehabilitar botón comenzar rutina
        const btnComenzarRutina = document.getElementById("comenzar-rutina");
        if (btnComenzarRutina) {
            btnComenzarRutina.disabled = false;
            btnComenzarRutina.classList.remove("disabled");
            btnComenzarRutina.style.opacity = "1";
            btnComenzarRutina.style.cursor = "pointer";
        }
    };
   cargarEjerciciosExtra();
}

// funcionalidad para buscar ejericicio en la pestana ejercicios
const btnBuscarEjercicio = document.getElementById("btn-buscar-ejercicio-ejercicios");
const txtBuscarEjercicio = document.getElementById("txt-buscar-ejercicio");
btnBuscarEjercicio.addEventListener("click", () => {
    if (txtBuscarEjercicio.classList.contains("d-none")) {
        txtBuscarEjercicio.classList.remove("d-none");
        txtBuscarEjercicio.focus();
        txtBuscarEjercicio.addEventListener("input", (e) => {
            mostrarLista(e.target.value);
        });
    } else {
        txtBuscarEjercicio.classList.add("d-none");
        txtBuscarEjercicio.value = "";
        mostrarLista();
    }
});

// funcionalidad de coordinar rutinas por dia
const btnRutinasPorDia = document.getElementById("rutinas-por-dia");
btnRutinasPorDia.addEventListener("click", () => {
    ocultarTodo();
    document.getElementById("asignacion-rutina-dia-tab").classList.add("show", "active");
    cargarSelectRutinas();
});

const btnVolverAsignarRutinaDia = document.getElementById("volver-asignar-rutina-dia");
btnVolverAsignarRutinaDia.addEventListener("click", () => {
    ocultarTodo();
    document.getElementById("ver-rutinas").classList.add("show", "active");
    document.getElementById("ver-rutinas-tab").classList.add("active");
});

    // funcion para cargar los selects dentro de la pestaña de asignación de rutina por día
    const selectDias = ['rutina-lunes', 'rutina-martes', 'rutina-miercoles', 'rutina-jueves', 'rutina-viernes', 'rutina-sabado', 'rutina-domingo'];

    function cargarSelectRutinas () {
        selectDias.forEach(dia => {
            const select = document.getElementById(dia);
            select.innerHTML = "";
            const titulo = document.createElement("option");
            titulo.value = "";
            titulo.textContent = "Seleccione una rutina";
            titulo.disabled = true;
            titulo.selected = true;
            select.appendChild(titulo);
            
            sistema.rutinas.forEach(rutina => {
                const opcion = document.createElement("option");
                opcion.value = rutina.nombre;
                opcion.textContent = rutina.nombre;
                select.appendChild(opcion);
            });
            const ninguna = document.createElement("option");
            ninguna.value = "";
            ninguna.textContent = "Ninguna";
            select.appendChild(ninguna);
        });

        // guardar asignacion de las rutinas por dia
        const btnGuardarAsignacion = document.getElementById("guardar-asignacion-rutinas");
        btnGuardarAsignacion.addEventListener("click", () => {
            const lunes = document.getElementById("rutina-lunes").value;
            const martes = document.getElementById("rutina-martes").value;
            const miercoles = document.getElementById("rutina-miercoles").value;
            const jueves = document.getElementById("rutina-jueves").value;
            const viernes = document.getElementById("rutina-viernes").value;
            const sabado = document.getElementById("rutina-sabado").value;
            const domingo = document.getElementById("rutina-domingo").value;
            sistema.asignarRutinaADia("lunes", lunes);
            sistema.asignarRutinaADia("martes", martes);
            sistema.asignarRutinaADia("miercoles", miercoles);
            sistema.asignarRutinaADia("jueves", jueves);
            sistema.asignarRutinaADia("viernes", viernes);
            sistema.asignarRutinaADia("sabado", sabado);
            sistema.asignarRutinaADia("domingo", domingo);
            guardarSistema();
            ocultarTodo();
            // alert para avisar que se guardo correctamente
            alert("Asignación de rutinas por día guardada correctamente.");

             document.getElementById("ver-rutinas").classList.add("show", "active");
             document.getElementById("ver-rutinas-tab").classList.add("active");
             cargarRutinaDeHoy(rutinaDeHoy());
            
        });
    }
    
//funcionalidad para actualizar el dia de hoy 

    function actualizarDia () {
        let dia = new Date();
        diaHoy = dia.getDay();
        console.log(diaHoy);
    }

    function rutinaDeHoy () {
        
        if (diaHoy === 0) {
            return sistema.domingo.rutina;
        } else if (diaHoy === 1) {
            return sistema.lunes.rutina;
        } else if (diaHoy === 2) {
            return sistema.martes.rutina;
        } else if (diaHoy === 3) {
            return sistema.miercoles.rutina;
        } else if (diaHoy === 4) {
            return sistema.jueves.rutina;
        } else if (diaHoy === 5) {
            return sistema.viernes.rutina;
        } else if (diaHoy === 6) {
            return sistema.sabado.rutina;
        }
    }

    // funcion para cargar la rutina de hoy en la pestana de ver rutinas
    function cargarRutinaDeHoy (rutina) {
        const rutinaHoy = document.getElementById("rutina-de-hoy");
        if (rutina === null) {
            rutinaHoy.innerHTML ="";
            return;
        };
     
        console.log("-----------------------");
        console.log(rutina);  
       
        rutinaHoy.innerHTML = "";
       
        const card = document.createElement("div");
        card.className = "card shadow-sm rounded-3 mb-4";
        const cardHeader = document.createElement("div");
        cardHeader.className = "card-header bg-primary text-white text-center shadow-sm";
        cardHeader.textContent = "Rutina de Hoy";
        card.appendChild(cardHeader);
        const cardBody = document.createElement("div");
        cardBody.className = "card-body text-center";
        const cardTitle = document.createElement("h5");
        cardTitle.className = "card-title";
        cardTitle.textContent = rutina.nombre;
        cardBody.appendChild(cardTitle);
        card.appendChild(cardBody);
        card.style.cursor = "pointer";
        card.addEventListener("mouseenter", () => {
            card.classList.add("border-primary", "shadow");
        });
        card.addEventListener("mouseleave", () => {
            card.classList.remove("border-primary", "shadow");
        });
        card.addEventListener("click", () => {
            ocultarTodo();
            document.getElementById("detalle-rutina").classList.add("show", "active");
            document.getElementById("ver-rutinas-tab").classList.remove("active");
            document.getElementById("detalle-rutina-nombre").textContent = rutina.nombre;
            const ul = document.getElementById("detalle-rutina-ejercicios");
            ul.innerHTML = "";
            rutina.ejercicios.forEach(ej => {
                const li = document.createElement("li");
                li.className = "list-group-item";
                li.textContent = ej.nombre;
                ul.appendChild(li);
            });
        });
        rutinaHoy.appendChild(card);
    }

    function cargarEjerciciosExtra() {
    const listaDias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const dia = listaDias[diaHoy]

    const div = document.getElementById('ejercicios-extras-rutina-activa')
    
    let ejerciciosExtra = sistema[dia].ejerciciosExtras;
    if (!ejerciciosExtra || ejerciciosExtra.length === 0) {
        return;
    }

    
    let html = `<hr class="my-4 border-3 border-dark">`;
    html += `<h5 class="mt-3">Ejercicios Extra</h5>`;

    ejerciciosExtra.forEach((ej, ejIdx) => {
        html += `<div class='mb-3' id='ejercicio-extra-${ejIdx}'>`;
        html += `<h6>${ej.nombre}</h6>`;

        // Notas
        html += `<ul class="list-group list-group-flush mb-3" id="lista-nota-extra-${ejIdx}">`;
        ej.notas.forEach((nota, idxNota) => {
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${nota}
                    <button class="btn btn-danger btn-sm" id="btn-borrar-nota-extra-${ejIdx}-${idxNota}">x</button>
                </li>
            `;
        });
        html += `</ul>`;

        // Última sesión
        let ultimaSesion = null;
        if (ej.sesion && ej.sesion.length > 0) {
            ultimaSesion = ej.sesion[ej.sesion.length - 1];
        }

        if (ultimaSesion && ultimaSesion.series && ultimaSesion.series.length > 0) {
            html += `<table class='table table-sm'><thead><tr class="text-center"><th>Serie</th><th>Anterior</th><th>Peso</th><th>Reps</th></tr></thead><tbody>`;

            ultimaSesion.series.forEach((serie, idx) => {
                html += `<tr class="text-center">`;
                html += `<td>${idx + 1}</td>`;
                html += `<td>${serie.peso} x ${serie.repeticiones}</td>`;
                html += `<td><input type="number" inputmode="numeric" class="form-control form-control-sm text-center peso-extra-input" data-ejidx="${ejIdx}" data-serieidx="${idx}" value="${serie.peso}"></td>`;
                html += `<td><input type="number" inputmode="numeric" class="form-control form-control-sm text-center reps-extra-input" data-ejidx="${ejIdx}" data-serieidx="${idx}" placeholder="Reps hoy"></td>`;
                html += `</tr>`;
            });

            html += `</tbody></table>`;
            html += `<div class='text-muted small'>Fecha previa: ${ultimaSesion.fecha || 'Sin fecha'}</div>`;
        }

        // Botón y formulario para agregar serie
        html += `<button class='btn btn-outline-primary btn-sm mb-2 w-100' id='btn-toggle-agregar-extra-${ejIdx}'>Agregar serie</button>`;
        html += `
            <div id='agregar-extra-form-${ejIdx}' style='display:none;'>
                <div class='input-group input-group-sm mb-2' style='max-width:350px;'>
                    <input type='number' min='0' class='form-control' placeholder='Peso' id='input-peso-extra-${ejIdx}'>
                    <input type='number' min='1' class='form-control' placeholder='Reps' id='input-reps-extra-${ejIdx}'>
                    <button class='btn btn-success' id='btn-agregar-extra-nueva-${ejIdx}'>Guardar</button>
                    <button class='btn btn-secondary' id='btn-cerrar-extra-form-${ejIdx}'>Cerrar</button>
                </div>
            </div>
        `;

        html += `</div>`;
    });

    div.innerHTML += html;

    // --- Eventos borrar nota ---
    ejerciciosExtra.forEach((ej, ejIdx) => {
        ej.notas.forEach((nota, idxNota) => {
            const btn = document.getElementById(`btn-borrar-nota-extra-${ejIdx}-${idxNota}`);
            if (btn) {
                btn.addEventListener('click', () => {
                    ejerciciosExtra[ejIdx].notas.splice(idxNota, 1);
                    guardarSistema();
                    cargarEjerciciosExtra();
                });
            }
        });
    });

    // --- Guardar cambios peso/reps ---
    div.querySelectorAll('.peso-extra-input, .reps-extra-input').forEach(input => {
        input.addEventListener('change', function () {
            const ejIdx = parseInt(this.getAttribute('data-ejidx'));
            const serieIdx = parseInt(this.getAttribute('data-serieidx'));
            const ej = ejerciciosExtra[ejIdx];

            const hoy = new Date().toISOString().slice(0, 10);
            let sesionHoy = ej.sesion && ej.sesion.find(s => s.fecha === hoy);
            if (!sesionHoy) {
                sesionHoy = new Sesion(hoy);
                ej.sesion = ej.sesion || [];
                ej.sesion.push(sesionHoy);
            }

            if (!sesionHoy.series[serieIdx]) {
                sesionHoy.series[serieIdx] = { peso: 0, repeticiones: 0 };
            }

            const pesoHoy = parseFloat(div.querySelector(`.peso-extra-input[data-ejidx='${ejIdx}'][data-serieidx='${serieIdx}']`).value) || 0;
            const repsHoy = parseInt(div.querySelector(`.reps-extra-input[data-ejidx='${ejIdx}'][data-serieidx='${serieIdx}']`).value) || 0;

            sesionHoy.series[serieIdx].peso = pesoHoy;
            sesionHoy.series[serieIdx].repeticiones = repsHoy;

            guardarSistema();
        });
    });

    // --- Toggle agregar serie ---
    ejerciciosExtra.forEach((ej, ejIdx) => {
        const btnToggle = document.getElementById(`btn-toggle-agregar-extra-${ejIdx}`);
        const formDiv = document.getElementById(`agregar-extra-form-${ejIdx}`);
        btnToggle.addEventListener('click', () => {
            formDiv.style.display = formDiv.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById(`btn-cerrar-extra-form-${ejIdx}`).addEventListener('click', () => {
            formDiv.style.display = 'none';
        });

        document.getElementById(`btn-agregar-extra-nueva-${ejIdx}`).addEventListener('click', () => {
            const peso = parseFloat(document.getElementById(`input-peso-extra-${ejIdx}`).value);
            const reps = parseInt(document.getElementById(`input-reps-extra-${ejIdx}`).value);

            if (isNaN(peso) || isNaN(reps) || reps < 1) {
                alert('Completa peso y repeticiones válidos.');
                return;
            }

            const hoy = new Date().toISOString().slice(0, 10);
            let sesionHoy = ej.sesion && ej.sesion.find(s => s.fecha === hoy);
            if (!sesionHoy) {
                sesionHoy = new Sesion(hoy);
                ej.sesion = ej.sesion || [];
                ej.sesion.push(sesionHoy);
            }

            sesionHoy.series.push({ peso, repeticiones: reps });
            guardarSistema();

            document.getElementById(`input-peso-extra-${ejIdx}`).value = '';
            document.getElementById(`input-reps-extra-${ejIdx}`).value = '';
            formDiv.style.display = 'none';

            cargarEjerciciosExtra();
        });
    });
}


