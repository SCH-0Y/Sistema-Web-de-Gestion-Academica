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
        const data = localStorage.getItem('usuarioActivo');
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
    localStorage.setItem('usuarioActivo', JSON.stringify(sesion));
    return sesion;
}

function cerrarSesion() {
    localStorage.removeItem('usuarioActivo');
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

    if (!sesion || !PAGINAS_PERMITIDAS[sesion.rol]) {
        const li = document.createElement('li');
        li.innerHTML = '<a href="index.html">Iniciar sesión</a>';
        navLinks.appendChild(li);
        return;
    }

    const permitidas = PAGINAS_PERMITIDAS[sesion.rol];
    const actual = paginaActual();

    const liInicio = document.createElement('li');
    liInicio.innerHTML = '<a href="index.html">Inicio</a>';
    navLinks.appendChild(liInicio);

    permitidas.forEach(function (pagina) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = pagina;
        a.textContent = NOMBRES_PAGINA[pagina] || pagina;
        if (pagina === actual) a.classList.add('active');
        li.appendChild(a);
        navLinks.appendChild(li);
    });

    const liInfo = document.createElement('li');
    const info = document.createElement('span');
    info.className = 'session-info';
    info.textContent = sesion.rol + ' · ' + sesion.codigo;
    liInfo.appendChild(info);
    navLinks.appendChild(liInfo);

    const liSalir = document.createElement('li');
    const aSalir = document.createElement('a');
    aSalir.href = '#';
    aSalir.textContent = 'Cerrar sesión';
    aSalir.addEventListener('click', function (e) {
        e.preventDefault();
        cerrarSesion();
    });
    liSalir.appendChild(aSalir);
    navLinks.appendChild(liSalir);
}

function configurarMenuMovil() {
    document.querySelectorAll('.nav-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const nav = btn.parentElement.querySelector('.nav-links');
            if (!nav) return;
            const abierto = nav.classList.toggle('mobile-open');
            btn.setAttribute('aria-expanded', String(abierto));
            btn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
            btn.querySelector('span').textContent = abierto ? '×' : '☰';
        });
    });

    document.querySelectorAll('.nav-links a').forEach(function (link) {
        link.addEventListener('click', function () {
            const nav = link.closest('.nav-links');
            const btn = nav && nav.parentElement.querySelector('.nav-toggle');
            if (nav) nav.classList.remove('mobile-open');
            if (btn) {
                btn.setAttribute('aria-expanded', 'false');
                btn.setAttribute('aria-label', 'Abrir menú');
                btn.querySelector('span').textContent = '☰';
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', configurarMenuMovil);
