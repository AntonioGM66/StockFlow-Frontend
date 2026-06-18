const API_VENTAS = 'http://localhost:4000/ventas';
const productoVenta = document.getElementById('productoVenta');
const tablaVenta = document.getElementById('tablaVenta');
const mensajeVenta = document.getElementById('mensajeVenta');
const estadoCaja = document.getElementById('estadoCaja');
const modalPago = document.getElementById('modalPago');
const modalTicket = document.getElementById('modalTicket');

let productosDisponibles = [];
let productosVenta = [];
let cajaActiva = null;

function sesionActual() {
    return JSON.parse(sessionStorage.getItem('stockflow_sesion') || 'null');
}

function mostrarMensaje(elemento, mensaje, color) {
    elemento.textContent = mensaje;
    elemento.style.color = color;
}

function llenarProductos(filtro = '') {
    const texto = filtro.trim().toLowerCase();
    productoVenta.innerHTML = '<option value="">Seleccione un producto</option>';
    productosDisponibles
        .filter((p) => !texto ||
            p.nombre.toLowerCase().includes(texto) ||
            p.codigo_barras.toLowerCase().includes(texto) ||
            String(p.id_producto) === texto)
        .forEach((p) => {
            productoVenta.add(new Option(
                `${p.nombre} - $${Number(p.precio_venta).toFixed(2)}`,
                p.id_producto
            ));
        });
}

async function cargarEstado() {
    const respuesta = await fetch(`${API_VENTAS}/estado`);
    const datos = await respuesta.json();
    productosDisponibles = datos.productos;
    cajaActiva = datos.cajaActiva;
    llenarProductos();

    if (cajaActiva) {
        mostrarMensaje(estadoCaja, 'Caja abierta. Puede registrar ventas.', 'green');
    } else {
        mostrarMensaje(
            estadoCaja,
            'Caja cerrada: debe realizar la apertura antes de registrar ventas.',
            'red'
        );
    }
}

function actualizarExistencias() {
    const producto = productosDisponibles.find(
        (p) => p.id_producto === Number(productoVenta.value)
    );
    document.getElementById('existenciasVenta').value = producto?.stock_actual ?? '';
}

function totales() {
    const subtotal = productosVenta.reduce(
        (suma, item) => suma + item.cantidad * Number(item.precio_venta),
        0
    );
    const iva = subtotal * 0.16;
    return { subtotal, iva, total: subtotal + iva };
}

function renderizarVenta() {
    tablaVenta.innerHTML = '';

    if (productosVenta.length === 0) {
        tablaVenta.innerHTML = '<tr><td colspan="5">No hay productos agregados</td></tr>';
    } else {
        productosVenta.forEach((item, indice) => {
            const fila = document.createElement('tr');
            [
                item.nombre,
                item.cantidad,
                `$${Number(item.precio_venta).toFixed(2)}`,
                `$${(item.cantidad * Number(item.precio_venta)).toFixed(2)}`
            ].forEach((valor) => {
                const td = document.createElement('td');
                td.textContent = valor;
                fila.appendChild(td);
            });
            const acciones = document.createElement('td');
            const quitar = document.createElement('button');
            quitar.type = 'button';
            quitar.textContent = 'Quitar';
            quitar.addEventListener('click', () => {
                productosVenta.splice(indice, 1);
                renderizarVenta();
            });
            acciones.appendChild(quitar);
            fila.appendChild(acciones);
            tablaVenta.appendChild(fila);
        });
    }

    const calculo = totales();
    document.getElementById('subtotalVenta').textContent = `$${calculo.subtotal.toFixed(2)}`;
    document.getElementById('ivaVenta').textContent = `$${calculo.iva.toFixed(2)}`;
    document.getElementById('totalVenta').textContent = `$${calculo.total.toFixed(2)}`;
}

document.getElementById('btnBuscarVenta').addEventListener('click', () => {
    llenarProductos(document.getElementById('buscarVenta').value);
    actualizarExistencias();
});

productoVenta.addEventListener('change', actualizarExistencias);

document.getElementById('btnAgregarVenta').addEventListener('click', () => {
    const producto = productosDisponibles.find(
        (p) => p.id_producto === Number(productoVenta.value)
    );
    const cantidad = Number(document.getElementById('cantidadVenta').value);

    if (!producto || !Number.isInteger(cantidad) || cantidad <= 0) {
        mostrarMensaje(mensajeVenta, 'Selecciona un producto y una cantidad válida', 'red');
        return;
    }
    if (cantidad > Number(producto.stock_actual)) {
        mostrarMensaje(
            mensajeVenta,
            `Stock insuficiente. Solicitado: ${cantidad}. Disponible: ${producto.stock_actual}`,
            'red'
        );
        return;
    }
    if (productosVenta.some((item) => item.id_producto === producto.id_producto)) {
        mostrarMensaje(mensajeVenta, 'El producto ya está agregado a la venta', 'red');
        return;
    }

    productosVenta.push({ ...producto, cantidad });
    productoVenta.value = '';
    document.getElementById('cantidadVenta').value = 1;
    document.getElementById('existenciasVenta').value = '';
    mostrarMensaje(mensajeVenta, '', '');
    renderizarVenta();
});

document.getElementById('btnBorrarVenta').addEventListener('click', () => {
    productosVenta = [];
    renderizarVenta();
    mostrarMensaje(mensajeVenta, '', '');
});

document.getElementById('btnRegistrarVenta').addEventListener('click', () => {
    if (!cajaActiva) {
        mostrarMensaje(
            mensajeVenta,
            'Debe realizar la apertura de caja antes de iniciar ventas',
            'red'
        );
        return;
    }
    if (productosVenta.length === 0) {
        mostrarMensaje(mensajeVenta, 'Agrega al menos un producto', 'red');
        return;
    }

    document.getElementById('totalPago').textContent = `$${totales().total.toFixed(2)}`;
    modalPago.style.display = 'flex';
});

function actualizarMetodoPago() {
    const efectivo = document.getElementById('metodoPago').value === 'Efectivo';
    document.getElementById('campoEfectivo').classList.toggle('oculto', !efectivo);
    document.getElementById('campoReferencia').classList.toggle('oculto', efectivo);
    document.getElementById('labelReferencia').textContent =
        document.getElementById('metodoPago').value === 'Tarjeta'
            ? 'Referencia bancaria'
            : 'Folio de transferencia';
}

document.getElementById('metodoPago').addEventListener('change', actualizarMetodoPago);
document.getElementById('btnCancelarPago').addEventListener('click', () => {
    modalPago.style.display = 'none';
});

document.getElementById('btnCobrar').addEventListener('click', async () => {
    const boton = document.getElementById('btnCobrar');
    boton.disabled = true;

    try {
        const respuesta = await fetch(API_VENTAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idUsuario: sesionActual()?.id,
                productos: productosVenta.map((p) => ({
                    idProducto: p.id_producto,
                    cantidad: p.cantidad
                })),
                metodoPago: document.getElementById('metodoPago').value,
                dineroRecibido: document.getElementById('dineroRecibido').value,
                referencia: document.getElementById('referenciaPago').value
            })
        });
        const resultado = await respuesta.json();
        if (!respuesta.ok) throw new Error(resultado.message);

        modalPago.style.display = 'none';
        mostrarTicket(resultado.venta);
        productosVenta = [];
        renderizarVenta();
        await cargarEstado();
    } catch (error) {
        mostrarMensaje(document.getElementById('mensajePago'), error.message, 'red');
    } finally {
        boton.disabled = false;
    }
});

function mostrarTicket(venta) {
    const fecha = new Date(venta.fecha_venta);
    const lineas = venta.productos.map((p) =>
        `<tr><td>${p.nombre}</td><td>${p.cantidad}</td><td>$${p.subtotal.toFixed(2)}</td></tr>`
    ).join('');

    document.getElementById('contenidoTicket').innerHTML = `
        <p><strong>STOCKFLOW</strong></p>
        <p>Fecha: ${fecha.toLocaleDateString('es-MX')} ${fecha.toLocaleTimeString('es-MX')}</p>
        <p>Folio: ${venta.folio}</p>
        <table><tbody>${lineas}</tbody></table>
        <p>Subtotal: $${Number(venta.subtotal).toFixed(2)}</p>
        <p>IVA: $${Number(venta.iva).toFixed(2)}</p>
        <p><strong>Total: $${Number(venta.total).toFixed(2)}</strong></p>
        <p>Método de pago: ${venta.metodoPago}</p>
        ${venta.dineroRecibido !== null ? `<p>Recibido: $${venta.dineroRecibido.toFixed(2)}</p>` : ''}
        ${venta.dineroRecibido !== null ? `<p>Cambio: $${venta.cambio.toFixed(2)}</p>` : ''}
        <p>Gracias por su compra</p>
    `;
    modalTicket.style.display = 'flex';
}

document.getElementById('btnCerrarTicket').addEventListener('click', () => {
    modalTicket.style.display = 'none';
});
document.getElementById('btnImprimirTicket').addEventListener('click', () => window.print());

renderizarVenta();
cargarEstado().catch(() => {
    mostrarMensaje(estadoCaja, 'No se pudo consultar el estado de caja', 'red');
});
