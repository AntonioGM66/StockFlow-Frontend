const API_HISTORIAL = 'http://localhost:4000/ventas';
const tablaHistorial = document.getElementById('tablaHistorialVentas');
const modalDetalle = document.getElementById('modalDetalleVenta');
let ventaSeleccionada = null;

function sesionActual() {
    return JSON.parse(sessionStorage.getItem('stockflow_sesion') || 'null');
}

function mensaje(texto, color) {
    const elemento = document.getElementById('mensajeHistorial');
    elemento.textContent = texto;
    elemento.style.color = color;
}

async function cargarHistorial() {
    const params = new URLSearchParams();
    const inicio = document.getElementById('fechaInicioVenta').value;
    const fin = document.getElementById('fechaFinVenta').value;
    if (inicio) params.set('fechaInicio', inicio);
    if (fin) params.set('fechaFin', fin);

    try {
        const respuesta = await fetch(`${API_HISTORIAL}?${params}`);
        const ventas = await respuesta.json();
        tablaHistorial.innerHTML = '';

        if (ventas.length === 0) {
            tablaHistorial.innerHTML = '<tr><td colspan="6">No existen ventas para el periodo seleccionado</td></tr>';
            return;
        }

        ventas.forEach((venta) => {
            const fila = document.createElement('tr');
            [
                new Date(venta.fecha_venta).toLocaleDateString('es-MX'),
                venta.folio,
                `$${Number(venta.total).toFixed(2)}`,
                venta.productos,
                venta.estado
            ].forEach((valor) => {
                const td = document.createElement('td');
                td.textContent = valor;
                fila.appendChild(td);
            });
            const acciones = document.createElement('td');
            const ver = document.createElement('button');
            ver.type = 'button';
            ver.textContent = 'Ver detalle';
            ver.addEventListener('click', () => abrirDetalle(venta.id_venta));
            acciones.appendChild(ver);
            fila.appendChild(acciones);
            tablaHistorial.appendChild(fila);
        });
    } catch {
        mensaje('No se pudo cargar el historial', 'red');
    }
}

async function abrirDetalle(idVenta) {
    const respuesta = await fetch(`${API_HISTORIAL}/${idVenta}`);
    ventaSeleccionada = await respuesta.json();

    document.getElementById('resumenDetalleVenta').innerHTML = `
        <p>Folio: <strong>${ventaSeleccionada.folio}</strong></p>
        <p>Fecha: ${new Date(ventaSeleccionada.fecha_venta).toLocaleString('es-MX')}</p>
        <p>Total: <strong>$${Number(ventaSeleccionada.total).toFixed(2)}</strong></p>
        <p>Método: ${ventaSeleccionada.metodo_pago || ''}</p>
        <p>Estado: ${ventaSeleccionada.estado}</p>
    `;

    const tabla = document.getElementById('tablaDetalleVenta');
    tabla.innerHTML = '';
    ventaSeleccionada.detalles.forEach((detalle) => {
        const fila = document.createElement('tr');
        [
            detalle.producto,
            detalle.cantidad,
            `$${Number(detalle.precio_unitario).toFixed(2)}`,
            `$${Number(detalle.subtotal).toFixed(2)}`
        ].forEach((valor) => {
            const td = document.createElement('td'); td.textContent = valor; fila.appendChild(td);
        });
        tabla.appendChild(fila);
    });

    document.getElementById('btnMostrarCancelacion').disabled =
        ventaSeleccionada.estado === 'Cancelada';
    document.getElementById('formCancelarVenta').classList.add('oculto');
    modalDetalle.style.display = 'flex';
}

document.getElementById('btnBuscarHistorial').addEventListener('click', cargarHistorial);
document.getElementById('btnCerrarDetalle').addEventListener('click', () => {
    modalDetalle.style.display = 'none';
});
document.getElementById('btnMostrarCancelacion').addEventListener('click', () => {
    document.getElementById('formCancelarVenta').classList.remove('oculto');
});

document.getElementById('btnConfirmarCancelacion').addEventListener('click', async () => {
    if (!ventaSeleccionada || !confirm('La venta será cancelada y los productos volverán al inventario. ¿Deseas continuar?')) {
        return;
    }

    const respuesta = await fetch(`${API_HISTORIAL}/${ventaSeleccionada.id_venta}/cancelar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            idUsuario: sesionActual()?.id,
            motivo: document.getElementById('motivoCancelacion').value,
            observaciones: document.getElementById('observacionesCancelacion').value
        })
    });
    const resultado = await respuesta.json();
    const elemento = document.getElementById('mensajeDetalleVenta');
    elemento.textContent = resultado.message;
    elemento.style.color = respuesta.ok ? 'green' : 'red';

    if (respuesta.ok) {
        await cargarHistorial();
        await abrirDetalle(ventaSeleccionada.id_venta);
    }
});

document.getElementById('btnImprimirDetalle').addEventListener('click', () => window.print());

cargarHistorial();
