const API_INVENTARIO = 'http://localhost:4000/inventario';
const tablaInventario = document.getElementById('tablaInventario');

function celda(texto) {
    const td = document.createElement('td');
    td.textContent = texto ?? '';
    return td;
}

async function cargarInventario() {
    try {
        const [resumenRespuesta, catalogosRespuesta] = await Promise.all([
            fetch(`${API_INVENTARIO}/resumen`),
            fetch(`${API_INVENTARIO}/catalogos`)
        ]);
        const resumen = await resumenRespuesta.json();
        const catalogos = await catalogosRespuesta.json();

        document.getElementById('totalProductos').textContent = resumen.totalProductos;
        document.getElementById('totalUnidades').textContent = resumen.totalUnidades;
        document.getElementById('productosBajoStock').textContent = resumen.productosBajoStock;
        document.getElementById('productosAgotados').textContent = resumen.productosAgotados;

        tablaInventario.innerHTML = '';
        catalogos.productos.forEach((producto) => {
            const fila = document.createElement('tr');
            const estado = producto.stock_actual <= 0
                ? 'Agotado'
                : producto.stock_actual <= producto.stock_minimo
                    ? 'Stock bajo'
                    : 'Disponible';
            fila.appendChild(celda(producto.codigo_barras));
            fila.appendChild(celda(producto.nombre));
            fila.appendChild(celda(producto.stock_actual));
            fila.appendChild(celda(producto.stock_minimo));
            fila.appendChild(celda(estado));
            tablaInventario.appendChild(fila);
        });
    } catch (error) {
        tablaInventario.innerHTML = '<tr><td colspan="5">No se pudo cargar el inventario</td></tr>';
    }
}

cargarInventario();
