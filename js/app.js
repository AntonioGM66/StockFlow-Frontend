const API_URL = 'http://localhost:4000/productos';

const form = document.getElementById('productoForm');
const listaProductos = document.getElementById('listaProductos');

async function cargarProductos() {
    const respuesta = await fetch(API_URL);
    const productos = await respuesta.json();

    listaProductos.innerHTML = '';

    productos.forEach(producto => {
        const item = document.createElement('li');
        item.textContent = `${producto.nombre} - $${producto.precio} - Stock: ${producto.stock}`;
        listaProductos.appendChild(item);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const producto = {
        nombre: document.getElementById('nombre').value,
        precio: document.getElementById('precio').value,
        stock: document.getElementById('stock').value
    };

    await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(producto)
    });

    form.reset();
    cargarProductos();
});

cargarProductos();