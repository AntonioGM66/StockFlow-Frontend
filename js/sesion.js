const CLAVE_SESION = 'stockflow_sesion';
const CLAVE_ULTIMA_ACTIVIDAD = 'stockflow_ultima_actividad';
const TIEMPO_INACTIVIDAD = 15 * 60 * 1000;
const INTERVALO_REVISION = 1000;

function cerrarSesion(motivo = 'manual') {
    sessionStorage.removeItem(CLAVE_SESION);
    sessionStorage.removeItem(CLAVE_ULTIMA_ACTIVIDAD);

    if (motivo === 'inactividad') {
        sessionStorage.setItem(
            'stockflow_mensaje_sesion',
            'La sesión se cerró automáticamente por inactividad.'
        );
    }

    window.location.replace('index.html');
}

function haySesionActiva() {
    return sessionStorage.getItem(CLAVE_SESION) !== null;
}

if (!haySesionActiva()) {
    window.location.replace('index.html');
} else {
    let ultimaActualizacion = 0;

    function registrarActividad() {
        const ahora = Date.now();

        if (ahora - ultimaActualizacion < 1000) {
            return;
        }

        ultimaActualizacion = ahora;
        sessionStorage.setItem(CLAVE_ULTIMA_ACTIVIDAD, String(ahora));
    }

    const ultimaActividadGuardada = Number(
        sessionStorage.getItem(CLAVE_ULTIMA_ACTIVIDAD)
    );

    if (
        ultimaActividadGuardada &&
        Date.now() - ultimaActividadGuardada >= TIEMPO_INACTIVIDAD
    ) {
        cerrarSesion('inactividad');
    } else {
        registrarActividad();

        ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach((evento) => {
            document.addEventListener(evento, registrarActividad, { passive: true });
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                const ultimaActividad = Number(
                    sessionStorage.getItem(CLAVE_ULTIMA_ACTIVIDAD)
                );

                if (
                    !ultimaActividad ||
                    Date.now() - ultimaActividad >= TIEMPO_INACTIVIDAD
                ) {
                    cerrarSesion('inactividad');
                    return;
                }

                registrarActividad();
            }
        });

        document.querySelectorAll('.cerrar-sesion').forEach((enlace) => {
            enlace.addEventListener('click', (evento) => {
                evento.preventDefault();
                cerrarSesion();
            });
        });

        window.setInterval(() => {
            const ultimaActividad = Number(
                sessionStorage.getItem(CLAVE_ULTIMA_ACTIVIDAD)
            );

            if (
                !haySesionActiva() ||
                !ultimaActividad ||
                Date.now() - ultimaActividad >= TIEMPO_INACTIVIDAD
            ) {
                cerrarSesion('inactividad');
            }
        }, INTERVALO_REVISION);
    }
}
