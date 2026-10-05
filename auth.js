// auth.js
// Módulo compartido: control de acceso (login/sesión) y menú principal dinámico según rol de usuario.
// Se incluye con <script src="auth.js"></script> en todas las páginas del sistema.

// Actores del sistema según el Catálogo de Actores del proyecto (Av.1):
// Administrador, Profesor, Auxiliar/Coordinador, Estudiante, Apoderado.
// (Los Postulantes no inician sesión: postulan mediante un formulario público
// y recién reciben usuario/clave si son admitidos — RF-2.6).

// Páginas que puede visitar cada rol. La primera de la lista es la "página de inicio" de ese rol.
const PAGINAS_PERMITIDAS = {
  ADMINISTRADOR: ['admision.html', 'matricula.html', 'asistencia.html', 'libreta.html', 'procesos.html'],
  PROFESOR:      ['asistencia.html', 'notas.html', 'procesos.html'],
  AUXILIAR:      ['asistencia.html', 'procesos.html'],
  ESTUDIANTE:    ['libreta.html'],
  APODERADO:     ['libreta.html']
};

// Nombre visible en el menú para cada página.
const NOMBRES_PAGINA = {
  'admision.html':   'Admisión',
  'matricula.html':  'Matrícula',
  'asistencia.html': 'Asistencia',
  'notas.html':      'Notas (Profesor)',
  'libreta.html':    'Libreta / Apoderados',
  'procesos.html':   'Convivencia'
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
  const sesion = { rol, codigo: codigo || 'invitado', fecha: new Date().toISOString() };
  localStorage.setItem('usuarioActivo', JSON.stringify(sesion));
  return sesion;
}

function cerrarSesion() {
  localStorage.removeItem('usuarioActivo');
  window.location.href = 'index.html';
}

// Nombre del archivo actual, p.ej. "notas.html"
function paginaActual() {
  const partes = window.location.pathname.split('/');
  return partes[partes.length - 1] || 'index.html';
}

// Llamar al inicio de CADA página protegida (todas menos index.html).
// Si no hay sesión, o el rol no tiene permiso para esta página, redirige.
function protegerPagina() {
  const sesion = obtenerSesion();
  const actual = paginaActual();

  if (!sesion) {
    window.location.href = 'index.html';
    return;
  }

  const permitidas = PAGINAS_PERMITIDAS[sesion.rol] || [];
  if (!permitidas.includes(actual)) {
    alert('No tienes permiso para acceder a "' + actual + '" con el rol ' + sesion.rol + '.');
    window.location.href = (permitidas[0] || 'index.html');
  }
}

// Dibuja el <ul id="nav-links"> con solo las opciones que le corresponden al rol activo,
// más el indicador de usuario y el botón de cerrar sesión.
function pintarMenu() {
  const navLinks = document.getElementById('nav-links');
  if (!navLinks) return;

  const sesion = obtenerSesion();
  navLinks.innerHTML = '';

  if (!sesion) {
    const li = document.createElement('li');
    li.innerHTML = '<a href="index.html">Iniciar sesión</a>';
    navLinks.appendChild(li);
    return;
  }

  const permitidas = PAGINAS_PERMITIDAS[sesion.rol] || [];
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
  liInfo.innerHTML = '<span style="color:#94a3b8;padding:8px 14px;font-size:12px;display:inline-block;">'
    + sesion.rol + ' · ' + sesion.codigo + '</span>';
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

