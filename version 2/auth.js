// auth.js
// Control de acceso del prototipo + menú dinámico por rol.
// Nota: la autenticación real debe validarse en un backend/base de datos.

const PAGINAS_PERMITIDAS = {
    ADMINISTRADOR: ['admision.html', 'matricula.html', 'asistencia.html', 'libreta.html', 'procesos.html'],
    PROFESOR: ['asistencia.html', 'notas.html', 'procesos.html'],
    AUXILIAR: ['asistencia.html', 'procesos.html'],
    ESTUDIANTE: ['libreta.html'],
    APODERADO: ['libreta.html']
};

const NOMBRES_PAGINA = {
    'admision.html': 'Admisión',
    'matricula.html': 'Matrícula',
    'asistencia.html': 'Asistencia',
    'notas.html': 'Notas (Profesor)',
    'libreta.html': 'Libreta / Apoderados',
    'procesos.html': 'Convivencia'
};

function obtenerSesion() {
    try {
        const data = sessionStorage.getItem('usuarioActivo');
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

function iniciarSesion(rol, codigo) {
    if (!PAGINAS_PERMITIDAS[rol]) return null;
    const sesion = {
        rol: rol,
        codigo: (codigo || 'invitado').trim(),
        fecha: new Date().toISOString()
    };
    sessionStorage.setItem('usuarioActivo', JSON.stringify(sesion));
    return sesion;
}

function cerrarSesion() {
    sessionStorage.removeItem('usuarioActivo');
    window.location.href = 'index.html';
}

function paginaActual() {
    const partes = window.location.pathname.split('/');
    return partes[partes.length - 1] || 'index.html';
}

function protegerPagina() {
    const sesion = obtenerSesion();
    const actual = paginaActual();

    if (!sesion || !PAGINAS_PERMITIDAS[sesion.rol]) {
        window.location.href = 'index.html';
        return false;
    }

    const permitidas = PAGINAS_PERMITIDAS[sesion.rol];
    if (!permitidas.includes(actual)) {
        alert('No tienes permiso para acceder a esta sección.');
        window.location.href = permitidas[0] || 'index.html';
        return false;
    }
    return true;
}

function pintarMenu() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    const sesion = obtenerSesion();
    navLinks.innerHTML = '';

    // Crea un enlace con las clases de Bulma para la barra de navegación
    function crearItem(texto, href, activo) {
        const a = document.createElement('a');
        a.className = 'navbar-item' + (activo ? ' is-active' : '');
        a.href = href;
        a.textContent = texto;
        navLinks.appendChild(a);
        return a;
    }

    if (!sesion || !PAGINAS_PERMITIDAS[sesion.rol]) {
        crearItem('Iniciar sesión', 'index.html');
        return;
    }

    const permitidas = PAGINAS_PERMITIDAS[sesion.rol];
    const actual = paginaActual();

    crearItem('Inicio', 'index.html');

    permitidas.forEach(function (pagina) {
        crearItem(NOMBRES_PAGINA[pagina] || pagina, pagina, pagina === actual);
    });

    const info = document.createElement('span');
    info.className = 'navbar-item session-info';
    info.textContent = sesion.rol + ' · ' + sesion.codigo;
    navLinks.appendChild(info);

    const aSalir = crearItem('Cerrar sesión', '#');
    aSalir.classList.add('nav-salir');
    aSalir.addEventListener('click', function (e) {
        e.preventDefault();
        cerrarSesion();
    });
}

// Botón hamburguesa de Bulma (.navbar-burger) para el menú móvil
function configurarMenuMovil() {
    document.querySelectorAll('.navbar-burger').forEach(function (burger) {
        const menu = document.getElementById(burger.dataset.target);
        if (!menu) return;

        function alternar(abierto) {
            burger.classList.toggle('is-active', abierto);
            menu.classList.toggle('is-active', abierto);
            burger.setAttribute('aria-expanded', String(abierto));
            burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
        }

        burger.addEventListener('click', function () {
            alternar(!menu.classList.contains('is-active'));
        });

        // Al elegir una opción, el menú móvil se cierra
        menu.addEventListener('click', function (e) {
            if (e.target.closest('a.navbar-item')) alternar(false);
        });
    });
}

document.addEventListener('DOMContentLoaded', configurarMenuMovil);
