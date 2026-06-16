const API_DASHBOARD = 'http://localhost:4000/dashboard/resumen';

async function cargarDashboard() {
    try {
        const respuesta = await fetch(API_DASHBOARD);
        const datos = await respuesta.json();

        document.getElementById('totalProductos').textContent = datos.totalProductos;
        document.getElementById('ventasDia').textContent = `$${Number(datos.ventasDia).toFixed(2)}`;
        document.getElementById('productosBajoStock').textContent = datos.productosBajoStock;

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}

cargarDashboard();