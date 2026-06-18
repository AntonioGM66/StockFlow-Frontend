const API_MERMA = 'http://localhost:4000/inventario';
const productoMerma = document.getElementById('productoMerma');
const tablaMermas = document.getElementById('tablaMermas');
const mensajeMerma = document.getElementById('mensajeMerma');
let productosMerma = [];

function llenarProductosMerma(filtro = '') {
    const texto = filtro.trim().toLowerCase();
    productoMerma.innerHTML = '<option value="">Seleccione un producto</option>';
    productosMerma
        .filter((p) => !texto || p.nombre.toLowerCase().includes(texto) || p.codigo_barras.includes(texto))
        .forEach((p) => productoMerma.add(new Option(p.nombre, p.id_producto)));
}

function actualizarStock() {
    const producto = productosMerma.find((p) => p.id_producto === Number(productoMerma.value));
    document.getElementById('stockActualMerma').value = producto?.stock_actual ?? '';
}

async function cargarMerma() {
    const [catalogos, historial] = await Promise.all([
        fetch(`${API_MERMA}/catalogos`).then((r) => r.json()),
        fetch(`${API_MERMA}/ajustes`).then((r) => r.json())
    ]);
    productosMerma = catalogos.productos;
    llenarProductosMerma();
    tablaMermas.innerHTML = historial.length ? '' : '<tr><td colspan="4">No hay ajustes registrados</td></tr>';
    historial.forEach((ajuste) => {
        const fila = document.createElement('tr');
        [new Date(ajuste.fecha_movimiento).toLocaleDateString('es-MX'), ajuste.producto, ajuste.cantidad, ajuste.motivo]
            .forEach((v) => { const td = document.createElement('td'); td.textContent = v; fila.appendChild(td); });
        tablaMermas.appendChild(fila);
    });
}

productoMerma.addEventListener('change', actualizarStock);
document.getElementById('btnBuscarMerma').addEventListener('click', () => {
    llenarProductosMerma(document.getElementById('buscarMerma').value);
    actualizarStock();
});

document.getElementById('mermaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const sesion = JSON.parse(sessionStorage.getItem('stockflow_sesion') || 'null');
    const motivo = document.getElementById('motivoMerma').value;
    const observaciones = document.getElementById('observacionesMerma').value.trim();
    const respuesta = await fetch(`${API_MERMA}/ajustes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            idProducto: productoMerma.value,
            tipo: 'Salida',
            cantidad: document.getElementById('cantidadMerma').value,
            motivo: observaciones ? `${motivo}: ${observaciones}` : motivo,
            idUsuario: sesion?.id
        })
    });
    const resultado = await respuesta.json();
    mensajeMerma.textContent = resultado.message;
    mensajeMerma.style.color = respuesta.ok ? 'green' : 'red';
    if (respuesta.ok) {
        e.target.reset();
        document.getElementById('stockActualMerma').value = '';
        await cargarMerma();
    }
});

cargarMerma().catch(() => {
    mensajeMerma.textContent = 'No se pudieron cargar los datos';
    mensajeMerma.style.color = 'red';
});
