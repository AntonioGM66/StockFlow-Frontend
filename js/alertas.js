const tablaAlertas = document.getElementById('tablaAlertas');

async function cargarAlertas() {
    try {
        const respuesta = await fetch('http://localhost:4000/inventario/alertas');
        const alertas = await respuesta.json();
        tablaAlertas.innerHTML = '';

        if (alertas.length === 0) {
            tablaAlertas.innerHTML = '<tr><td colspan="4">No hay productos con stock crítico</td></tr>';
            return;
        }

        alertas.forEach((alerta) => {
            const fila = document.createElement('tr');
            [alerta.nombre, alerta.stock_actual, alerta.stock_minimo, alerta.alerta]
                .forEach((valor) => {
                    const td = document.createElement('td');
                    td.textContent = valor;
                    fila.appendChild(td);
                });
            tablaAlertas.appendChild(fila);
        });
    } catch {
        tablaAlertas.innerHTML = '<tr><td colspan="4">No se pudieron cargar las alertas</td></tr>';
    }
}

cargarAlertas();
