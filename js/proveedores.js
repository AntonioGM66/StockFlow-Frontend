const API_PROVEEDORES = 'http://localhost:4000/proveedores';

const proveedorForm = document.getElementById('proveedorForm');
const razonSocial = document.getElementById('razonSocial');
const rfc = document.getElementById('rfc');
const telefono = document.getElementById('telefono');
const correo = document.getElementById('correo');
const mensajeProveedor = document.getElementById('mensajeProveedor');
const tablaProveedores = document.getElementById('tablaProveedores');
const btnGuardarProveedor = document.getElementById('btnGuardarProveedor');
const btnCancelarProveedor = document.getElementById('btnCancelarProveedor');

let proveedorEditandoId = null;

function mostrarMensaje(mensaje, color) {
    mensajeProveedor.textContent = mensaje;
    mensajeProveedor.style.color = color;
}

function limpiarFormulario() {
    proveedorForm.reset();
    proveedorEditandoId = null;
    btnGuardarProveedor.textContent = 'Guardar';
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

async function cargarProveedores() {
    tablaProveedores.innerHTML = '';
    const filaCarga = document.createElement('tr');
    const celdaCarga = crearCelda('Cargando proveedores...');
    celdaCarga.colSpan = 7;
    filaCarga.appendChild(celdaCarga);
    tablaProveedores.appendChild(filaCarga);

    try {
        const respuesta = await fetch(API_PROVEEDORES);
        const proveedores = await obtenerRespuesta(respuesta);

        tablaProveedores.innerHTML = '';

        if (proveedores.length === 0) {
            const filaVacia = document.createElement('tr');
            const celdaVacia = crearCelda('No hay proveedores registrados');
            celdaVacia.colSpan = 7;
            filaVacia.appendChild(celdaVacia);
            tablaProveedores.appendChild(filaVacia);
            return;
        }

        proveedores.forEach((proveedor) => {
            const fila = document.createElement('tr');
            const acciones = document.createElement('td');

            fila.appendChild(crearCelda(proveedor.id_proveedor));
            fila.appendChild(crearCelda(proveedor.razon_social));
            fila.appendChild(crearCelda(proveedor.rfc_identificacion));
            fila.appendChild(crearCelda(proveedor.telefono));
            fila.appendChild(crearCelda(proveedor.correo_electronico));
            fila.appendChild(crearCelda(proveedor.estado));

            acciones.appendChild(crearBoton('Editar', () => editarProveedor(proveedor)));
            acciones.appendChild(crearBoton(
                proveedor.estado === 'Activo' ? 'Desactivar' : 'Activar',
                () => cambiarEstadoProveedor(proveedor)
            ));

            fila.appendChild(acciones);
            tablaProveedores.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar proveedores:', error);
        tablaProveedores.innerHTML = '';
        const filaError = document.createElement('tr');
        const celdaError = crearCelda('No se pudieron cargar los proveedores');
        celdaError.colSpan = 7;
        filaError.appendChild(celdaError);
        tablaProveedores.appendChild(filaError);
        mostrarMensaje(error.message, 'red');
    }
}

proveedorForm.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const proveedor = {
        razonSocial: razonSocial.value.trim(),
        rfc: rfc.value.trim(),
        telefono: telefono.value.trim(),
        correo: correo.value.trim()
    };

    if (!proveedor.razonSocial || !proveedor.rfc) {
        mostrarMensaje('La razón social y el RFC son obligatorios', 'red');
        return;
    }

    const editando = proveedorEditandoId !== null;
    const url = editando
        ? `${API_PROVEEDORES}/${proveedorEditandoId}`
        : API_PROVEEDORES;

    btnGuardarProveedor.disabled = true;

    try {
        const respuesta = await fetch(url, {
            method: editando ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proveedor)
        });

        const resultado = await obtenerRespuesta(respuesta);
        limpiarFormulario();
        mostrarMensaje(resultado.message, 'green');
        await cargarProveedores();
    } catch (error) {
        console.error('Error al guardar proveedor:', error);
        mostrarMensaje(error.message, 'red');
    } finally {
        btnGuardarProveedor.disabled = false;
    }
});

function editarProveedor(proveedor) {
    razonSocial.value = proveedor.razon_social || '';
    rfc.value = proveedor.rfc_identificacion || '';
    telefono.value = proveedor.telefono || '';
    correo.value = proveedor.correo_electronico || '';
    proveedorEditandoId = proveedor.id_proveedor;
    btnGuardarProveedor.textContent = 'Actualizar';
    mostrarMensaje('Editando proveedor seleccionado', 'blue');
    razonSocial.focus();
}

async function cambiarEstadoProveedor(proveedor) {
    const accion = proveedor.estado === 'Activo' ? 'desactivar' : 'activar';

    if (!confirm(`¿Deseas ${accion} el proveedor "${proveedor.razon_social}"?`)) {
        return;
    }

    try {
        const respuesta = await fetch(
            `${API_PROVEEDORES}/${proveedor.id_proveedor}/estado`,
            { method: 'PUT' }
        );

        const resultado = await obtenerRespuesta(respuesta);
        mostrarMensaje(resultado.message, 'green');

        if (proveedorEditandoId === proveedor.id_proveedor) {
            limpiarFormulario();
        }

        await cargarProveedores();
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        mostrarMensaje(error.message, 'red');
    }
}

btnCancelarProveedor.addEventListener('click', () => {
    limpiarFormulario();
    mostrarMensaje('', '');
});

cargarProveedores();
