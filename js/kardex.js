const API_KARDEX = 'http://localhost:4000/inventario';
const productoKardex = document.getElementById('productoKardex');
const tablaKardex = document.getElementById('tablaKardex');
let productosKardex = [];

function llenarKardex(filtro = '') {
    const texto = filtro.trim().toLowerCase();
    productoKardex.innerHTML = '<option value="">Todos los productos</option>';
    productosKardex
        .filter((p) => !texto || p.nombre.toLowerCase().includes(texto) || p.codigo_barras.includes(texto))
        .forEach((p) => productoKardex.add(new Option(p.nombre, p.id_producto)));
}

async function consultarKardex() {
    const params = new URLSearchParams();
    if (productoKardex.value) params.set('idProducto', productoKardex.value);
    if (document.getElementById('fechaInicio').value) params.set('fechaInicio', document.getElementById('fechaInicio').value);
    if (document.getElementById('fechaFin').value) params.set('fechaFin', document.getElementById('fechaFin').value);

    const movimientos = await fetch(`${API_KARDEX}/kardex?${params}`).then((r) => r.json());
    tablaKardex.innerHTML = movimientos.length ? '' : '<tr><td colspan="6">No hay movimientos registrados</td></tr>';
    movimientos.forEach((m) => {
        const signo = String(m.tipo_movimiento).toLowerCase().includes('salida') ? '-' : '+';
        const fila = document.createElement('tr');
        [
            new Date(m.fecha_movimiento).toLocaleDateString('es-MX'),
            m.producto, m.tipo_movimiento, `${signo}${m.cantidad}`, m.usuario, m.stock_resultante
        ].forEach((v) => { const td = document.createElement('td'); td.textContent = v; fila.appendChild(td); });
        tablaKardex.appendChild(fila);
    });
}

document.getElementById('btnBuscarKardex').addEventListener('click', () => llenarKardex(document.getElementById('buscarKardex').value));
document.getElementById('btnConsultarKardex').addEventListener('click', consultarKardex);

fetch(`${API_KARDEX}/catalogos`).then((r) => r.json()).then((datos) => {
    productosKardex = datos.productos;
    llenarKardex();
    return consultarKardex();
}).catch(() => {
    tablaKardex.innerHTML = '<tr><td colspan="6">No se pudo cargar el Kardex</td></tr>';
});
