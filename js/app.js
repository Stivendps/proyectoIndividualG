const tareas = JSON.parse(localStorage.getItem("tareas")) || [];
let tareaEditando = null;
let tarjetaActiva = null;

const titulo = document.querySelector("#titulo");
const descripcion = document.querySelector("#descripcion");
const estado = document.querySelector("#estado");
const asignado = document.querySelector("#asignado");
const fecha = document.querySelector("#fecha");
const lista = document.querySelector("#listaTareas");
const btnAgregar = document.querySelector("#btnAgregar");

btnAgregar.addEventListener("click", agregarTarea);

function obtenerPrioridad(estado) {
    switch (estado) {
        case "1":
            return '<span class="prioridad prioridad-1"></span>';
        case "2":
            return '<span class="prioridad prioridad-2">!!</span>';
        case "3":
            return '<span class="prioridad prioridad-3">!!!</span>';
        default:
            return '<span class="prioridad prioridad-1">!</span>';
    }
}
// visualizacion de la tarjeta
function crearTarjeta(tarea){
    const card = document.createElement("div");
    card.className = "task-card";
    card.innerHTML = `
        <input
            class="form-check-input completar"
            type="checkbox"
            data-id="${tarea.id}"
            ${tarea.completada ? "checked" : ""}>

        <div class="task-content">
            <h5>${tarea.titulo}</h5>
            <div class="task-info">
                <span>
                    <i class="bi bi-calendar-event"></i>
                    ${tarea.fecha}
                </span>
                <span>
                    <i class="bi bi-person"></i>
                    ${tarea.asignado}
                </span>
            </div>
            <p class="task-description">
                ${tarea.descripcion}
            </p>
        </div>

        <div class="task-actions">
            <button
                class="btn-icon editar"
                data-id="${tarea.id}">
                <i class="bi bi-pencil"></i>
            </button>
            <button
                class="btn-icon eliminar"
                data-id="${tarea.id}">
                <i class="bi bi-trash-fill"></i>
            </button>
        </div>
                <span class="prioridad prioridad-${tarea.estado}">
            ${obtenerPrioridad(tarea.estado)}
        </span>
    `;
    return card;
}

function agregarTarjeta(tarea) {
    const tarjeta = crearTarjeta(tarea);
    lista.appendChild(tarjeta);
}

function renderizarTareas() {
    lista.innerHTML = "";
    tareas.forEach(agregarTarjeta);
    actualizarEstadisticas();
}

lista.addEventListener("click", (e) => {

    const btnEliminar = e.target.closest(".eliminar");
    if (btnEliminar) {
        eliminarTarea(Number(btnEliminar.dataset.id));
        return;
    }

    const card = e.target.closest(".task-card");

    if (!card ||
        e.target.closest(".editar") ||
        e.target.closest(".completar")) {
        return;
    }

    // Si la tarjeta ya está abierta, la cerramos
    if (card === tarjetaActiva) {
        card.classList.remove("active");
        tarjetaActiva = null;
        return;
    }

    // Cerramos la anterior si existe
    if (tarjetaActiva) {
        tarjetaActiva.classList.remove("active");
    }

    // Abrimos la nueva
    card.classList.add("active");
    tarjetaActiva = card;

});

lista.addEventListener("change", (e) => {
    if (!e.target.classList.contains("completar")) return;
    const id = Number(e.target.dataset.id);
    const tarea = tareas.find(t => t.id === id);
    tarea.completada = e.target.checked;
    guardarLocalStorage();
    actualizarEstadisticas();
});

function actualizarEstadisticas() {
    const total = tareas.length;
    const completadas = tareas.filter(tarea => tarea.completada).length;
    const pendientes = total - completadas;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const vencidas = tareas.filter(tarea => {
        if (tarea.completada) return false;
        const fecha = new Date(tarea.fecha);
        return fecha < hoy;
    }).length;

    document.querySelector("#totalTareas").textContent = total;
    document.querySelector("#pendientes").textContent = pendientes;
    document.querySelector("#completadas").textContent = completadas;
    document.querySelector("#vencidas").textContent = vencidas;
}

// funcion para el localstore

function guardarLocalStorage() {
    localStorage.setItem("tareas", JSON.stringify(tareas));
}

function eliminarTarea(id){
    const indice=tareas.findIndex(t=>t.id===id);
    if(indice!==-1){
        tareas.splice(indice,1);
        document
            .querySelector(`.eliminar[data-id="${id}"]`)
            .closest(".task-card")
            .remove();
        guardarLocalStorage();
        actualizarEstadisticas();
    }
}

function agregarTarea(e){
    e.preventDefault();

    if(titulo.value.trim() === ""){
        alert("Ingrese un título.");
        return;
    }

    const tarea = {
        id: Date.now(),
        titulo: titulo.value,
        descripcion: descripcion.value,
        estado: estado.value,
        asignado: asignado.value,
        fecha: fecha.value,
        completada: false
    };
    tareas.push(tarea);
    guardarLocalStorage();
    agregarTarjeta(tarea);
    actualizarEstadisticas();
    limpiarFormulario();
}

function limpiarFormulario(){
    titulo.value="";
    descripcion.value="";
    estado.value="1";
    asignado.selectedIndex=0;
    fecha.value="";
}

renderizarTareas();






