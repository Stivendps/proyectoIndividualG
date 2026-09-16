const tareasIniciales = [
    {
        id: 1,
        titulo: "Revisar correos",
        descripcion: "Responder los mensajes importantes y revisar pendientes del día.",
        estado: "1",
        asignado: "Rhonald",
        fecha: "2026-09-15",
        completada: true
    },
    {
        id: 2,
        titulo: "Preparar reunión",
        descripcion: "Reunir agenda, materiales y orden del día para la reunión matutina.",
        estado: "2",
        asignado: "Carlos",
        fecha: "2026-09-16",
        completada: true
    },
    {
        id: 3,
        titulo: "Actualizar plan de trabajo",
        descripcion: "Organizar las tareas del sprint y revisar prioridades del equipo.",
        estado: "1",
        asignado: "Laura",
        fecha: "2026-09-17",
        completada: false
    },
    {
        id: 4,
        titulo: "Enviar reporte",
        descripcion: "Compilar avances semanales y compartir resumen final al grupo.",
        estado: "3",
        asignado: "María",
        fecha: "2026-09-18",
        completada: false
    }
];

let tareas = JSON.parse(localStorage.getItem("tareas"));

if (!tareas || tareas.length === 0) {
    tareas = tareasIniciales;
    localStorage.setItem("tareas", JSON.stringify(tareas));
}

let tareaEditando = null;
let tarjetaActiva = null;
let filtroActivo = "total";

const formulario = document.querySelector("form");
const titulo = document.querySelector("#titulo");
const descripcion = document.querySelector("#descripcion");
const estado = document.querySelector("#estado");
const asignado = document.querySelector("#asignado");
const fecha = document.querySelector("#fecha");
const lista = document.querySelector("#listaTareas");
const btnAgregar = document.querySelector("#btnAgregar");
const btnMobileAgregar = document.querySelector("#btnMobileAgregar");
const btnCerrarFormulario = document.querySelector("#btnCerrarFormulario");
const contactForm = document.querySelector(".contact-form");

function abrirFormularioMovil() {
    contactForm.classList.add("mobile-visible");
    titulo.focus();
}

function cerrarFormularioMovil() {
    contactForm.classList.remove("mobile-visible");
}

btnMobileAgregar.addEventListener("click", abrirFormularioMovil);
btnCerrarFormulario.addEventListener("click", cerrarFormularioMovil);

function escapar(texto = "") {
    const elemento = document.createElement("div");
    elemento.textContent = texto;
    return elemento.innerHTML;
}

function obtenerPrioridad(valor) {
    return valor === "3" ? "!!!" : valor === "2" ? "!!" : "!";
}

function crearTarjeta(tarea) {
    const card = document.createElement("div");
    card.className = `task-card ${tarea.completada ? "completada" : ""}`;
    card.dataset.id = tarea.id;

    card.innerHTML = `
        <input class="form-check-input completar" type="checkbox"
            data-id="${tarea.id}" ${tarea.completada ? "checked" : ""}>
        <div class="task-content">
            <h5>${escapar(tarea.titulo)}</h5>
            <div class="task-info">
                <span><i class="bi bi-calendar-event"></i>${escapar(tarea.fecha)}</span>
                <span><i class="bi bi-person"></i>${escapar(tarea.asignado)}</span>
            </div>
            <p class="task-description">${escapar(tarea.descripcion)}</p>
        </div>
        <div class="task-actions">
            <button class="btn-icon editar" type="button" data-id="${tarea.id}" title="Editar">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn-icon eliminar" type="button" data-id="${tarea.id}" title="Eliminar">
                <i class="bi bi-trash-fill"></i>
            </button>
        </div>
        <span class="prioridad prioridad-${tarea.estado}">${obtenerPrioridad(tarea.estado)}</span>`;

    return card;
}

function renderizarTareas() {
    lista.innerHTML = "";
    obtenerTareasFiltradas().forEach(tarea => {
        lista.appendChild(crearTarjeta(tarea));
    });
    actualizarEstadisticas();
    tarjetaActiva = null;
}

function obtenerTareasFiltradas() {
    if (filtroActivo === "total") return tareas;

    return tareas.filter(tarea => {
        if (filtroActivo === "pendientes") return !tarea.completada;
        if (filtroActivo === "completadas") return tarea.completada;
        if (filtroActivo === "vencidas") return estaVencida(tarea);
        return true;
    });
}

function estaVencida(tarea) {
    if (tarea.completada || !tarea.fecha) return false;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return new Date(`${tarea.fecha}T00:00:00`) < hoy;
}

lista.addEventListener("click", event => {
    const card = event.target.closest(".task-card");
    if (!card) return;

    const id = Number(card.dataset.id);
    const tarea = tareas.find(item => item.id === id);

    if (event.target.closest(".eliminar")) {
        eliminarTarea(id);
        return;
    }

    if (event.target.closest(".editar")) {
        editarTarea(tarea);
        return;
    }

    if (event.target.closest(".completar")) return;

    if (tareaEditando && tareaEditando.id !== id) {
        limpiarFormulario();
    }

    if (tarjetaActiva && tarjetaActiva !== card) {
        tarjetaActiva.classList.remove("active");
        tarjetaActiva.style.height = "";
    }

    card.classList.toggle("active");
    tarjetaActiva = card.classList.contains("active") ? card : null;

    if (tarjetaActiva) {
        requestAnimationFrame(() => {
            if (!card.classList.contains("active")) return;

            const detalle = card.querySelector(".task-description");
            const contenido = card.querySelector(".task-content");
            const alturaNecesaria = Math.max(
                detalle.scrollHeight,
                contenido.scrollHeight
            );

            card.style.height = `${Math.max(80, alturaNecesaria + 24)}px`;
        });
    } else {
        card.style.height = "";
    }
});

lista.addEventListener("change", event => {
    if (!event.target.classList.contains("completar")) return;

    const card = event.target.closest(".task-card");
    const tarea = tareas.find(item => item.id === Number(card.dataset.id));
    tarea.completada = event.target.checked;
    card.classList.toggle("completada", tarea.completada);
    guardarLocalStorage();
    renderizarTareas();
});

formulario.addEventListener("submit", event => {
    event.preventDefault();

    if (!titulo.value.trim() || !fecha.value || !descripcion.value.trim()) {
        mostrarAlerta("Se deben completar todos los campos.");
        return;
    }

    const datos = {
        titulo: titulo.value.trim(),
        descripcion: descripcion.value.trim(),
        estado: estado.value,
        asignado: asignado.value,
        fecha: fecha.value
    };

    if (tareaEditando) {
        Object.assign(tareaEditando, datos);
        tareaEditando = null;
        btnAgregar.textContent = "Agregar tarea";
    } else {
        tareas.push({ id: Date.now(), ...datos, completada: false });
    }

    guardarLocalStorage();
    limpiarFormulario();
    renderizarTareas();
    cerrarFormularioMovil();
});

function editarTarea(tarea) {
    tareaEditando = tarea;
    abrirFormularioMovil();
    titulo.value = tarea.titulo;
    descripcion.value = tarea.descripcion;
    estado.value = tarea.estado;
    asignado.value = tarea.asignado;
    fecha.value = tarea.fecha;
    btnAgregar.textContent = "Guardar cambios";
    titulo.scrollIntoView({ behavior: "smooth", block: "center" });
    titulo.focus();
}

function eliminarTarea(id) {
    tareas = tareas.filter(tarea => tarea.id !== id);
    if (tareaEditando && tareaEditando.id === id) limpiarFormulario();
    guardarLocalStorage();
    renderizarTareas();
}

function actualizarEstadisticas() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const completadas = tareas.filter(tarea => tarea.completada).length;
    const vencidas = tareas.filter(estaVencida).length;

    document.querySelector("#totalTareas").textContent = tareas.length;
    document.querySelector("#pendientes").textContent = tareas.length - completadas;
    document.querySelector("#completadas").textContent = completadas;
    document.querySelector("#vencidas").textContent = vencidas;
}

document.querySelectorAll(".card-stat").forEach((estadistica, indice) => {
    const filtros = ["total", "pendientes", "completadas", "vencidas"];
    estadistica.dataset.filtro = filtros[indice];
    estadistica.setAttribute("role", "button");
    estadistica.tabIndex = 0;

    const aplicarFiltro = () => {
        filtroActivo = estadistica.dataset.filtro;
        document.querySelectorAll(".card-stat").forEach(item => {
            item.classList.toggle("active", item === estadistica);
        });
        renderizarTareas();
    };

    estadistica.addEventListener("click", aplicarFiltro);
    estadistica.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            aplicarFiltro();
        }
    });
});

function guardarLocalStorage() {
    localStorage.setItem("tareas", JSON.stringify(tareas));
}

function limpiarFormulario() {
    formulario.reset();
    estado.value = "1";
    tareaEditando = null;
    btnAgregar.textContent = "Agregar tarea";
}

function mostrarAlerta(mensaje) {
    const alerta = document.querySelector("#alerta");
    document.querySelector("#mensaje").textContent = mensaje;
    alerta.classList.add("mostrar");
    setTimeout(() => alerta.classList.remove("mostrar"), 3000);
}

document.querySelectorAll(".tema").forEach(opcion => {
    opcion.addEventListener("click", () => {
        document.body.classList.remove("tema-morado", "tema-black", "tema-white", "tema-green");
        document.body.classList.add(`tema-${opcion.dataset.tema}`);
    });
});

renderizarTareas();
