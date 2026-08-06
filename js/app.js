const tareas = JSON.parse(localStorage.getItem("tareas")) || [];
let tareaEditando = null;

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
            return '<span class="prioridad prioridad-1">!</span>';
        case "2":
            return '<span class="prioridad prioridad-2">!!</span>';
        case "3":
            return '<span class="prioridad prioridad-3">!!!</span>';
        default:
            return '<span class="prioridad prioridad-1">!</span>';
    }
}

function crearTarjeta(tarea){
    const card = document.createElement("div");

    card.className = "task-card";
    card.innerHTML = `
        <div class="task-header">
            <div class="task-title">
                <input
                class="form-check-input completar"
                type="checkbox"
                data-id="${tarea.id}"
                ${tarea.completada ? "checked" : ""}>
                ${obtenerPrioridad(tarea.estado)}
                <h5>${tarea.titulo}</h5>
            </div>
            <div class="task-actions">
                <button
                class="btn-icon editar"
                data-id="${tarea.id}">
                    <i class="bi bi-pen"></i>
                </button>
                <button
                class="btn-icon eliminar"
                data-id="${tarea.id}">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </div>
        </div>
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
    `;
    return card;
}

function renderizarTareas() {
    lista.innerHTML = "";
    tareas.forEach(tarea=>{
        const tarjeta = crearTarjeta(tarea);
        lista.appendChild(tarjeta);
    });
    agregarEventos();
    actualizarEstadisticas();
}

function agregarEventos(){
    document.querySelectorAll(".completar").forEach(check=>{
        check.addEventListener("change",()=>{
            const id = Number(check.dataset.id);
            const tarea = tareas.find(t=>t.id===id);
            tarea.completada = check.checked;
            guardarLocalStorage();
            renderizarTareas();
        });
    });

    document.querySelectorAll(".eliminar").forEach(btn=>{
        btn.addEventListener("click",()=>{
            eliminarTarea(Number(btn.dataset.id));
        });
    });

    document.querySelectorAll(".task-card").forEach(card => {

        card.addEventListener("click", (e) => {

            if (e.target.closest(".btn-icon") || e.target.closest(".completar")
            ) return;

            document.querySelectorAll(".task-card").forEach(c => {
                c.classList.remove("active");
            });
            card.classList.add("active");
        });

    });
}

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
        guardarLocalStorage();
        renderizarTareas();
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
    limpiarFormulario();
    renderizarTareas();
}

function limpiarFormulario(){
    titulo.value="";
    descripcion.value="";
    estado.value="1";
    asignado.selectedIndex=0;
    fecha.value="";
}

renderizarTareas();






