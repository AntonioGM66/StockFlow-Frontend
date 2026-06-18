const API = 'http://localhost:4000/inventario';
const productoEntrada = document.getElementById('productoEntrada');
const proveedorEntrada = document.getElementById('proveedorEntrada');
const tablaEntradas = document.getElementById('tablaEntradas');
const mensajeEntrada = document.getElementById('mensajeEntrada');
let productosEntrada = [];

function sesion() {
    return JSON.parse(sessionStorage.getItem('stockflow_sesion') || 'null');
}

function llenarProductos(filtro = '') {
    const texto = filtro.trim().toLowerCase();
    productoEntrada.innerHTML = '<option value="">Seleccione un producto</option>';
    productosEntrada
        .filter((p) => !texto || p.nombre.toLowerCase().includes(texto) || p.codigo_barras.includes(texto))
        .forEach((p) => productoEntrada.add(new Option(p.nombre, p.id_producto)));
}

async function cargarDatos() {
    const [catalogos, historial] = await Promise.all([
        fetch(`${API}/catalogos`).then((r) => r.json()),
        fetch(`${API}/entradas`).then((r) => r.json())
    ]);
    productosEntrada = catalogos.productos;
    llenarProductos();
    proveedorEntrada.innerHTML = '<option value="">Seleccione un proveedor</option>';
    catalogos.proveedores.forEach((p) => proveedorEntrada.add(new Option(p.razon_social, p.id_proveedor)));

    tablaEntradas.innerHTML = historial.length ? '' : '<tr><td colspan="5">No hay entradas registradas</td></tr>';
    historial.forEach((entrada) => {
        const fila = document.createElement('tr');
        [
            new Date(entrada.fecha_entrada).toLocaleDateString('es-MX'),
            entrada.producto,
            entrada.proveedor,
            entrada.cantidad,
            `$${Number(entrada.subtotal).toFixed(2)}`
        ].forEach((v) => {
            const td = document.createElement('td'); td.textContent = v; fila.appendChild(td);
        });
        tablaEntradas.appendChild(fila);
    });
}

document.getElementById('btnBuscarEntrada').addEventListener('click', () => {
    llenarProductos(document.getElementById('buscarEntrada').value);
});

document.getElementById('entradaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const respuesta = await fetch(`${API}/entradas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            idProveedor: proveedorEntrada.value,
            idUsuario: sesion()?.id,
            detalles: [{
                idProducto: productoEntrada.value,
                cantidad: document.getElementById('cantidadEntrada').value,
                costoUnitario: document.getElementById('costoEntrada').value
            }]
        })
    });
    const resultado = await respuesta.json();
    mensajeEntrada.textContent = resultado.message;
    mensajeEntrada.style.color = respuesta.ok ? 'green' : 'red';
    if (respuesta.ok) {
        e.target.reset();
        await cargarDatos();
    }
});

cargarDatos().catch(() => {
    mensajeEntrada.textContent = 'No se pudieron cargar los datos';
    mensajeEntrada.style.color = 'red';
});
