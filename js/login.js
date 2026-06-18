const API_LOGIN = 'http://localhost:4000/login';

const loginForm = document.getElementById('loginForm');
const mensajeLogin = document.getElementById('mensajeLogin');

const mensajeSesion = sessionStorage.getItem('stockflow_mensaje_sesion');

if (mensajeSesion) {
    mensajeLogin.textContent = mensajeSesion;
    mensajeLogin.style.color = 'red';
    sessionStorage.removeItem('stockflow_mensaje_sesion');
}

function iniciarSesion(usuario) {
    sessionStorage.setItem('stockflow_sesion', JSON.stringify({
        id: usuario.id_usuario,
        usuario: usuario.usuario,
        inicio: Date.now()
    }));
    sessionStorage.setItem('stockflow_ultima_actividad', String(Date.now()));
}

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
            iniciarSesion(resultado.usuario);
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
    iniciarSesion(resultado.usuario);
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

const API_RECUPERAR = 'http://localhost:4000/recuperar-password';
const API_CAMBIAR_PASSWORD = 'http://localhost:4000/cambiar-password';

const abrirRecuperacion = document.getElementById('abrirRecuperacion');
const modalRecuperacion = document.getElementById('modalRecuperacion');
const recuperacionForm = document.getElementById('recuperacionForm');
const cancelarRecuperacion = document.getElementById('cancelarRecuperacion');
const mensajeRecuperacion = document.getElementById('mensajeRecuperacion');

const modalNuevaPassword = document.getElementById('modalNuevaPassword');
const nuevaPasswordForm = document.getElementById('nuevaPasswordForm');
const cancelarNuevaPassword = document.getElementById('cancelarNuevaPassword');
const mensajeNuevaPassword = document.getElementById('mensajeNuevaPassword');

let correoVerificado = '';

abrirRecuperacion.addEventListener('click', (e) => {
    e.preventDefault();
    modalRecuperacion.style.display = 'flex';
});

cancelarRecuperacion.addEventListener('click', () => {
    modalRecuperacion.style.display = 'none';
    recuperacionForm.reset();
    mensajeRecuperacion.textContent = '';
});

recuperacionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const correo = document.getElementById('correoRecuperacion').value;

    try {
        const respuesta = await fetch(API_RECUPERAR, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo })
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            correoVerificado = resultado.correo;

            mensajeRecuperacion.textContent = 'Correo verificado correctamente';
            mensajeRecuperacion.style.color = 'green';

            setTimeout(() => {
                modalRecuperacion.style.display = 'none';
                recuperacionForm.reset();
                mensajeRecuperacion.textContent = '';
                modalNuevaPassword.style.display = 'flex';
            }, 1000);

        } else {
            mensajeRecuperacion.textContent = resultado.message;
            mensajeRecuperacion.style.color = 'red';
        }

    } catch (error) {
        mensajeRecuperacion.textContent = 'Error de conexión con el servidor';
        mensajeRecuperacion.style.color = 'red';
    }
});

cancelarNuevaPassword.addEventListener('click', () => {
    modalNuevaPassword.style.display = 'none';
    nuevaPasswordForm.reset();
    mensajeNuevaPassword.textContent = '';
});

nuevaPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datosCambio = {
        correo: correoVerificado,
        nuevaPassword: document.getElementById('nuevaPassword').value,
        confirmarPassword: document.getElementById('confirmarNuevaPassword').value
    };

    try {
        const respuesta = await fetch(API_CAMBIAR_PASSWORD, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosCambio)
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            mensajeNuevaPassword.textContent = 'Contraseña actualizada correctamente';
            mensajeNuevaPassword.style.color = 'green';

            setTimeout(() => {
                modalNuevaPassword.style.display = 'none';
                nuevaPasswordForm.reset();
                mensajeNuevaPassword.textContent = '';
            }, 1500);

        } else {
            mensajeNuevaPassword.textContent = resultado.message;
            mensajeNuevaPassword.style.color = 'red';
        }

    } catch (error) {
        mensajeNuevaPassword.textContent = 'Error de conexión con el servidor';
        mensajeNuevaPassword.style.color = 'red';
    }
});
