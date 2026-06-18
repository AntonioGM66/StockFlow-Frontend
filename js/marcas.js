const API_MARCAS = 'http://localhost:4000/marcas';

const marcaForm = document.getElementById('marcaForm');
const nombreMarca = document.getElementById('nombreMarca');
const descripcionMarca = document.getElementById('descripcionMarca');
const mensajeMarca = document.getElementById('mensajeMarca');
const tablaMarcas = document.getElementById('tablaMarcas');
const btnGuardarMarca = document.getElementById('btnGuardarMarca');
const btnCancelarMarca = document.getElementById('btnCancelarMarca');

let marcaEditandoId = null;

function mostrarMensaje(mensaje, color) {
    mensajeMarca.textContent = mensaje;
    mensajeMarca.style.color = color;
}

function limpiarFormulario() {
    marcaForm.reset();
    marcaEditandoId = null;
    btnGuardarMarca.textContent = 'Guardar';
}

function crearCelda(texto) {
    const celda = document.createElement('td');
    celda.textContent = texto ?? '';
    return celda;
}

function crearBoton(texto, accion) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.textContent = texto;
    boton.addEventListener('click', accion);
    return boton;
}

async function obtenerRespuesta(respuesta) {
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(resultado.message || 'No fue posible completar la operación');
    }

    return resultado;
}

async function cargarMarcas() {
    tablaMarcas.innerHTML = '';
    const filaCarga = document.createElement('tr');
    const celdaCarga = crearCelda('Cargando marcas...');
    celdaCarga.colSpan = 5;
    filaCarga.appendChild(celdaCarga);
    tablaMarcas.appendChild(filaCarga);

    try {
        const respuesta = await fetch(API_MARCAS);
        const marcas = await obtenerRespuesta(respuesta);

        tablaMarcas.innerHTML = '';

        if (marcas.length === 0) {
            const filaVacia = document.createElement('tr');
            const celdaVacia = crearCelda('No hay marcas registradas');
            celdaVacia.colSpan = 5;
            filaVacia.appendChild(celdaVacia);
            tablaMarcas.appendChild(filaVacia);
            return;
        }

        marcas.forEach((marca) => {
            const fila = document.createElement('tr');
            const acciones = document.createElement('td');

            fila.appendChild(crearCelda(marca.id_marca));
            fila.appendChild(crearCelda(marca.nombre));
            fila.appendChild(crearCelda(marca.descripcion));
            fila.appendChild(crearCelda(marca.estado));

            acciones.appendChild(crearBoton('Editar', () => editarMarca(marca)));
            acciones.appendChild(crearBoton(
                marca.estado === 'Activo' ? 'Desactivar' : 'Activar',
                () => cambiarEstadoMarca(marca)
            ));

            fila.appendChild(acciones);
            tablaMarcas.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar marcas:', error);
        tablaMarcas.innerHTML = '';
        const filaError = document.createElement('tr');
        const celdaError = crearCelda('No se pudieron cargar las marcas');
        celdaError.colSpan = 5;
        filaError.appendChild(celdaError);
        tablaMarcas.appendChild(filaError);
        mostrarMensaje(error.message, 'red');
    }
}

marcaForm.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const marca = {
        nombre: nombreMarca.value.trim(),
        descripcion: descripcionMarca.value.trim()
    };

    if (!marca.nombre) {
        mostrarMensaje('El nombre de la marca es obligatorio', 'red');
        nombreMarca.focus();
        return;
    }

    const editando = marcaEditandoId !== null;
    const url = editando ? `${API_MARCAS}/${marcaEditandoId}` : API_MARCAS;

    btnGuardarMarca.disabled = true;

    try {
        const respuesta = await fetch(url, {
            method: editando ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(marca)
        });

        const resultado = await obtenerRespuesta(respuesta);
        limpiarFormulario();
        mostrarMensaje(resultado.message, 'green');
        await cargarMarcas();
    } catch (error) {
        console.error('Error al guardar marca:', error);
        mostrarMensaje(error.message, 'red');
    } finally {
        btnGuardarMarca.disabled = false;
    }
});

function editarMarca(marca) {
    nombreMarca.value = marca.nombre;
    descripcionMarca.value = marca.descripcion || '';
    marcaEditandoId = marca.id_marca;
    btnGuardarMarca.textContent = 'Actualizar';
    mostrarMensaje('Editando marca seleccionada', 'blue');
    nombreMarca.focus();
}

async function cambiarEstadoMarca(marca) {
    const accion = marca.estado === 'Activo' ? 'desactivar' : 'activar';

    if (!confirm(`¿Deseas ${accion} la marca "${marca.nombre}"?`)) {
        return;
    }

    try {
        const respuesta = await fetch(
            `${API_MARCAS}/${marca.id_marca}/estado`,
            { method: 'PUT' }
        );

        const resultado = await obtenerRespuesta(respuesta);
        mostrarMensaje(resultado.message, 'green');

        if (marcaEditandoId === marca.id_marca) {
            limpiarFormulario();
        }

        await cargarMarcas();
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        mostrarMensaje(error.message, 'red');
    }
}

btnCancelarMarca.addEventListener('click', () => {
    limpiarFormulario();
    mostrarMensaje('', '');
});

cargarMarcas();
