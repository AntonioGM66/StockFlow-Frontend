const API_LOGIN = 'http://localhost:4000/login';

const loginForm = document.getElementById('loginForm');
const mensajeLogin = document.getElementById('mensajeLogin');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datosLogin = {
        usuario: document.getElementById('usuario').value,
        password: document.getElementById('password').value
    };

    try {
        const respuesta = await fetch(API_LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosLogin)
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            mensajeLogin.textContent = 'Acceso correcto. Redirigiendo...';
            mensajeLogin.style.color = 'green';

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            mensajeLogin.textContent = resultado.message;
            mensajeLogin.style.color = 'red';
        }

    } catch (error) {
        mensajeLogin.textContent = 'Error de conexión con el servidor';
        mensajeLogin.style.color = 'red';
    }
});

const API_USUARIOS = 'http://localhost:4000/usuarios';

const abrirRegistro = document.getElementById('abrirRegistro');
const modalRegistro = document.getElementById('modalRegistro');
const cancelarRegistro = document.getElementById('cancelarRegistro');
const registroForm = document.getElementById('registroForm');
const mensajeRegistro = document.getElementById('mensajeRegistro');

abrirRegistro.addEventListener('click', (e) => {
    e.preventDefault();
    modalRegistro.style.display = 'flex';
});

cancelarRegistro.addEventListener('click', () => {
    modalRegistro.style.display = 'none';
    registroForm.reset();
    mensajeRegistro.textContent = '';
});

registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datosRegistro = {
        nombre: document.getElementById('nombre').value,
        apellidoPaterno: document.getElementById('apellidoPaterno').value,
        apellidoMaterno: document.getElementById('apellidoMaterno').value,
        usuario: document.getElementById('usuarioRegistro').value,
        correo: document.getElementById('correoRegistro').value,
        password: document.getElementById('passwordRegistro').value,
        confirmarPassword: document.getElementById('confirmarPassword').value
    };

    try {
        const respuesta = await fetch(API_USUARIOS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosRegistro)
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            mensajeRegistro.textContent = 'Cuenta creada exitosamente';
            mensajeRegistro.style.color = 'green';

            setTimeout(() => {
                modalRegistro.style.display = 'none';
                registroForm.reset();
                mensajeRegistro.textContent = '';
            }, 1500);
        } else {
            mensajeRegistro.textContent = resultado.message;
            mensajeRegistro.style.color = 'red';
        }

    } catch (error) {
        mensajeRegistro.textContent = 'Error de conexión con el servidor';
        mensajeRegistro.style.color = 'red';
    }
});