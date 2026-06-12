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