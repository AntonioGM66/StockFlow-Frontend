const API_PRODUCTOS = 'http://localhost:4000/productos';
const API_CATEGORIAS = 'http://localhost:4000/categorias';
const API_MARCAS = 'http://localhost:4000/marcas';

const productoForm = document.getElementById('productoForm');
const categoriaSelect = document.getElementById('categoria');
const marcaSelect = document.getElementById('marca');
const mensajeProducto = document.getElementById('mensajeProducto');
const tablaProductos = document.getElementById('tablaProductos');
const buscarProducto = document.getElementById('buscarProducto');
const btnBuscarProducto = document.getElementById('btnBuscarProducto');
const btnLimpiarBusqueda = document.getElementById('btnLimpiarBusqueda');

let productoEditandoId = null;

async function cargarCategorias() {
    try {
        const respuesta = await fetch(API_CATEGORIAS);
        const categorias = await respuesta.json();

        categoriaSelect.innerHTML = '<option value="">Seleccione una categoria</option>';

        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id_categoria;
            option.textContent = categoria.nombre;
            categoriaSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar categorias:', error);
    }
}

async function cargarMarcas() {
    try {
        const respuesta = await fetch(API_MARCAS);
        const marcas = await respuesta.json();

        marcaSelect.innerHTML = '<option value="">Seleccione una marca</option>';

        marcas.forEach(marca => {
            const option = document.createElement('option');
            option.value = marca.id_marca;
            option.textContent = marca.nombre;
            marcaSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar marcas:', error);
    }
}

async function cargarProductos(busqueda = '') {
    try {
        let url = API_PRODUCTOS;

        if (busqueda !== '') {
            url = `${API_PRODUCTOS}?buscar=${encodeURIComponent(busqueda)}`;
        }

        const respuesta = await fetch(url);
        const productos = await respuesta.json();

        tablaProductos.innerHTML = '';

        productos.forEach(producto => {
            const fila = document.createElement('tr');

        fila.innerHTML = `
            <td>${producto.id_producto}</td>
            <td>${producto.codigo_barras}</td>
            <td>${producto.nombre}</td>
            <td>${producto.categoria}</td>
            <td>${producto.marca}</td>
            <td>$${producto.precio_venta}</td>
            <td>${producto.stock_actual}</td>
            <td>${producto.estado}</td>
            <td>
    <button type="button" onclick="editarProducto(${producto.id_producto})">
        Editar
    </button>

    <button type="button" onclick="cambiarEstadoProducto(${producto.id_producto}, '${producto.estado}')">
        ${producto.estado === 'Activo' ? 'Desactivar' : 'Activar'}
    </button>
</td>
        `;

            tablaProductos.appendChild(fila);
        });

    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

productoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const producto = {
        codigoBarras: document.getElementById('codigoBarras').value,
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        idCategoria: categoriaSelect.value,
        idMarca: marcaSelect.value,
        precioVenta: document.getElementById('precioVenta').value,
        stockActual: document.getElementById('stockActual').value,
        stockMinimo: document.getElementById('stockMinimo').value
    };

    try {
let url = API_PRODUCTOS;
let metodo = 'POST';

if (productoEditandoId !== null) {
    url = `${API_PRODUCTOS}/${productoEditandoId}`;
    metodo = 'PUT';
}

const respuesta = await fetch(url, {
    method: metodo,
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(producto)
});

        const resultado = await respuesta.json();

        if (resultado.success) {
mensajeProducto.textContent = productoEditandoId
    ? 'Producto actualizado correctamente'
    : 'Producto guardado correctamente';

mensajeProducto.style.color = 'green';

productoForm.reset();
productoEditandoId = null;

await cargarProductos();
        } else {
            mensajeProducto.textContent = resultado.message;
            mensajeProducto.style.color = 'red';
        }

    } catch (error) {
        mensajeProducto.textContent = 'Error de conexión con el servidor';
        mensajeProducto.style.color = 'red';
        console.error('Error al guardar producto:', error);
    }
});

cargarCategorias();
cargarMarcas();
cargarProductos();

btnBuscarProducto.addEventListener('click', () => {
    cargarProductos(buscarProducto.value);
});

btnLimpiarBusqueda.addEventListener('click', () => {
    buscarProducto.value = '';
    cargarProductos();
});

// Función para cargar los datos del producto en el formulario para su edición
async function editarProducto(idProducto) {
    try {
        const respuesta = await fetch(API_PRODUCTOS);
        const productos = await respuesta.json();

        const producto = productos.find(p => p.id_producto === idProducto);

        if (!producto) {
            mensajeProducto.textContent = 'Producto no encontrado';
            mensajeProducto.style.color = 'red';
            return;
        }

        document.getElementById('codigoBarras').value = producto.codigo_barras;
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('descripcion').value = producto.descripcion;
        document.getElementById('precioVenta').value = producto.precio_venta;
        document.getElementById('stockActual').value = producto.stock_actual;
        document.getElementById('stockMinimo').value = producto.stock_minimo;

        await cargarCategorias();
        await cargarMarcas();

        categoriaSelect.value = producto.id_categoria;
        marcaSelect.value = producto.id_marca;

        productoEditandoId = idProducto;

        mensajeProducto.textContent = 'Editando producto seleccionado';
        mensajeProducto.style.color = 'blue';

    } catch (error) {
        console.error('Error al cargar producto:', error);
    }
}

// Función para cambiar el estado del producto (activar/desactivar)
async function cambiarEstadoProducto(idProducto, estadoActual) {
    try {
        const confirmar = confirm(
            estadoActual === 'Activo'
                ? '¿Deseas desactivar este producto?'
                : '¿Deseas activar este producto?'
        );

        if (!confirmar) return;

        const respuesta = await fetch(`${API_PRODUCTOS}/${idProducto}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: estadoActual })
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            mensajeProducto.textContent = resultado.message;
            mensajeProducto.style.color = 'green';
            await cargarProductos();
        } else {
            mensajeProducto.textContent = resultado.message;
            mensajeProducto.style.color = 'red';
        }

    } catch (error) {
        console.error('Error al cambiar estado:', error);
        mensajeProducto.textContent = 'Error de conexión con el servidor';
        mensajeProducto.style.color = 'red';
    }
}