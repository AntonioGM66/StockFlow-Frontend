const API_CATEGORIAS = 'http://localhost:4000/categorias';

const categoriaForm = document.getElementById('categoriaForm');
const nombreCategoria = document.getElementById('nombreCategoria');
const descripcionCategoria = document.getElementById('descripcionCategoria');
const mensajeCategoria = document.getElementById('mensajeCategoria');
const tablaCategorias = document.getElementById('tablaCategorias');
const btnGuardarCategoria = document.getElementById('btnGuardarCategoria');
const btnCancelarCategoria = document.getElementById('btnCancelarCategoria');

let categoriaEditandoId = null;

function mostrarMensaje(mensaje, color) {
    mensajeCategoria.textContent = mensaje;
    mensajeCategoria.style.color = color;
}

function limpiarFormulario() {
    categoriaForm.reset();
    categoriaEditandoId = null;
    btnGuardarCategoria.textContent = 'Guardar';
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

async function cargarCategorias() {
    tablaCategorias.innerHTML = '';
    const filaCarga = document.createElement('tr');
    const celdaCarga = crearCelda('Cargando categorías...');
    celdaCarga.colSpan = 5;
    filaCarga.appendChild(celdaCarga);
    tablaCategorias.appendChild(filaCarga);

    try {
        const respuesta = await fetch(API_CATEGORIAS);
        const categorias = await obtenerRespuesta(respuesta);

        tablaCategorias.innerHTML = '';

        if (categorias.length === 0) {
            const filaVacia = document.createElement('tr');
            const celdaVacia = crearCelda('No hay categorías registradas');
            celdaVacia.colSpan = 5;
            filaVacia.appendChild(celdaVacia);
            tablaCategorias.appendChild(filaVacia);
            return;
        }

        categorias.forEach((categoria) => {
            const fila = document.createElement('tr');
            const acciones = document.createElement('td');

            fila.appendChild(crearCelda(categoria.id_categoria));
            fila.appendChild(crearCelda(categoria.nombre));
            fila.appendChild(crearCelda(categoria.descripcion));
            fila.appendChild(crearCelda(categoria.estado));

            acciones.appendChild(crearBoton('Editar', () => editarCategoria(categoria)));
            acciones.appendChild(crearBoton(
                categoria.estado === 'Activo' ? 'Desactivar' : 'Activar',
                () => cambiarEstadoCategoria(categoria)
            ));

            fila.appendChild(acciones);
            tablaCategorias.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        tablaCategorias.innerHTML = '';
        const filaError = document.createElement('tr');
        const celdaError = crearCelda('No se pudieron cargar las categorías');
        celdaError.colSpan = 5;
        filaError.appendChild(celdaError);
        tablaCategorias.appendChild(filaError);
        mostrarMensaje(error.message, 'red');
    }
}

categoriaForm.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const categoria = {
        nombre: nombreCategoria.value.trim(),
        descripcion: descripcionCategoria.value.trim()
    };

    if (!categoria.nombre) {
        mostrarMensaje('El nombre de la categoría es obligatorio', 'red');
        nombreCategoria.focus();
        return;
    }

    const editando = categoriaEditandoId !== null;
    const url = editando
        ? `${API_CATEGORIAS}/${categoriaEditandoId}`
        : API_CATEGORIAS;

    btnGuardarCategoria.disabled = true;

    try {
        const respuesta = await fetch(url, {
            method: editando ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoria)
        });

        const resultado = await obtenerRespuesta(respuesta);
        limpiarFormulario();
        mostrarMensaje(resultado.message, 'green');
        await cargarCategorias();
    } catch (error) {
        console.error('Error al guardar categoría:', error);
        mostrarMensaje(error.message, 'red');
    } finally {
        btnGuardarCategoria.disabled = false;
    }
});

function editarCategoria(categoria) {
    nombreCategoria.value = categoria.nombre;
    descripcionCategoria.value = categoria.descripcion || '';
    categoriaEditandoId = categoria.id_categoria;
    btnGuardarCategoria.textContent = 'Actualizar';
    mostrarMensaje('Editando categoría seleccionada', 'blue');
    nombreCategoria.focus();
}

async function cambiarEstadoCategoria(categoria) {
    const accion = categoria.estado === 'Activo' ? 'desactivar' : 'activar';

    if (!confirm(`¿Deseas ${accion} la categoría "${categoria.nombre}"?`)) {
        return;
    }

    try {
        const respuesta = await fetch(
            `${API_CATEGORIAS}/${categoria.id_categoria}/estado`,
            { method: 'PUT' }
        );

        const resultado = await obtenerRespuesta(respuesta);
        mostrarMensaje(resultado.message, 'green');

        if (categoriaEditandoId === categoria.id_categoria) {
            limpiarFormulario();
        }

        await cargarCategorias();
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        mostrarMensaje(error.message, 'red');
    }
}

btnCancelarCategoria.addEventListener('click', () => {
    limpiarFormulario();
    mostrarMensaje('', '');
});

cargarCategorias();
