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
                
                // Guardar sesión actual
                const usuarioActual = {
                    email: email,
                    tipo: esEstudiante ? 'estudiante' : 'docente',
                    fechaLogin: new Date().toISOString()
                };
                localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
                
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
            // Aquí iría el código para guardar el estudiante
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
                <td colspan="4" style="text-align: center; padding: 30px; color: var(--text-light);">
                    No hay estudiantes registrados
                </td>
            </tr>
        `;
        return;
    }
    
    estudiantes.forEach(est => {
        const registroExistente = registrosExistentes.find(r => r.matricula === est.matricula);
        const estadoActual = registroExistente ? registroExistente.estado : null;
        
        if (estadoActual) {
            attendanceData[est.matricula] = estadoActual;
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center;">
                <input type="radio" 
                name="attendance_${est.matricula}" 
                value="ausente"
                ${estadoActual === 'ausente' ? 'checked' : ''}
                onchange="setAttendance('${est.matricula}', this.checked ? 'ausente' : 'presente')"
                style="width: 20px; height: 20px; cursor: pointer;">
            </td>
            <td>
                <input type="text" 
                    placeholder="Observación / Justificación"
                    style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 6px;">
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
        success: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
        error: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
        info: { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' }
    };
    
    const estilo = colores[tipo] || colores.info;
    notif.style.background = estilo.bg;
    notif.style.color = estilo.color;
    notif.style.border = `1px solid ${estilo.border}`;
    notif.textContent = mensaje;
    notif.style.display = 'block';
    
    setTimeout(() => {
        notif.style.display = 'none';
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
            mostrarNotificacion('Generando reporte...', 'info');
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
        // filtro por bÃºsqueda (matrÃ­cula, nombre, apellidos, email)
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

// Buscar Ã­ndice por matrÃ­cula
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
            // evitar duplicar matrÃ­cula con otro registro
            const otherIdx = estudiantes.findIndex((e,i) => e.matricula === matricula && i !== editIndex);
            if (otherIdx !== -1) {
                mostrarError('matriculaError','La matrícula ya existe para otro estudiante');
                return;
            }
            estudiantes[editIndex] = nuevo;
        } else {
            // nuevo: comprobar si matrÃ­cula existe
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
    // Si no hay carreras guardadas, dejamos el array vacÃ­o para que el select
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

// Buscar Ã­ndice por cÃ³digo de materia
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
        if (docente === '' || !/^[a-zA-ZÃ¡Ã©Ã­Ã³ÃºÃÃ‰ÃÃ“ÃšÃ±Ã‘\s]+$/.test(docente)) {
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

// Inicializar al cargar pÃ¡gina
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
