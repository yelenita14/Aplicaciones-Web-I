// FUNCIONES DE VALIDACIÓN
// Validar email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validar email institucional ULEAM
function validarEmailULEAM(email) {
    return email.endsWith('@uleam.edu.ec') || email.endsWith('@live.uleam.edu.ec');
}

// Validar cédula ecuatoriana
function validarCedula(cedula) {
    if (cedula.length !== 10) return false;
    
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;
    
    const digitoVerificador = parseInt(cedula.charAt(9));
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    
    for (let i = 0; i < 9; i++) {
        let valor = parseInt(cedula.charAt(i)) * coeficientes[i];
        if (valor > 9) valor -= 9;
        suma += valor;
    }
    
    const resultado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
    return resultado === digitoVerificador;
}

// Validar teléfono ecuatoriano
function validarTelefono(telefono) {
    const regex = /^(09|08)\d{8}$/;
    return regex.test(telefono);
}

// Validar solo letras
function validarSoloLetras(texto) {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return regex.test(texto);
}

// Validar matrícula
function validarMatricula(matricula) {
    const regex = /^[0-9]{4}P[0-9]-[0-9]{4,5}$/;
    return regex.test(matricula);
}

// Mostrar mensaje de error
function mostrarError(elementId, mensaje) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = mensaje;
        errorElement.style.display = 'block';
    }
}

// Limpiar mensaje de error
function limpiarError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

// FUNCIÓN CERRAR SESIÓN
function cerrarSesion(){
    document.getElementById('modalCerrarSesion').style.display = 'block';
    document.getElementById('btnConfirmarCerrar').onclick = function () {
        localStorage.removeItem('usuarioActual');
        sessionStorage.removeItem('sesionActiva');
        sessionStorage.removeItem('usuarioSesion');
        window.location.href = 'index.html';
    };
    document.getElementById('btnCancelarCerrar').onclick = function () {
        document.getElementById('modalCerrarSesion').style.display = 'none';
    };
}
// SISTEMA DE LOGIN CON REDIRECCIÓN
// VALIDACIÓN FORMULARIO DE LOGIN
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            
            // Limpiar errores previos
            limpiarError('emailError');
            limpiarError('passwordError');
            
            // Validar email
            const email = document.getElementById('email').value.trim();
            if (email === '') {
                mostrarError('emailError', 'El correo es obligatorio');
                isValid = false;
            } else if (!validarEmail(email)) {
                mostrarError('emailError', 'Formato de correo inválido');
                isValid = false;
            } else if (!validarEmailULEAM(email)) {
                mostrarError('emailError', 'Debe usar un correo institucional @uleam.edu.ec');
                isValid = false;
            }
            
            // Validar contraseña
            const password = document.getElementById('password').value;
            if (password === '') {
                mostrarError('passwordError', 'La contraseña es obligatoria');
                isValid = false;
            } else if (password.length < 6) {
                mostrarError('passwordError', 'La contraseña debe tener al menos 6 caracteres');
                isValid = false;
            }
            
            if (isValid) {
                // Determinar tipo de usuario por el correo
                const esEstudiante = email.startsWith('e') && email.includes('@live.uleam.edu.ec');
                const esDocente = email.includes('@uleam.edu.ec') && !email.includes('@live.uleam.edu.ec');
                
                // Guardar sesión en Local Storage (persistente)
                const usuarioActual = {
                    email: email,
                    tipo: esEstudiante ? 'estudiante' : 'docente',
                    fechaLogin: new Date().toISOString()
                };
                localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
                
                // Guardar sesión en Session Storage (temporal - solo durante la sesión actual)
                const sesionTemporal = {
                    email: email,
                    tipo: esEstudiante ? 'estudiante' : 'docente',
                    horaLogin: new Date().toLocaleTimeString(),
                    fechaLogin: new Date().toISOString(),
                    activa: true
                };
                sessionStorage.setItem('sesionActiva', JSON.stringify(sesionTemporal));
                sessionStorage.setItem('usuarioSesion', email);
                
                // Redirigir según tipo de usuario
                if (esEstudiante) {
                    window.location.href = 'panel_estudiante.html';
                } else if (esDocente) {
                    window.location.href = 'dashboard.html';
                } else {
                    mostrarError('emailError', 'Tipo de usuario no reconocido');
                }
            }
        });
    }
});

// Verificar sesión al cargar páginas protegidas
document.addEventListener('DOMContentLoaded', function() {
    const paginasProtegidas = ['dashboard.html', 'estudiantes.html', 'asistencias.html', 'materias.html', 'reportes.html', 'panel_estudiante.html'];
    const paginaActual = window.location.pathname.split('/').pop();
    
    if (paginasProtegidas.includes(paginaActual)) {
        const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || 'null');
        
        if (!usuarioActual) {
            // No hay sesión, redirigir al login
            window.location.href = 'index.html';
            return;
        }
        
        // Verificar que el tipo de usuario coincida con la página
        const paginasDocente = ['dashboard.html', 'estudiantes.html', 'asistencias.html', 'materias.html', 'reportes.html'];
        const paginasEstudiante = ['panel_estudiante.html'];
        
        if (paginasDocente.includes(paginaActual) && usuarioActual.tipo !== 'docente') {
            window.location.href = 'panel_estudiante.html';
            return;
        }
        
        if (paginasEstudiante.includes(paginaActual) && usuarioActual.tipo !== 'estudiante') {
            window.location.href = 'dashboard.html';
            return;
        }
    }
});
// ACTUALIZAR DASHBOARD
function actualizarDashboard() {
    const estudiantes = JSON.parse(localStorage.getItem('estudiantes') || '[]');
    const asistencias = JSON.parse(localStorage.getItem('asistencias') || '[]');

    const studentsCountEl = document.getElementById('studentsCount');
    const presentCountEl = document.getElementById('presentCount');
    const absentCountEl = document.getElementById('absentCount');

    if (studentsCountEl) studentsCountEl.textContent = estudiantes.length;
    
    if (presentCountEl && absentCountEl) {
        const hoy = new Date().toISOString().split('T')[0];
        let presentes = 0;
        let ausentes = 0;

        asistencias.forEach(a => {
            if (a.fecha === hoy) {
                if(a.estado === 'presente') presentes++;
                else if(a.estado === 'ausente') ausentes++;
            }
        });

        presentCountEl.textContent = presentes;
        absentCountEl.textContent = ausentes;
    }
}

// Actualizar fecha en el dashboard
function mostrarFechaActual() {
    const currentDateEl = document.getElementById('currentDate');
    if(currentDateEl){
        const hoy = new Date();
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.textContent = hoy.toLocaleDateString('es-ES', opciones);
    }
}

// Llamar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    mostrarFechaActual();
    actualizarDashboard();
});
// VALIDACIÓN FORMULARIO DE ESTUDIANTES
const formEstudiante = document.getElementById('formEstudiante');
if (formEstudiante) {
    formEstudiante.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        limpiarError('matriculaError');
        limpiarError('cedulaError');
        limpiarError('nombresError');
        limpiarError('apellidosError');
        limpiarError('emailEstudianteError');
        limpiarError('carreraError');
        
        const matricula = document.getElementById('matricula').value.trim();
        if (matricula === '') {
            mostrarError('matriculaError', 'La matrícula es obligatoria');
            isValid = false;
        } else if (!validarMatricula(matricula)) {
            mostrarError('matriculaError', 'Formato inválido. Ejemplo: 2023P1-43758');
            isValid = false;
        }
        
        const cedula = document.getElementById('cedula').value.trim();
        if (cedula === '') {
            mostrarError('cedulaError', 'La cédula es obligatoria');
            isValid = false;
        } else if (!validarCedula(cedula)) {
            mostrarError('cedulaError', 'Cédula ecuatoriana inválida');
            isValid = false;
        }
        
        const nombres = document.getElementById('nombres').value.trim();
        if (nombres === '') {
            mostrarError('nombresError', 'Los nombres son obligatorios');
            isValid = false;
        } else if (!validarSoloLetras(nombres)) {
            mostrarError('nombresError', 'Solo se permiten letras');
            isValid = false;
        } else if (nombres.length < 3) {
            mostrarError('nombresError', 'Debe tener al menos 3 caracteres');
            isValid = false;
        }
        
        const apellidos = document.getElementById('apellidos').value.trim();
        if (apellidos === '') {
            mostrarError('apellidosError', 'Los apellidos son obligatorios');
            isValid = false;
        } else if (!validarSoloLetras(apellidos)) {
            mostrarError('apellidosError', 'Solo se permiten letras');
            isValid = false;
        } else if (apellidos.length < 3) {
            mostrarError('apellidosError', 'Debe tener al menos 3 caracteres');
            isValid = false;
        }
        
        const email = document.getElementById('emailEstudiante').value.trim();
        if (email === '') {
            mostrarError('emailEstudianteError', 'El email es obligatorio');
            isValid = false;
        } else if (!validarEmail(email)) {
            mostrarError('emailEstudianteError', 'Formato de email inválido');
            isValid = false;
        } else if (!validarEmailULEAM(email)) {
            mostrarError('emailEstudianteError', 'Debe usar email institucional @uleam.edu.ec o @live.uleam.edu.ec');
            isValid = false;
        }
        
        const carrera = document.getElementById('carrera').value;
        if (carrera === '') {
            mostrarError('carreraError', 'Debe seleccionar una carrera');
            isValid = false;
        }
        
        if (isValid) {
            // Guardar el estudiante
            const nuevo = { matricula, cedula, nombres, apellidos, email, carrera };
            
            let estudiantes = JSON.parse(localStorage.getItem('estudiantes') || '[]');
            const existe = estudiantes.find(e => e.matricula === matricula);
            
            if (existe && editIndex === -1) {
                mostrarError('matriculaError', 'La matrícula ya existe');
                return;
            }
            
            if (editIndex >= 0) {
                estudiantes[editIndex] = nuevo;
            } else {
                estudiantes.push(nuevo);
            }
            
            localStorage.setItem('estudiantes', JSON.stringify(estudiantes));
            
            if (typeof cerrarModal === 'function') cerrarModal();
            if (typeof renderizarTabla === 'function') renderizarTabla();
            
            mostrarNotificacion('Estudiante guardado exitosamente', 'success');
        }
    });
    
    // Limitar entrada en campo cédula
    const cedulaInput = document.getElementById('cedula');
    if (cedulaInput) {
        cedulaInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 10);
        });
    }
}
// VALIDACIÓN FORMULARIO DE MATERIAS

const formMateria = document.getElementById('formMateria');
if (formMateria) {
    formMateria.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        limpiarError('codigoMateriaError');
        limpiarError('nombreMateriaError');
        limpiarError('nivelMateriaError');
        limpiarError('creditosMateriaError');
        limpiarError('docenteMateriaError');
        
        const codigo = document.getElementById('codigoMateria').value.trim();
        if (codigo === '' || codigo.length < 3) {
            mostrarError('codigoMateriaError', 'El código debe tener al menos 3 caracteres');
            isValid = false;
        }
        
        const nombre = document.getElementById('nombreMateria').value.trim();
        if (nombre === '' || nombre.length < 3) {
            mostrarError('nombreMateriaError', 'El nombre debe tener al menos 3 caracteres');
            isValid = false;
        }
        
        const nivel = document.getElementById('nivelMateria').value;
        if (nivel === '') {
            mostrarError('nivelMateriaError', 'Debe seleccionar un nivel');
            isValid = false;
        }
        
        const creditos = document.getElementById('creditosMateria').value;
        if (creditos === '' || creditos < 1 || creditos > 200) {
            mostrarError('creditosMateriaError', 'Los créditos deben estar entre 1 y 200');
            isValid = false;
        }
        
        const docente = document.getElementById('docenteMateria').value.trim();
        if (docente === '' || !validarSoloLetras(docente)) {
            mostrarError('docenteMateriaError', 'Nombre de docente inválido');
            isValid = false;
        }
        
        if (isValid) {
            const nueva = { codigo, nombre, nivel, creditos, docente };
            
            let materias = JSON.parse(localStorage.getItem('materias') || '[]');
            const existe = materias.find(m => m.codigo === codigo);
            
            if (existe && editMateriaIndex === -1) {
                mostrarError('codigoMateriaError', 'El código ya existe');
                return;
            }
            
            if (editMateriaIndex >= 0) {
                materias[editMateriaIndex] = nueva;
            } else {
                materias.push(nueva);
            }
            
            localStorage.setItem('materias', JSON.stringify(materias));
            
            if (typeof cerrarModalMateria === 'function') cerrarModalMateria();
            if (typeof renderizarTablaMaterias === 'function') renderizarTablaMaterias();
            
            mostrarNotificacion('Materia guardada exitosamente', 'success');
        }
    });
}
// SISTEMA DE ASISTENCIAS
let attendanceData = {};
let asistencias = [];
let estudiantes = [];
let materias = [];
let justificaciones = [];
let editIndex = -1;
let editMateriaIndex = -1;

function cargarLocalStorage() {
    estudiantes = JSON.parse(localStorage.getItem('estudiantes') || '[]');
    materias = JSON.parse(localStorage.getItem('materias') || '[]');
    asistencias = JSON.parse(localStorage.getItem('asistencias') || '[]');
    justificaciones = JSON.parse(localStorage.getItem('justificaciones') || '[]');
}

// Cargar estudiantes al seleccionar materia y fecha
function loadStudents() {
    cargarLocalStorage();
    
    const materiaSelect = document.getElementById('materiaAsistencia');
    const fechaInput = document.getElementById('fechaAsistencia');
    const tbody = document.getElementById('attendanceTableBody');
    
    if (!materiaSelect || !fechaInput || !tbody) return;
    
    const materiaValue = materiaSelect.value;
    const fecha = fechaInput.value;
    
    if (!materiaValue || !fecha) {
        alert('Por favor seleccione una materia y una fecha');
        return;
    }
    
    tbody.innerHTML = '';
    attendanceData = {};
    
    const registrosExistentes = asistencias.filter(a => 
        a.codigoMateria === materiaValue && a.fecha === fecha
    );
    
    if (estudiantes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-cell">
                    No hay estudiantes registrados
                </td>
            </tr>
        `;
        return;
    }
    
    estudiantes.forEach(est => {
        const registroExistente = registrosExistentes.find(r => r.matricula === est.matricula);
        const estadoActual = registroExistente ? registroExistente.estado : null;
        const observacionActual = registroExistente ? registroExistente.observacion : '';
        
        if (estadoActual) {
            attendanceData[est.matricula] = estadoActual;
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                ${est.nombres} ${est.apellidos}
            </td>
            <td>
                ${est.email}
            </td>
            <td class="center-cell">
                <input type="radio" class="radio-input"
                id="radio_${est.matricula}"
                ${estadoActual === 'ausente' ? 'checked' : ''}
                onchange="setAttendance('${est.matricula}', 'ausente')">
            </td>
            <td>
                <input type="text" class="obs-input"
                    id="obs_${est.matricula}"
                    placeholder="Observación / Justificación"
                    value="${observacionActual || ''}">
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    if (registrosExistentes.length > 0) {
        mostrarNotificacion('Se cargaron registros existentes', 'info');
    }
}

function setAttendance(matricula, estado) {
    attendanceData[matricula] = estado;
}

function saveAttendance() {
    cargarLocalStorage();
    
    const materiaSelect = document.getElementById('materiaAsistencia');
    const fechaInput = document.getElementById('fechaAsistencia');
    
    if (!materiaSelect || !fechaInput) return;
    
    const materiaValue = materiaSelect.value;
    const fecha = fechaInput.value;
    
    if (!materiaValue || !fecha) {
        alert('Por favor seleccione una materia y fecha');
        return;
    }
    
    const materiaNombre = materiaSelect.options[materiaSelect.selectedIndex].text;
    
    const sinRegistro = estudiantes.filter(e => !attendanceData[e.matricula]);
    if (sinRegistro.length > 0) {
        if (!confirm(`Hay ${sinRegistro.length} estudiante(s) sin registrar. ¿Continuar?`)) {
            return;
        }
    }
    
    asistencias = asistencias.filter(a => 
        !(a.codigoMateria === materiaValue && a.fecha === fecha)
    );
    
    estudiantes.forEach(est => {
        if (attendanceData[est.matricula]) {
            const observacionInput = document.getElementById(`obs_${est.matricula}`);
            const observacion = observacionInput ? observacionInput.value.trim() : '';
            
            asistencias.push({
                id: Date.now() + Math.random(),
                matricula: est.matricula,
                nombres: est.nombres,
                apellidos: est.apellidos,
                email: est.email,
                materia: materiaNombre,
                codigoMateria: materiaValue,
                fecha: fecha,
                estado: attendanceData[est.matricula],
                observacion: observacion,
                registradoPor: 'Juan Pérez',
                fechaRegistro: new Date().toISOString()
            });
        }
    });
    
    localStorage.setItem('asistencias', JSON.stringify(asistencias));
    
    mostrarNotificacion('✓ Asistencias guardadas exitosamente', 'success');
    
    setTimeout(() => {
        document.getElementById('attendanceTableBody').innerHTML = '';
        attendanceData = {};
        materiaSelect.selectedIndex = 0;
        fechaInput.value = '';
    }, 2000);
    
    actualizarDashboard();
}

function setTodayDate() {
    const fechaInput = document.getElementById('fechaAsistencia');
    if (fechaInput && !fechaInput.value) {
        const today = new Date().toISOString().split('T')[0];
        fechaInput.value = today;
    }
}

function mostrarNotificacion(mensaje, tipo) {
    let notif = document.getElementById('notification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'notification';
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(notif);
    }
    
    const colores = {
        success: 'alert-success',
        error: 'alert-error',
        info: 'alert-info'
    };
    
    const clase = colores[tipo] || colores.info;
    notif.className = `notificacion ${clase}`;
    notif.textContent = mensaje;
    
    setTimeout(() => {
        notif.classList.remove('show');
    }, 4000);
}

// Event listener para cargar estudiantes
document.addEventListener('DOMContentLoaded', function() {
    const btnCargar = document.querySelector('.btn-cargar');
    if (btnCargar) {
        btnCargar.addEventListener('click', function(e) {
            e.preventDefault();
            loadStudents();
        });
    }
    
    setTodayDate();
    cargarLocalStorage();
    
    // Actualizar badge de notificaciones si estamos en la página de asistencias
    if (document.getElementById('badgeNotificaciones')) {
        actualizarBadgeNotificaciones();
    }
});
// VALIDACIÓN FORMULARIO DE REPORTES
const formReporte = document.getElementById('formReporte');
if (formReporte) {
    formReporte.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const tipoReporte = document.getElementById('tipoReporte').value;
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;
        
        let isValid = true;
        
        if (!tipoReporte) {
            alert('Debe seleccionar un tipo de reporte');
            isValid = false;
        }
        
        if (!fechaInicio || !fechaFin) {
            alert('Debe seleccionar ambas fechas');
            isValid = false;
        } else if (new Date(fechaInicio) > new Date(fechaFin)) {
            alert('La fecha de inicio no puede ser mayor que la fecha fin');
            isValid = false;
        }
        
        if (isValid) {
            generarReporte(tipoReporte, fechaInicio, fechaFin);
        }
    });
}
// VALIDACIÓN FORMULARIO RECUPERAR CONTRASEÑA
const recuperarForm = document.getElementById('recuperarForm');
if (recuperarForm) {
    recuperarForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        limpiarError('emailRecuperarError');
        
        const email = document.getElementById('emailRecuperar').value.trim();
        
        let isValid = true;
        
        if (email === '') {
            mostrarError('emailRecuperarError', 'El correo es obligatorio');
            isValid = false;
        } else if (!validarEmail(email)) {
            mostrarError('emailRecuperarError', 'Formato de correo inválido');
            isValid = false;
        } else if (!validarEmailULEAM(email)) {
            mostrarError('emailRecuperarError', 'Debe usar un correo institucional @uleam.edu.ec o @live.uleam.edu.ec');
            isValid = false;
        }
        
        if (isValid) {
            mostrarNotificacion('Código enviado al correo', 'success');
        }
    });
}
console.log('Sistema de validaciones ULEAM cargado correctamente');
//  AGREGAR ESTUDIANTES 

// Obtener elementos
const studentModal = document.getElementById('studentModal');
const modalTitle = document.getElementById('modalTitle');
const formEst = document.getElementById('formEstudiante');
const studentTableBody = document.getElementById('studentTableBody'); 
// Cargar estudiantes desde localStorage
function cargarEstudiantes() {
    const raw = localStorage.getItem('estudiantes') || '[]';
    try {
        estudiantes = JSON.parse(raw);
    } catch (e) {
        console.error('Error parseando estudiantes desde localStorage', e);
        estudiantes = [];
    }
}

// Guardar en localStorage
function guardarEstudiantes() {
    localStorage.setItem('estudiantes', JSON.stringify(estudiantes));
}

// Renderizar tabla
function renderizarTabla() {
    if (!studentTableBody) return;
    studentTableBody.innerHTML = '';
    // aplicar filtros: bÃºsqueda y carrera
    const searchEl = document.getElementById('searchStudent');
    const filtro = searchEl ? searchEl.value.trim().toLowerCase() : '';
    const carreraFilter = filterCarrera ? filterCarrera.value : '';

    estudiantes.forEach((est, idx) => {
        // filtro por carrera
        if (carreraFilter && est.carrera !== carreraFilter) return;
        // filtro por bÃºsqueda (matrÃ¬cula, nombre, apellidos, email)
        if (filtro) {
            const combinado = ((est.matricula || '') + ' ' + (est.nombres || '') + ' ' + (est.apellidos || '') + ' ' + (est.email || '')).toLowerCase();
            if (!combinado.includes(filtro)) return;
        }
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${est.matricula || ''}</td>
            <td>${(est.nombres || '') + ' ' + (est.apellidos || '')}</td>
            <td>${est.carrera || ''}</td>
            <td>${est.email || ''}</td>
            <td>
                <button class="btn-edit" onclick="editarEstudiante('${est.matricula}')">Editar</button>
                <button class="btn-delete" onclick="eliminarEstudiante('${est.matricula}')">Eliminar</button>
            </td>
        `;
        studentTableBody.appendChild(tr);
    });
}

// Abrir modal para nuevo estudiante
function nuevoEstudiante() {
    editIndex = -1;
    modalTitle.textContent = 'Nuevo Estudiante';
    abrirModal();
    formEst.reset();
}

// Wrapper pÃºblico para compatibilidad con el HTML
function agregarEstudiante() {
    // reutiliza la funciÃ³n que prepara el modal
    if (typeof nuevoEstudiante === 'function') return nuevoEstudiante();
}

// Abrir modal
function abrirModal() {
    if (!studentModal) return;
    studentModal.style.display = 'flex';
    studentModal.setAttribute('aria-hidden','false');
}

// Cerrar modal
function cerrarModal() {
    if (!studentModal) return;
    studentModal.style.display = 'none';
    studentModal.setAttribute('aria-hidden','true');
    limpiarErroresFormulario();
}

// Limpiar mensajes de error del modal
function limpiarErroresFormulario() {
    const ids = ['matriculaError','cedulaError','nombresError','apellidosError','emailEstudianteError','telefonoError','carreraError'];
    ids.forEach(id => limpiarError(id));
}

// Buscar Ã¬ndice por matrÃ¬cula
function buscarIndicePorMatricula(matricula) {
    return estudiantes.findIndex(e => e.matricula === matricula);
}

// Editar estudiante (rellena modal y cambia a modo ediciÃ³n)
function editarEstudiante(matricula) {
    const idx = buscarIndicePorMatricula(matricula);
    if (idx === -1) return alert('Estudiante no encontrado');
    editIndex = idx;
    modalTitle.textContent = 'Editar Estudiante';
    abrirModal();
    const est = estudiantes[idx];
    document.getElementById('matricula').value = est.matricula || '';
    document.getElementById('cedula').value = est.cedula || '';
    document.getElementById('nombres').value = est.nombres || '';
    document.getElementById('apellidos').value = est.apellidos || '';
    document.getElementById('emailEstudiante').value = est.email || '';
    document.getElementById('telefono').value = est.telefono || '';
    document.getElementById('carrera').value = est.carrera || '';
}

// Eliminar estudiante
function eliminarEstudiante(matricula) {
    if (!confirm('Â¿Eliminar este estudiante?')) return;
    const idx = buscarIndicePorMatricula(matricula);
    if (idx === -1) return alert('Estudiante no encontrado');
    estudiantes.splice(idx,1);
    guardarEstudiantes();
    renderizarTabla();
}

// Manejo del submit del formulario del modal (nuevo/editar)
if (formEst) {
    formEst.addEventListener('submit', function(e){
        e.preventDefault();

        // Ejecutar las validaciones ya definidas en este archivo (reutilizan ids del formulario)
        // Reutilizaremos la misma validaciÃ³n que ya existe: disparar submit al mismo form activarÃ¡ las comprobaciones

        // Reconstruir validaciÃ³n simple: si algÃºn error visible, abortar
        limpiarErroresFormulario();

        // Extraer valores
        const matricula = document.getElementById('matricula').value.trim();
        const cedula = document.getElementById('cedula').value.trim();
        const nombres = document.getElementById('nombres').value.trim();
        const apellidos = document.getElementById('apellidos').value.trim();
        const email = document.getElementById('emailEstudiante').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const carrera = document.getElementById('carrera').value;

        let isValid = true;

        if (matricula === '' || !validarMatricula(matricula)) {
            mostrarError('matriculaError', 'Matrícula obligatoria (ej. 2021-001)');
            isValid = false;
        }

        if (cedula === '' || !/^[0-9]{10}$/.test(cedula)) {
            mostrarError('cedulaError', 'CÃ©dula invÃ¡lida (10 dígitos)');
            isValid = false;
        }

        if (nombres === '' || !validarSoloLetras(nombres)) {
            mostrarError('nombresError', 'Nombres inválidos');
            isValid = false;
        }

        if (apellidos === '' || !validarSoloLetras(apellidos)) {
            mostrarError('apellidosError', 'Apellidos inválidos');
            isValid = false;
        }

        if (email === '' || !validarEmail(email) || !validarEmailULEAM(email)) {
            mostrarError('emailEstudianteError', 'Email institucional inválido');
            isValid = false;
        }

        if (telefono === '' || !validarTelefono(telefono)) {
            mostrarError('telefonoError', 'Teléfono inválido');
            isValid = false;
        }

        if (carrera === '') {
            mostrarError('carreraError', 'Seleccione una carrera');
            isValid = false;
        }

        if (!isValid) return;

        const nuevo = { matricula, cedula, nombres, apellidos, email, telefono, carrera };

        // Si editIndex >= 0 -> editar
        if (editIndex >= 0) {
            // evitar duplicar matrÃ¬cula con otro registro
            const otherIdx = estudiantes.findIndex((e,i) => e.matricula === matricula && i !== editIndex);
            if (otherIdx !== -1) {
                mostrarError('matriculaError','La matrícula ya existe para otro estudiante');
                return;
            }
            estudiantes[editIndex] = nuevo;
        } else {
            // nuevo: comprobar si matrÃ¬cula existe
            if (buscarIndicePorMatricula(matricula) !== -1) {
                mostrarError('matriculaError','La matrícula ya existe');
                return;
            }
            estudiantes.push(nuevo);
        }

        guardarEstudiantes();
        renderizarTabla();
        cerrarModal();
    });
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function(){
    cargarEstudiantes();
    renderizarTabla();
    // ocultar modal por defecto
    if (studentModal) studentModal.style.display = 'none';
});

// --- GESTIÓN DE CARRERAS: agregar, cargar, guardar y actualizar selects ---
const carreraModal = document.getElementById('carreraModal');
const formCarrera = document.getElementById('formCarrera');
const filterCarrera = document.getElementById('filterCarrera');
const selectCarreraInForm = document.getElementById('carrera');

let carreras = [];

function cargarCarreras() {
    const raw = localStorage.getItem('carreras') || '[]';
    try {
        carreras = JSON.parse(raw);
    } catch (e) {
        console.error('Error parseando carreras desde localStorage', e);
        carreras = [];
    }
    // Si no hay carreras guardadas, dejamos el array vacÃ¬o para que el select
    // se mantenga con la opción placeholder hasta que el usuario agregue una nueva.
    if (!carreras || !Array.isArray(carreras)) {
        carreras = [];
    }
}

function guardarCarreras() {
    localStorage.setItem('carreras', JSON.stringify(carreras));
}

function renderizarSelectCarreras() {
    // actualizar filtro
    if (filterCarrera) {
        filterCarrera.innerHTML = '';
        const allOpt = document.createElement('option');
        allOpt.value = '';
        allOpt.textContent = 'Todas las carreras';
        filterCarrera.appendChild(allOpt);
        carreras.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.nombre;
            opt.textContent = c.nombre;
            filterCarrera.appendChild(opt);
        });
    }

    // actualizar select dentro del formulario de estudiante
    if (selectCarreraInForm) {
        selectCarreraInForm.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Seleccione una carrera';
        selectCarreraInForm.appendChild(placeholder);
        carreras.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.nombre;
            opt.textContent = c.nombre;
            selectCarreraInForm.appendChild(opt);
        });
    }
}

function agregarCarrera() {
    // abrir modal y limpiar
    if (!carreraModal) return alert('Modal de carrera no encontrado');
    if (formCarrera) formCarrera.reset();
    // ocultar errores si existen
    limpiarError('nombreCarreraError');
    limpiarError('facultadCarreraError');
    carreraModal.style.display = 'flex';
    carreraModal.setAttribute('aria-hidden','false');
}

function cerrarModalCarrera() {
    if (!carreraModal) return;
    carreraModal.style.display = 'none';
    carreraModal.setAttribute('aria-hidden','true');
    if (formCarrera) formCarrera.reset();
}

// manejar submit del formulario de carrera
if (formCarrera) {
    formCarrera.addEventListener('submit', function(e){
        e.preventDefault();
        limpiarError('nombreCarreraError');

        const nombre = (document.getElementById('nombreCarrera') || {}).value || '';
        const facultad = (document.getElementById('facultadCarrera') || {}).value || '';

        if (!nombre.trim()) {
            mostrarError('nombreCarreraError', 'El nombre de la carrera es obligatorio');
            return;
        }

        // evitar duplicados (case-insensitive)
        const existe = carreras.find(c => c.nombre.toLowerCase() === nombre.trim().toLowerCase());
        if (existe) {
            mostrarError('nombreCarreraError', 'La carrera ya existe');
            return;
        }

        const nuevoNombre = nombre.trim();
        carreras.push({ nombre: nuevoNombre, facultad: facultad.trim() });
        guardarCarreras();
        renderizarSelectCarreras();
        // seleccionar automÃ¡ticamente la nueva carrera en el select del formulario de estudiante
        if (selectCarreraInForm) selectCarreraInForm.value = nuevoNombre;
        cerrarModalCarrera();
        // re-render tabla por si se estaba filtrando
        renderizarTabla();
    });
}

// Cerrar modal de carrera al hacer clic fuera del contenido
if (carreraModal) {
    carreraModal.addEventListener('click', function(e){
        // si el click fue sobre el overlay (el propio contenedor), cerramos
        if (e.target === carreraModal) cerrarModalCarrera();
    });
}

// aplicar filtro cuando cambie el select
if (filterCarrera) {
    filterCarrera.addEventListener('change', function(){
        renderizarTabla();
    });
}

// Asegurar que al cargar la pÃ¡gina tambiÃ©n carguen las carreras y actualicen selects
document.addEventListener('DOMContentLoaded', function(){
    cargarCarreras();
    renderizarSelectCarreras();
    // ocultar modal de carreras si existe
    if (carreraModal) carreraModal.style.display = 'none';
});

// actualizar tabla al escribir en el buscador
const searchStudentInput = document.getElementById('searchStudent');
if (searchStudentInput) {
    searchStudentInput.addEventListener('input', function(){
        renderizarTabla();
    });
}
// Inicializar carreras predeterminadas si no existen
function inicializarCarrerasPredeterminadas() {
    let carreras = JSON.parse(localStorage.getItem('carreras') || '[]');
    
    if (carreras.length === 0) {
        // Carreras predeterminadas de ULEAM
        carreras = [
            { nombre: 'Ingeniería en Tecnología de la Información', facultad: 'Facultad de Ciencias Informáticas' },
            { nombre: 'Ingeniería en Software', facultad: 'Facultad de Ciencias Informáticas' },
            { nombre: 'Ingeniería en Sistemas', facultad: 'Facultad de Ciencias Informáticas' },
            { nombre: 'Derecho', facultad: 'Facultad de Derecho' },
            { nombre: 'Arquitectura', facultad: 'Facultad de Arquitectura' },
            { nombre: 'Enfermería', facultad: 'Facultad de Ciencias de la Salud' },
            { nombre: 'Medicina', facultad: 'Facultad de Ciencias de la Salud' },
            { nombre: 'Administración de Empresas', facultad: 'Facultad de Ciencias Administrativas' }
        ];
        
        localStorage.setItem('carreras', JSON.stringify(carreras));
    }
    
    return carreras;
}

// Llamar esta función al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    inicializarCarrerasPredeterminadas();
    cargarCarreras();
    renderizarSelectCarreras();
});
// AGREGAR MATERIAS 

const materiaModal = document.getElementById('materiaModal');
const modalTitleMateria = document.getElementById('modalTitleMateria');
const formMat = document.getElementById('formMateria');
const materiaTableBody = document.getElementById('materiaTableBody');

// Cargar materias desde localStorage
function cargarMaterias() {
    const raw = localStorage.getItem('materias') || '[]';
    try {
        materias = JSON.parse(raw);
    } catch (e) {
        console.error('Error parseando materias desde localStorage', e);
        materias = [];
    }
}

// Guardar materias en localStorage
function guardarMaterias() {
    localStorage.setItem('materias', JSON.stringify(materias));
}

// Renderizar tabla
function renderizarTablaMaterias() {
    if (!materiaTableBody) return;
    materiaTableBody.innerHTML = '';
    materias.forEach((mat, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${mat.codigo || ''}</td>
            <td>${mat.nombre || ''}</td>
            <td>${mat.docente || ''}</td>
            <td>
                <button class="btn-edit" onclick="editarMateria('${mat.codigo}')">Editar</button>
                <button class="btn-delete" onclick="eliminarMateria('${mat.codigo}')">Eliminar</button>
            </td>
        `;
        materiaTableBody.appendChild(tr);
    });
}

// Función de búsqueda de materias
function buscarMaterias() {
    if (!materiaTableBody) return;
    
    const searchInput = document.getElementById('searchMateria')?.value.toLowerCase() || '';
    const filterNivel = document.getElementById('filterNivel')?.value || '';
    
    materiaTableBody.innerHTML = '';
    
    const filtradas = materias.filter(mat => {
        const coincideNombre = mat.nombre.toLowerCase().includes(searchInput) || 
                               mat.codigo.toLowerCase().includes(searchInput);
        const coincideNivel = !filterNivel || mat.nivel === filterNivel;
        return coincideNombre && coincideNivel;
    });
    
    if (filtradas.length === 0) {
        materiaTableBody.innerHTML = '<tr><td colspan="4" class="empty-cell">No se encontraron materias</td></tr>';
        return;
    }
    
    filtradas.forEach((mat, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${mat.codigo || ''}</td>
            <td>${mat.nombre || ''}</td>
            <td>${mat.docente || ''}</td>
            <td>
                <button class="btn-edit" onclick="editarMateria('${mat.codigo}')">Editar</button>
                <button class="btn-delete" onclick="eliminarMateria('${mat.codigo}')">Eliminar</button>
            </td>
        `;
        materiaTableBody.appendChild(tr);
    });
}

// Abrir modal para nueva materia
function nuevaMateria() {
    editMateriaIndex = -1;
    modalTitleMateria.textContent = 'Nueva Materia';
    abrirModalMateria();
    formMat.reset();
    limpiarErroresMateria();
}

// Abrir modal
function abrirModalMateria() {
    if (!materiaModal) return;
    materiaModal.style.display = 'flex';
    materiaModal.setAttribute('aria-hidden','false');
}

// Cerrar modal
function cerrarModalMateria() {
    if (!materiaModal) return;
    materiaModal.style.display = 'none';
    materiaModal.setAttribute('aria-hidden','true');
    limpiarErroresMateria();
}

// Limpiar errores del formulario
function limpiarErroresMateria() {
    const ids = ['codigoMateriaError','nombreMateriaError','nivelMateriaError','creditosMateriaError','docenteMateriaError'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.textContent = ''; el.style.display='none'; }
    });
}

// Buscar Ã¬ndice por cÃ³digo de materia
function buscarIndiceMateria(codigo) {
    return materias.findIndex(m => m.codigo === codigo);
}

// Editar materia
function editarMateria(codigo) {
    const idx = buscarIndiceMateria(codigo);
    if (idx === -1) return alert('Materia no encontrada');
    editMateriaIndex = idx;
    modalTitleMateria.textContent = 'Editar Materia';
    abrirModalMateria();
    const mat = materias[idx];
    document.getElementById('codigoMateria').value = mat.codigo || '';
    document.getElementById('nombreMateria').value = mat.nombre || '';
    document.getElementById('nivelMateria').value = mat.nivel || '';
    document.getElementById('creditosMateria').value = mat.creditos || '';
    document.getElementById('docenteMateria').value = mat.docente || '';
}

// Eliminar materia
function eliminarMateria(codigo) {
    if (!confirm('¿Eliminar esta materia?')) return;
    const idx = buscarIndiceMateria(codigo);
    if (idx === -1) return alert('Materia no encontrada');
    materias.splice(idx,1);
    guardarMaterias();
    renderizarTablaMaterias();
}

// Manejo submit del formulario (nuevo/editar)
if (formMat) {
    formMat.addEventListener('submit', function(e){
        e.preventDefault();
        limpiarErroresMateria();

        const codigo = document.getElementById('codigoMateria').value.trim();
        const nombre = document.getElementById('nombreMateria').value.trim();
        const nivel = document.getElementById('nivelMateria').value;
        const creditos = document.getElementById('creditosMateria').value;
        const docente = document.getElementById('docenteMateria').value.trim();

        let isValid = true;

        // Validaciones
        if (codigo === '' || codigo.length < 3) {
            mostrarError('codigoMateriaError','Código inválido');
            isValid = false;
        }
        if (nombre === '' || nombre.length < 3) {
            mostrarError('nombreMateriaError','Nombre inválido');
            isValid = false;
        }
        if (nivel === '') {
            mostrarError('nivelMateriaError','Seleccione un nivel');
            isValid = false;
        }
        if (creditos === '' || creditos < 1 || creditos > 200) {
            mostrarError('creditosMateriaError','Créditos entre 1 y200');
            isValid = false;
        }
        if (docente === '' || !/^[a-zA-ZÃ¡Ã©Ã-Ã³ÃºÃÃ‰ÃÃ“ÃšÃ±Ã‘\s]+$/.test(docente)) {
            mostrarError('docenteMateriaError','Nombre de docente inválido');
            isValid = false;
        }

        if (!isValid) return;

        const nueva = { codigo, nombre, nivel, creditos, docente };

        if (editMateriaIndex >= 0) {
            // evitar duplicar código con otro registro
            const otherIdx = materias.findIndex((m,i)=>m.codigo===codigo && i!==editMateriaIndex);
            if (otherIdx !== -1) {
                mostrarError('codigoMateriaError','Código ya existe para otra materia');
                return;
            }
            materias[editMateriaIndex] = nueva;
        } else {
            if (buscarIndiceMateria(codigo) !== -1) {
                mostrarError('codigoMateriaError','Código ya existe');
                return;
            }
            materias.push(nueva);
        }

        guardarMaterias();
        renderizarTablaMaterias();
        cerrarModalMateria();
    });
}

// Inicializar al cargar página
document.addEventListener('DOMContentLoaded', function(){
    cargarMaterias();
    renderizarTablaMaterias();
    if (materiaModal) materiaModal.style.display='none';
});
// Cargar estudiantes automáticamente al seleccionar materia
document.addEventListener('DOMContentLoaded', function() {
    const materiaSelect = document.getElementById('materiaAsistencia');
    if (materiaSelect) {
        materiaSelect.addEventListener('change', function() {
            loadStudents(); // Se ejecuta automáticamente al seleccionar
        });
    }
});
// PANEL ESTUDIANTE
// Datos del estudiante actual (dinámico: viene de la sesión)
let currentStudent = null;

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('panel_estudiante.html')) {
        // Obtener datos del usuario actual
        const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual') || 'null');
        if (!usuarioActual || usuarioActual.tipo !== 'estudiante') {
            // Si no hay sesión válida, redirigir al login
            window.location.href = 'index.html';
            return;
        }
        
        // Buscar datos completos del estudiante en localStorage
        const estudiantes = JSON.parse(localStorage.getItem('estudiantes') || '[]');
        currentStudent = estudiantes.find(est => est.email === usuarioActual.email) || {
            matricula: usuarioActual.matricula,
            nombres: usuarioActual.nombres,
            apellidos: usuarioActual.apellidos,
            email: usuarioActual.email
        };
        
        initializeData();
        
        // Cerrar modal al hacer clic fuera
        const modal = document.getElementById('justifyModal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeJustifyModal();
                }
            });
        }
        
        // Agregar listener al formulario de justificación
        const justifyForm = document.getElementById('justifyForm');
        if (justifyForm) {
            justifyForm.addEventListener('submit', submitJustification);
        }
    }
});

// Inicializar datos al cargar la página
function initializeData() {
    cargarMaterias();
    cargarAsistenciasEstudiante();
    cargarJustificacionesEstudiante();
    updateDashboard();
    renderAttendanceTable();
    renderJustificacionesTable();
    populateFilterMaterias();
}

// Cargar materias desde localStorage
function cargarMaterias() {
    materias = JSON.parse(localStorage.getItem('materias') || '[]');
    
    // Si no hay materias, crear algunas de ejemplo
    if (materias.length === 0) {
        materias = [
            { codigo: 'IS-001', nombre: 'Ingeniería de Software', nivel: '7' },
            { codigo: 'BD-002', nombre: 'Base de Datos', nivel: '7' },
            { codigo: 'RC-003', nombre: 'Redes de Computadoras', nivel: '7' }
        ];
        localStorage.setItem('materias', JSON.stringify(materias));
    }
}

// Cargar asistencias del estudiante
function cargarAsistenciasEstudiante() {
    const allAsistencias = JSON.parse(localStorage.getItem('asistencias') || '[]');
    asistencias = allAsistencias.filter(a => a.matricula === currentStudent.matricula);
}

// Cargar justificaciones del estudiante
function cargarJustificacionesEstudiante() {
    justificaciones = JSON.parse(localStorage.getItem('justificaciones') || '[]')
        .filter(j => j.matricula === currentStudent.matricula);
}

// Actualizar dashboard del estudiante
function updateDashboard() {
    // Mostrar nombre del estudiante
    const studentNameEl = document.getElementById('studentName');
    if (studentNameEl) {
        studentNameEl.textContent = `${currentStudent.nombres} ${currentStudent.apellidos}`;
    }

    // Calcular estadísticas
    const totalPresent = asistencias.filter(a => a.estado === 'presente').length;
    const totalAbsent = asistencias.filter(a => a.estado === 'ausente').length;
    const totalPending = justificaciones.filter(j => j.estado === 'pendiente').length;

    // Actualizar contadores
    const presentEl = document.getElementById('totalPresent');
    const absentEl = document.getElementById('totalAbsent');
    const pendingEl = document.getElementById('totalPending');

    if (presentEl) presentEl.textContent = totalPresent;
    if (absentEl) absentEl.textContent = totalAbsent;
    if (pendingEl) pendingEl.textContent = totalPending;

    // Renderizar tabla resumen
    renderSummaryTable();
}

// Renderizar tabla resumen por materia
function renderSummaryTable() {
    const summaryBody = document.getElementById('summaryTableBody');
    if (!summaryBody) return;

    summaryBody.innerHTML = '';

    // Calcular resumen por materia
    const summary = {};
    asistencias.forEach(a => {
        if (!summary[a.materia]) {
            summary[a.materia] = { presente: 0, ausente: 0, total: 0 };
        }
        summary[a.materia].total++;
        if (a.estado === 'presente') summary[a.materia].presente++;
        if (a.estado === 'ausente') summary[a.materia].ausente++;
    });
    
    // Renderizar filas
    Object.keys(summary).forEach(materia => {
        const data = summary[materia];
        const porcentaje = ((data.presente / data.total) * 100).toFixed(1);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${materia}</td>
            <td>${data.presente}</td>
            <td>${data.ausente}</td>
            <td><strong>${porcentaje}%</strong></td>
        `;
        summaryBody.appendChild(tr);
    });
    
    // Si no hay datos
    if (Object.keys(summary).length === 0) {
        summaryBody.innerHTML = '<tr><td colspan="4" class="empty-cell">No hay datos disponibles</td></tr>';
    }
}

// Renderizar tabla de asistencias
function renderAttendanceTable() {
    const tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const filtered = getFilteredAttendance();

    filtered.forEach(a => {
        const tr = document.createElement('tr');
        const statusClass = `status-${a.estado}`;
        const statusText = a.estado.charAt(0).toUpperCase() + a.estado.slice(1);
        
        // Verificar si puede justificar
        const canJustify = a.estado === 'ausente' && 
            !justificaciones.some(j => j.attendanceId === a.id);

        tr.innerHTML = `
            <td>${new Date(a.fecha).toLocaleDateString('es-EC')}</td>
            <td>${a.materia}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                ${canJustify ? 
                    `<button class="btn-justify" onclick="openJustifyModal(${a.id})">Justificar</button>` : 
                    a.estado === 'ausente' ? 
                    '<span class="text-light">Ya justificada</span>' : 
                    '-'
                }
            </td>
            <td>
                <input type="text" 
                    placeholder="Observación / Justificación"
                    value="${a.observacion || ''}"
                    style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 6px;"
                    readonly>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-cell">No hay registros</td></tr>';
    }
}

// Obtener asistencias filtradas
function getFilteredAttendance() {
    const materiaFilter = document.getElementById('filterMateria')?.value || '';
    const estadoFilter = document.getElementById('filterEstado')?.value || '';

    return asistencias.filter(a => {
        if (materiaFilter && a.materia !== materiaFilter) return false;
        if (estadoFilter && a.estado !== estadoFilter) return false;
        return true;
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

// Filtrar asistencias
function filterAttendance() {
    renderAttendanceTable();
}

// Poblar filtro de materias
function populateFilterMaterias() {
    const select = document.getElementById('filterMateria');
    if (!select) return;

    const uniqueMaterias = [...new Set(asistencias.map(a => a.materia))];
    
    uniqueMaterias.forEach(m => {
        const option = document.createElement('option');
        option.value = m;
        option.textContent = m;
        select.appendChild(option);
    });
}

// Renderizar tabla de justificaciones
function renderJustificacionesTable() {
    const tbody = document.getElementById('justificacionesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (justificaciones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">No hay justificaciones registradas</td></tr>';
        return;
    }

    justificaciones
        .sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))
        .forEach(j => {
            const tr = document.createElement('tr');
            const statusColors = {
                pendiente: '#fff3cd',
                aprobada: '#d4edda',
                aprobado: '#d4edda',
                rechazada: '#f8d7da',
                rechazado: '#f8d7da'
            };
            
            tr.innerHTML = `
                <td>${new Date(j.fechaFalta).toLocaleDateString('es-EC')}</td>
                <td>${j.materia}</td>
                <td>${j.tipo.charAt(0).toUpperCase() + j.tipo.slice(1)}</td>
                <td>${j.motivo.substring(0, 50)}${j.motivo.length > 50 ? '...' : ''}</td>
                <td><span class="status-badge status-${j.estado}">
                    ${j.estado.charAt(0).toUpperCase() + j.estado.slice(1)}
                </span></td>
                <td>${new Date(j.fechaSolicitud).toLocaleDateString('es-EC')}</td>
            `;
            tbody.appendChild(tr);
        });
}

// Abrir modal de justificación
function openJustifyModal(attendanceId) {
    const id = parseFloat(attendanceId);
    const attendance = asistencias.find(a => a.id === id || a.id == id);
    if (!attendance) return;

    document.getElementById('justifyAttendanceId').value = id;
    document.getElementById('justifyMateria').value = attendance.materia;
    document.getElementById('justifyFecha').value = new Date(attendance.fecha).toLocaleDateString('es-EC');
    document.getElementById('justifyTipo').value = '';
    document.getElementById('justifyMotivo').value = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('fileName').textContent = '📎 Haga clic para seleccionar un archivo';

    const modal = document.getElementById('justifyModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Cerrar modal de justificación
function closeJustifyModal() {
    const modal = document.getElementById('justifyModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Manejar selección de archivo
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('El archivo es demasiado grande. Tamaño máximo: 5MB');
            event.target.value = '';
            return;
        }
        document.getElementById('fileName').textContent = `📎 ${file.name}`;
    }
}

// Enviar justificación
function submitJustification(event) {
    event.preventDefault();

    const attendanceId = parseFloat(document.getElementById('justifyAttendanceId').value);
    const tipo = document.getElementById('justifyTipo').value;
    const motivo = document.getElementById('justifyMotivo').value;
    const file = document.getElementById('fileInput').files[0];

    if (!tipo || !motivo) {
        alert('Por favor complete todos los campos obligatorios');
        return;
    }

    const attendance = asistencias.find(a => a.id === attendanceId || a.id == attendanceId);
    if (!attendance) {
        alert('Error: No se encontró la asistencia');
        return;
    }
    
    const justificacion = {
        id: Date.now(),
        attendanceId: attendanceId,
        matricula: currentStudent.matricula,
        nombres: currentStudent.nombres,
        apellidos: currentStudent.apellidos,
        email: currentStudent.email,
        materia: attendance.materia,
        codigoMateria: attendance.codigoMateria,
        fechaFalta: attendance.fecha,
        tipo: tipo,
        motivo: motivo,
        archivo: file ? file.name : null,
        estado: 'pendiente',
        fechaSolicitud: new Date().toISOString(),
        observaciones: null
    };

    // Guardar en localStorage de forma global
    const allJustificaciones = JSON.parse(localStorage.getItem('justificaciones') || '[]');
    allJustificaciones.push(justificacion);
    localStorage.setItem('justificaciones', JSON.stringify(allJustificaciones));

    // Crear notificación para el docente
    crearNotificacionDocente(justificacion);

    alert('Justificación enviada exitosamente. El docente la revisará pronto.');
    
    closeJustifyModal();
    
    // Limpiar el formulario
    document.getElementById('justifyForm').reset();
    document.getElementById('fileName').textContent = '📎 Haga clic para seleccionar un archivo';
    
    cargarJustificacionesEstudiante();
    updateDashboard();
    renderAttendanceTable();
    renderJustificacionesTable();
}
// Cambiar entre secciones del panel
function showSection(section) {
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('asistenciasSection').style.display = 'none';
    document.getElementById('justificacionesSection').style.display = 'none';

    document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));

    if (section === 'dashboard') {
        document.getElementById('dashboardSection').style.display = 'block';
        const links = document.querySelectorAll('.menu a');
        if (links[0]) links[0].classList.add('active');
    } else if (section === 'asistencias') {
        document.getElementById('asistenciasSection').style.display = 'block';
        const links = document.querySelectorAll('.menu a');
        if (links[1]) links[1].classList.add('active');
    } else if (section === 'justificaciones') {
        document.getElementById('justificacionesSection').style.display = 'block';
        const links = document.querySelectorAll('.menu a');
        if (links[2]) links[2].classList.add('active');
    }
}

// ========== FUNCIONES DE NOTIFICACIONES PARA EL DOCENTE ==========

// Abrir modal de notificaciones
function abrirNotificaciones() {
    const modal = document.getElementById('modalNotificaciones');
    if (modal) {
        modal.style.display = 'flex';
        cargarNotificacionesDocente();
    }
}

// Cerrar modal de notificaciones
function cerrarNotificaciones() {
    const modal = document.getElementById('modalNotificaciones');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Cargar y mostrar notificaciones del docente
function cargarNotificacionesDocente() {
    const notificaciones = JSON.parse(localStorage.getItem('notificacionesDocente') || '[]');
    const notificacionesPendientes = notificaciones.filter(n => n.estado === 'no_leida');
    const notificacionesList = document.getElementById('notificacionesList');
    
    if (!notificacionesList) return;
    
    if (notificacionesPendientes.length === 0) {
        notificacionesList.innerHTML = '<p class="empty-cell">No hay notificaciones pendientes</p>';
        return;
    }
    
    notificacionesList.innerHTML = '';
    
    notificacionesPendientes.forEach(notif => {
        const div = document.createElement('div');
        div.className = 'notification-card';
        div.innerHTML = `
            <h4 class="notif-title">${notif.titulo}</h4>
            <p class="notif-message">${notif.mensaje}</p>
            <small class="notif-date">📅 ${new Date(notif.fechaCreacion).toLocaleString('es-EC')}</small>
            <div class="notif-actions">
                <button class="btn-primary btn-small" onclick="abrirRevisarJustificacion(${JSON.stringify(notif.detalles).replace(/"/g, '&quot;')}, ${notif.id})">
                    Ver Justificación
                </button>
            </div>
        `;
        notificacionesList.appendChild(div);
    });
    
    // Actualizar badge
    actualizarBadgeNotificaciones();
}

// Actualizar badge de notificaciones
function actualizarBadgeNotificaciones() {
    const notificaciones = JSON.parse(localStorage.getItem('notificacionesDocente') || '[]');
    const pendientes = notificaciones.filter(n => n.estado === 'no_leida').length;
    const badge = document.getElementById('badgeNotificaciones');
    
    if (badge) {
        if (pendientes > 0) {
            badge.textContent = pendientes;
            badge.classList.add('badge-active');
        } else {
            badge.classList.remove('badge-active');
        }
    }
}

// Abrir modal para revisar justificación
function abrirRevisarJustificacion(detalles, notificacionId) {
    document.getElementById('revNombre').textContent = `${detalles.estudianteNombres} ${detalles.estudianteApellidos}`;
    document.getElementById('revEmail').textContent = detalles.estudianteEmail;
    document.getElementById('revMateria').textContent = detalles.materia;
    document.getElementById('revFecha').textContent = new Date(detalles.fechaFalta).toLocaleDateString('es-EC');
    document.getElementById('revTipo').textContent = detalles.tipoJustificacion;
    document.getElementById('revMotivo').textContent = detalles.motivo;
    document.getElementById('revFechaSolicitud').textContent = new Date(new Date().toISOString()).toLocaleString('es-EC');
    
    // Guardar el ID de justificación actual
    document.getElementById('modalRevisarJustificacion').dataset.justificacionId = detalles.justificacionId;
    document.getElementById('modalRevisarJustificacion').dataset.notificacionId = notificacionId;
    
    const modal = document.getElementById('modalRevisarJustificacion');
    if (modal) {
        modal.style.display = 'flex';
    }
    
    cerrarNotificaciones();
}

// Cerrar modal de revisar justificación
function cerrarRevisarJustificacion() {
    const modal = document.getElementById('modalRevisarJustificacion');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Aprobar justificación
function aprobarJustificacion() {
    const modal = document.getElementById('modalRevisarJustificacion');
    const justificacionId = modal.dataset.justificacionId;
    const notificacionId = modal.dataset.notificacionId;
    
    actualizarEstadoJustificacion(parseInt(justificacionId), 'aprobada');
    actualizarEstadoNotificacion(parseInt(notificacionId), 'leida');
    
    mostrarNotificacion('✓ Justificación aprobada exitosamente', 'success');
    cerrarRevisarJustificacion();
    actualizarBadgeNotificaciones();
}

// Rechazar justificación
function rechazarJustificacion() {
    const modal = document.getElementById('modalRevisarJustificacion');
    const justificacionId = modal.dataset.justificacionId;
    const notificacionId = modal.dataset.notificacionId;
    const razon = prompt('Ingrese la razón del rechazo:');
    
    if (razon === null) return;
    
    actualizarEstadoJustificacion(parseInt(justificacionId), 'rechazada', razon);
    actualizarEstadoNotificacion(parseInt(notificacionId), 'leida');
    
    mostrarNotificacion('✗ Justificación rechazada', 'error');
    cerrarRevisarJustificacion();
    actualizarBadgeNotificaciones();
}

// Actualizar estado de justificación
function actualizarEstadoJustificacion(justificacionId, nuevoEstado, observacion = null) {
    const justificaciones = JSON.parse(localStorage.getItem('justificaciones') || '[]');
    const justificacion = justificaciones.find(j => j.id === justificacionId);
    
    if (justificacion) {
        justificacion.estado = nuevoEstado;
        if (observacion) {
            justificacion.observaciones = observacion;
        }
        justificacion.fechaRevision = new Date().toISOString();
        
        localStorage.setItem('justificaciones', JSON.stringify(justificaciones));
    }
}

// Actualizar estado de notificación
function actualizarEstadoNotificacion(notificacionId, nuevoEstado) {
    const notificaciones = JSON.parse(localStorage.getItem('notificacionesDocente') || '[]');
    const notificacion = notificaciones.find(n => n.id === notificacionId);
    
    if (notificacion) {
        notificacion.estado = nuevoEstado;
        localStorage.setItem('notificacionesDocente', JSON.stringify(notificaciones));
    }
}

// Crear notificación para el docente cuando se justifica una falta
function crearNotificacionDocente(justificacion) {
    const notificaciones = JSON.parse(localStorage.getItem('notificacionesDocente') || '[]');
    
    const notificacion = {
        id: Date.now(),
        tipo: 'justificacion_pendiente',
        titulo: '📝 Nueva Justificación de Falta',
        mensaje: `${justificacion.nombres} ${justificacion.apellidos} ha justificado una falta de ${justificacion.materia}`,
        detalles: {
            estudianteMatricula: justificacion.matricula,
            estudianteNombres: justificacion.nombres,
            estudianteApellidos: justificacion.apellidos,
            estudianteEmail: justificacion.email,
            materia: justificacion.materia,
            fechaFalta: justificacion.fechaFalta,
            tipoJustificacion: justificacion.tipo,
            motivo: justificacion.motivo,
            justificacionId: justificacion.id
        },
        estado: 'no_leida',
        fechaCreacion: new Date().toISOString(),
        accion: 'revisar_justificacion'
    };
    
    notificaciones.push(notificacion);
    localStorage.setItem('notificacionesDocente', JSON.stringify(notificaciones));
}

// Generar Reportes
function generarReporte(tipoReporte, fechaInicio, fechaFin) {
    cargarLocalStorage();
    
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    const asistenciasEnRango = asistencias.filter(a => {
        const fecha = new Date(a.fecha);
        return fecha >= inicio && fecha <= fin;
    });
    
    if (asistenciasEnRango.length === 0) {
        alert('No hay datos para generar el reporte en el rango de fechas seleccionado');
        return;
    }
    
    // Crear PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Agregar fondo y diseño
    doc.setFillColor(240, 248, 255); // Fondo azul claro
    doc.rect(0, 0, 210, 40, 'F');
    
    // Título principal
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.text('ULEAM - REPORTE DE ASISTENCIA', 20, 18);
    
    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 51, 102);
    doc.line(20, 25, 190, 25);
    
    // Información del reporte
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Tipo: ${tipoReporte.charAt(0).toUpperCase() + tipoReporte.slice(1)}`, 20, 35);
    
    // Mostrar período académico en todos los reportes
    let periodoTexto = `${inicio.toLocaleDateString('es-EC')} a ${fin.toLocaleDateString('es-EC')}`;
    
    const mes1 = inicio.getMonth() + 1;
    const year1 = inicio.getFullYear();
    const mes2 = fin.getMonth() + 1;
    const year2 = fin.getFullYear();
    
    let sem1, sem2;
    if (mes1 >= 4 && mes1 <= 7) sem1 = 1; else if (mes1 >= 9 && mes1 <= 12) sem1 = 2; else sem1 = (mes1 <= 3) ? 2 : 1;
    if (mes2 >= 4 && mes2 <= 7) sem2 = 1; else if (mes2 >= 9 && mes2 <= 12) sem2 = 2; else sem2 = (mes2 <= 3) ? 2 : 1;
    
    periodoTexto = `${year1}-${sem1} a ${year2}-${sem2}`;
    
    doc.text(`Período: ${periodoTexto}`, 20, 43);
    doc.text(`Generado: ${new Date().toLocaleString('es-EC')}`, 20, 51);
    
    let yPosition = 65;
    
    if (tipoReporte === 'estudiante') {
        yPosition = generarReportePorEstudiantePDF(doc, asistenciasEnRango, yPosition);
    } else if (tipoReporte === 'materia') {
        yPosition = generarReportePorMateriaPDF(doc, asistenciasEnRango, yPosition);
    } else if (tipoReporte === 'periodo') {
        yPosition = generarReportePorPeriodoPDF(doc, asistenciasEnRango, yPosition);
    } else if (tipoReporte === 'general') {
        yPosition = generarReporteGeneralPDF(doc, asistenciasEnRango, yPosition);
    }
    
    doc.save(`reporte_${tipoReporte}_${new Date().getTime()}.pdf`);
    mostrarNotificacion('Reporte PDF generado exitosamente', 'success');
}


function generarReportePorEstudiantePDF(doc, asistencias, yStart) {
    // Encabezado de sección
    doc.setFillColor(230, 240, 255);
    doc.rect(20, yStart - 5, 170, 10, 'F');
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text('REPORTE POR ESTUDIANTE', 20, yStart);
    doc.setTextColor(0, 0, 0);
    yStart += 15;
    
    const porEstudiante = {};
    asistencias.forEach(a => {
        const key = a.matricula;
        if (!porEstudiante[key]) {
            porEstudiante[key] = {
                nombres: a.nombres,
                apellidos: a.apellidos,
                email: a.email,
                presente: 0,
                ausente: 0,
                total: 0
            };
        }
        porEstudiante[key].total++;
        if (a.estado === 'presente') porEstudiante[key].presente++;
        else if (a.estado === 'ausente') porEstudiante[key].ausente++;
    });
    
    doc.setFontSize(10);
    Object.values(porEstudiante).forEach(est => {
        const porcentaje = ((est.presente / est.total) * 100).toFixed(2);
        
        if (yStart > 250) {
            doc.addPage();
            yStart = 20;
        }
        
        doc.text(`Estudiante: ${est.nombres} ${est.apellidos}`, 20, yStart);
        yStart += 7;
        doc.text(`Email: ${est.email}`, 20, yStart);
        yStart += 7;
        doc.text(`Asistencias: ${est.presente} | Inasistencias: ${est.ausente} | Total: ${est.total}`, 20, yStart);
        yStart += 7;
        doc.text(`Porcentaje: ${porcentaje}%`, 20, yStart);
        yStart += 10;
    });
    
    return yStart;
}

function generarReportePorMateriaPDF(doc, asistencias, yStart) {
    // Encabezado de sección
    doc.setFillColor(230, 240, 255);
    doc.rect(20, yStart - 5, 170, 10, 'F');
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text('REPORTE POR MATERIA', 20, yStart);
    doc.setTextColor(0, 0, 0);
    yStart += 15;
    
    const porMateria = {};
    asistencias.forEach(a => {
        const key = a.materia;
        if (!porMateria[key]) {
            porMateria[key] = {
                presente: 0,
                ausente: 0,
                total: 0
            };
        }
        porMateria[key].total++;
        if (a.estado === 'presente') porMateria[key].presente++;
        else if (a.estado === 'ausente') porMateria[key].ausente++;
    });
    
    doc.setFontSize(10);
    Object.entries(porMateria).forEach(([materia, datos]) => {
        const porcentaje = ((datos.presente / datos.total) * 100).toFixed(2);
        
        if (yStart > 250) {
            doc.addPage();
            yStart = 20;
        }
        
        doc.text(`Materia: ${materia}`, 20, yStart);
        yStart += 7;
        doc.text(`Asistencias: ${datos.presente} | Inasistencias: ${datos.ausente} | Total: ${datos.total}`, 20, yStart);
        yStart += 7;
        doc.text(`Porcentaje Promedio: ${porcentaje}%`, 20, yStart);
        yStart += 10;
    });
    
    return yStart;
}

function generarReportePorPeriodoPDF(doc, asistencias, yStart) {
    // Encabezado de sección
    doc.setFillColor(230, 240, 255);
    doc.rect(20, yStart - 5, 170, 10, 'F');
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text('REPORTE POR PERÍODO', 20, yStart);
    doc.setTextColor(0, 0, 0);
    yStart += 15;
    
    const porPeriodo = {};
    asistencias.forEach(a => {
        const fecha = new Date(a.fecha);
        const year = fecha.getFullYear();
        const mes = fecha.getMonth() + 1; // Meses de 1 a 12
        // Semestre 1: abril-julio (4-7), Semestre 2: septiembre-enero (9-12, 1)
        let semestre, periodoYear;
        if (mes >= 4 && mes <= 7) {
            semestre = 1;
            periodoYear = year;
        } else if (mes >= 9 && mes <= 12) {
            semestre = 2;
            periodoYear = year;
        } else if (mes >= 1 && mes <= 3) {
            semestre = 2;
            periodoYear = year - 1;
        } else {
            semestre = 1;
            periodoYear = year + 1;
        }
        const periodo = `${periodoYear}-${semestre}`;
        
        if (!porPeriodo[periodo]) {
            porPeriodo[periodo] = {
                presente: 0,
                ausente: 0,
                total: 0
            };
        }
        porPeriodo[periodo].total++;
        if (a.estado === 'presente') porPeriodo[periodo].presente++;
        else if (a.estado === 'ausente') porPeriodo[periodo].ausente++;
    });
    
    doc.setFontSize(10);
    Object.entries(porPeriodo)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([periodo, datos]) => {
            const porcentaje = ((datos.presente / datos.total) * 100).toFixed(2);
            
            if (yStart > 250) {
                doc.addPage();
                yStart = 20;
            }
            
            doc.text(`Período: ${periodo}`, 20, yStart);
            yStart += 7;
            doc.text(`Asistencias: ${datos.presente} | Inasistencias: ${datos.ausente} | Total: ${datos.total}`, 20, yStart);
            yStart += 7;
            doc.text(`Porcentaje: ${porcentaje}%`, 20, yStart);
        yStart += 10;
    });
    
    return yStart;
}

function generarReporteGeneralPDF(doc, asistencias, yStart) {
    // Encabezado de sección
    doc.setFillColor(230, 240, 255);
    doc.rect(20, yStart - 5, 170, 10, 'F');
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text('REPORTE GENERAL', 20, yStart);
    doc.setTextColor(0, 0, 0);
    yStart += 15;
    
    let totalPresente = 0;
    let totalAusente = 0;
    let totalAsistencias = asistencias.length;
    const materias = new Set();
    const estudiantes = new Set();
    
    asistencias.forEach(a => {
        if (a.estado === 'presente') totalPresente++;
        else if (a.estado === 'ausente') totalAusente++;
        materias.add(a.materia);
        estudiantes.add(a.matricula);
    });
    
    const porcentaje = ((totalPresente / totalAsistencias) * 100).toFixed(2);
    
    doc.setFontSize(11);
    doc.text(`Total de Registros: ${totalAsistencias}`, 20, yStart);
    yStart += 8;
    doc.text(`Asistencias: ${totalPresente}`, 20, yStart);
    yStart += 8;
    doc.text(`Inasistencias: ${totalAusente}`, 20, yStart);
    yStart += 8;
    doc.text(`Porcentaje General: ${porcentaje}%`, 20, yStart);
    yStart += 8;
    doc.text(`Materias Reportadas: ${materias.size}`, 20, yStart);
    yStart += 8;
    doc.text(`Estudiantes Reportados: ${estudiantes.size}`, 20, yStart);
    yStart += 15;
    
    return yStart;
}

// Cerrar sesión (usar la función global ya definida)
function logout() {
    cerrarSesion();
}

// ==================== FUNCIONES DE EXPORTACIÓN E IMPORTACIÓN ====================

// Exportar asistencias a JSON
function exportarJSON() {
    cargarLocalStorage();
    
    if (asistencias.length === 0) {
        alert('No hay asistencias para exportar');
        return;
    }
    
    const datos = {
        fecha_exportacion: new Date().toISOString(),
        total_registros: asistencias.length,
        asistencias: asistencias
    };
    
    const jsonString = JSON.stringify(datos, null, 2);
    descargarArchivo(jsonString, `asistencias_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    
    mostrarNotificacion('✓ Archivo JSON exportado exitosamente', 'success');
}

// Exportar asistencias a XML
function exportarXML() {
    cargarLocalStorage();
    
    if (asistencias.length === 0) {
        alert('No hay asistencias para exportar');
        return;
    }
    
    let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlString += '<asistencias>\n';
    xmlString += `\t<fecha_exportacion>${new Date().toISOString()}</fecha_exportacion>\n`;
    xmlString += `\t<total_registros>${asistencias.length}</total_registros>\n`;
    xmlString += '\t<registros>\n';
    
    asistencias.forEach(asistencia => {
        xmlString += '\t\t<registro>\n';
        xmlString += `\t\t\t<id>${escapeXML(asistencia.id)}</id>\n`;
        xmlString += `\t\t\t<matricula>${escapeXML(asistencia.matricula)}</matricula>\n`;
        xmlString += `\t\t\t<nombres>${escapeXML(asistencia.nombres)}</nombres>\n`;
        xmlString += `\t\t\t<apellidos>${escapeXML(asistencia.apellidos)}</apellidos>\n`;
        xmlString += `\t\t\t<email>${escapeXML(asistencia.email)}</email>\n`;
        xmlString += `\t\t\t<materia>${escapeXML(asistencia.materia)}</materia>\n`;
        xmlString += `\t\t\t<codigo_materia>${escapeXML(asistencia.codigoMateria)}</codigo_materia>\n`;
        xmlString += `\t\t\t<fecha>${escapeXML(asistencia.fecha)}</fecha>\n`;
        xmlString += `\t\t\t<estado>${escapeXML(asistencia.estado)}</estado>\n`;
        xmlString += `\t\t\t<observacion>${escapeXML(asistencia.observacion || '')}</observacion>\n`;
        xmlString += `\t\t\t<registrado_por>${escapeXML(asistencia.registradoPor)}</registrado_por>\n`;
        xmlString += `\t\t\t<fecha_registro>${escapeXML(asistencia.fechaRegistro)}</fecha_registro>\n`;
        xmlString += '\t\t</registro>\n';
    });
    
    xmlString += '\t</registros>\n';
    xmlString += '</asistencias>';
    
    descargarArchivo(xmlString, `asistencias_${new Date().toISOString().split('T')[0]}.xml`, 'application/xml');
    
    mostrarNotificacion('✓ Archivo XML exportado exitosamente', 'success');
}

// Función auxiliar para escapar caracteres XML
function escapeXML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Función para descargar archivo
function descargarArchivo(contenido, nombreArchivo, tipo) {
    const blob = new Blob([contenido], { type: tipo });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Importar datos desde JSON o XML
function importarArchivo(event) {
    const archivo = event.target.files[0];
    
    if (!archivo) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const contenido = e.target.result;
            const extension = archivo.name.split('.').pop().toLowerCase();
            
            if (extension === 'json') {
                importarJSON(contenido);
            } else if (extension === 'xml') {
                importarXML(contenido);
            } else {
                alert('Formato de archivo no soportado. Usa JSON o XML');
            }
        } catch (error) {
            console.error('Error al importar:', error);
            alert('Error al procesar el archivo: ' + error.message);
        }
    };
    
    reader.readAsText(archivo);
    
    // Limpiar el input para permitir importar el mismo archivo nuevamente
    event.target.value = '';
}

// Importar datos desde JSON
function importarJSON(contenido) {
    try {
        const datos = JSON.parse(contenido);
        
        if (!datos.asistencias || !Array.isArray(datos.asistencias)) {
            throw new Error('Formato JSON inválido. Debe contener un array "asistencias"');
        }
        
        const confirmacion = confirm(`Se importarán ${datos.asistencias.length} registros de asistencia. ¿Deseas continuar?`);
        
        if (!confirmacion) return;
        
        // Combinar registros existentes con los nuevos
        const registrosNuevos = datos.asistencias.filter(reg => {
            return !asistencias.some(a => 
                a.matricula === reg.matricula && 
                a.fecha === reg.fecha && 
                a.codigoMateria === reg.codigoMateria
            );
        });
        
        asistencias = [...asistencias, ...registrosNuevos];
        localStorage.setItem('asistencias', JSON.stringify(asistencias));
        
        mostrarNotificacion(`✓ ${registrosNuevos.length} registros importados exitosamente`, 'success');
        
    } catch (error) {
        alert('Error al importar JSON: ' + error.message);
    }
}

// Importar datos desde XML
function importarXML(contenido) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(contenido, 'application/xml');
        
        if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
            throw new Error('Formato XML inválido');
        }
        
        const registros = xmlDoc.getElementsByTagName('registro');
        
        if (registros.length === 0) {
            throw new Error('No se encontraron registros en el archivo XML');
        }
        
        const confirmacion = confirm(`Se importarán ${registros.length} registros de asistencia. ¿Deseas continuar?`);
        
        if (!confirmacion) return;
        
        let registrosImportados = 0;
        
        for (let i = 0; i < registros.length; i++) {
            const registro = registros[i];
            
            const getElementValue = (elementName) => {
                const elements = registro.getElementsByTagName(elementName);
                return elements.length > 0 ? elements[0].textContent : '';
            };
            
            const nuevoRegistro = {
                id: getElementValue('id') || Date.now() + Math.random(),
                matricula: getElementValue('matricula'),
                nombres: getElementValue('nombres'),
                apellidos: getElementValue('apellidos'),
                email: getElementValue('email'),
                materia: getElementValue('materia'),
                codigoMateria: getElementValue('codigo_materia'),
                fecha: getElementValue('fecha'),
                estado: getElementValue('estado'),
                observacion: getElementValue('observacion'),
                registradoPor: getElementValue('registrado_por'),
                fechaRegistro: getElementValue('fecha_registro') || new Date().toISOString()
            };
            
            // Verificar si ya existe un registro similar
            const existente = asistencias.some(a => 
                a.matricula === nuevoRegistro.matricula && 
                a.fecha === nuevoRegistro.fecha && 
                a.codigoMateria === nuevoRegistro.codigoMateria
            );
            
            if (!existente) {
                asistencias.push(nuevoRegistro);
                registrosImportados++;
            }
        }
        
        localStorage.setItem('asistencias', JSON.stringify(asistencias));
        
        mostrarNotificacion(`✓ ${registrosImportados} registros importados exitosamente`, 'success');
        
    } catch (error) {
        alert('Error al importar XML: ' + error.message);
    }
}

// ==================== FUNCIONES DE SESIÓN ====================

// Verificar si hay una sesión activa
function verificarSesion() {
    const sesionActiva = sessionStorage.getItem('sesionActiva');
    const usuarioSesion = sessionStorage.getItem('usuarioSesion');
    
    if (sesionActiva && usuarioSesion) {
        return JSON.parse(sesionActiva);
    }
    return null;
}

// Obtener información de la sesión actual
function obtenerInfoSesion() {
    const sesion = verificarSesion();
    if (sesion) {
        return {
            email: sesion.email,
            tipo: sesion.tipo,
            horaLogin: sesion.horaLogin,
            tiempoSesion: calcularTiempoSesion(sesion.fechaLogin)
        };
    }
    return null;
}

// Calcular tiempo de sesión
function calcularTiempoSesion(fechaLogin) {
    const ahora = new Date();
    const login = new Date(fechaLogin);
    const diferencia = Math.floor((ahora - login) / 1000); // segundos
    
    if (diferencia < 60) return `${diferencia}s`;
    if (diferencia < 3600) return `${Math.floor(diferencia / 60)}m`;
    return `${Math.floor(diferencia / 3600)}h ${Math.floor((diferencia % 3600) / 60)}m`;
}

// Mostrar información de la sesión en consola (útil para debugging)
function mostrarInfoSesion() {
    const info = obtenerInfoSesion();
    if (info) {
        console.log('=== INFORMACIÓN DE SESIÓN ===');
        console.log(`Email: ${info.email}`);
        console.log(`Tipo: ${info.tipo}`);
        console.log(`Hora de login: ${info.horaLogin}`);
        console.log(`Tiempo de sesión: ${info.tiempoSesion}`);
        console.log('============================');
        return info;
    } else {
        console.log('No hay sesión activa');
        return null;
    }
}

// Renovar sesión (actualiza la información)
function renovarSesion() {
    const sesionActiva = sessionStorage.getItem('sesionActiva');
    if (sesionActiva) {
        const sesion = JSON.parse(sesionActiva);
        sesion.ultimaActividad = new Date().toISOString();
        sessionStorage.setItem('sesionActiva', JSON.stringify(sesion));
        console.log('Sesión renovada');
    }
}

// Mostrar información de sesión en la interfaz
document.addEventListener('DOMContentLoaded', function() {
    const sesion = verificarSesion();
    if (sesion) {
        console.log('=== INFORMACIÓN DE SESIÓN ACTIVA ===');
        console.log(`👤 Usuario: ${sesion.email}`);
        console.log(`🎯 Tipo: ${sesion.tipo.charAt(0).toUpperCase() + sesion.tipo.slice(1)}`);
        console.log(`🕐 Hora de login: ${sesion.horaLogin}`);
        console.log(`📅 Fecha: ${new Date(sesion.fechaLogin).toLocaleDateString('es-ES')}`);
        console.log('=====================================');
        
        // Actualizar información en tiempo real cada segundo
        setInterval(function() {
            const info = obtenerInfoSesion();
            if (info) {
                console.clear();
                console.log('=== INFORMACIÓN DE SESIÓN ACTIVA ===');
                console.log(`👤 Usuario: ${info.email}`);
                console.log(`🎯 Tipo: ${info.tipo.charAt(0).toUpperCase() + info.tipo.slice(1)}`);
                console.log(`🕐 Hora de login: ${info.horaLogin}`);
                console.log(`⏱️ Tiempo en sesión: ${info.tiempoSesion}`);
                console.log('=====================================');
            }
        }, 1000);
    }
});