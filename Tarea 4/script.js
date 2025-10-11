// ==========================================
// FUNCIONES DE VALIDACIÓN
// ==========================================

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
    const regex = /^\d{4}-\d{3}$/;
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

// ==========================================
// VALIDACIÓN FORMULARIO DE LOGIN
// ==========================================

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
                mostrarError('emailError', 'Debe usar un correo institucional @uleam.edu.ec o @live.uleam.edu.ec');
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
                alert('Validación exitosa - Formulario listo para enviar');
            }
        });
    }
});

// ==========================================
// VALIDACIÓN FORMULARIO DE ESTUDIANTES
// ==========================================

const formEstudiante = document.getElementById('formEstudiante');
if (formEstudiante) {
    formEstudiante.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        // Limpiar errores previos
        limpiarError('matriculaError');
        limpiarError('cedulaError');
        limpiarError('nombresError');
        limpiarError('apellidosError');
        limpiarError('emailEstudianteError');
        limpiarError('telefonoError');
        limpiarError('carreraError');
        
        // Validar matrícula
        const matricula = document.getElementById('matricula').value.trim();
        if (matricula === '') {
            mostrarError('matriculaError', 'La matrícula es obligatoria');
            isValid = false;
        } else if (!validarMatricula(matricula)) {
            mostrarError('matriculaError', 'Formato inválido. Ejemplo: 2021-001');
            isValid = false;
        }
        
        // Validar cédula
        const cedula = document.getElementById('cedula').value.trim();
        if (cedula === '') {
            mostrarError('cedulaError', 'La cédula es obligatoria');
            isValid = false;
        } else if (!validarCedula(cedula)) {
            mostrarError('cedulaError', 'Cédula ecuatoriana inválida');
            isValid = false;
        }
        
        // Validar nombres
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
        
        // Validar apellidos
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
        
        // Validar email
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
        
        // Validar teléfono
        const telefono = document.getElementById('telefono').value.trim();
        if (telefono === '') {
            mostrarError('telefonoError', 'El teléfono es obligatorio');
            isValid = false;
        } else if (!validarTelefono(telefono)) {
            mostrarError('telefonoError', 'Formato inválido. Debe iniciar con 09 o 08 y tener 10 dígitos');
            isValid = false;
        }
        
        // Validar carrera
        const carrera = document.getElementById('carrera').value;
        if (carrera === '') {
            mostrarError('carreraError', 'Debe seleccionar una carrera');
            isValid = false;
        }
        
        if (isValid) {
            alert('Validación exitosa - Formulario listo para enviar');
        }
    });
    
    // Limitar entrada en campo cédula (solo números, máximo 10)
    document.getElementById('cedula').addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').substring(0, 10);
    });
    
    // Limitar entrada en campo teléfono (solo números, máximo 10)
    document.getElementById('telefono').addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').substring(0, 10);
    });
}

// ==========================================
// VALIDACIÓN FORMULARIO DE MATERIAS
// ==========================================

const formMateria = document.getElementById('formMateria');
if (formMateria) {
    formMateria.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        // Limpiar errores previos
        limpiarError('codigoMateriaError');
        limpiarError('nombreMateriaError');
        limpiarError('nivelMateriaError');
        limpiarError('creditosMateriaError');
        limpiarError('horarioMateriaError');
        
        // Validar código
        const codigo = document.getElementById('codigoMateria').value.trim();
        if (codigo === '') {
            mostrarError('codigoMateriaError', 'El código es obligatorio');
            isValid = false;
        } else if (codigo.length < 3) {
            mostrarError('codigoMateriaError', 'El código debe tener al menos 3 caracteres');
            isValid = false;
        }
        
        // Validar nombre
        const nombre = document.getElementById('nombreMateria').value.trim();
        if (nombre === '') {
            mostrarError('nombreMateriaError', 'El nombre es obligatorio');
            isValid = false;
        } else if (nombre.length < 3) {
            mostrarError('nombreMateriaError', 'El nombre debe tener al menos 3 caracteres');
            isValid = false;
        }
        
        // Validar nivel
        const nivel = document.getElementById('nivelMateria').value;
        if (nivel === '') {
            mostrarError('nivelMateriaError', 'Debe seleccionar un nivel');
            isValid = false;
        }
        
        // Validar créditos
        const creditos = document.getElementById('creditosMateria').value;
        if (creditos === '') {
            mostrarError('creditosMateriaError', 'Los créditos son obligatorios');
            isValid = false;
        } else if (creditos < 1 || creditos > 8) {
            mostrarError('creditosMateriaError', 'Los créditos deben estar entre 1 y 8');
            isValid = false;
        }
        
        // Validar horario
        const horario = document.getElementById('horarioMateria').value.trim();
        if (horario === '') {
            mostrarError('horarioMateriaError', 'El horario es obligatorio');
            isValid = false;
        } else if (horario.length < 5) {
            mostrarError('horarioMateriaError', 'El horario debe ser más específico');
            isValid = false;
        }
        
        if (isValid) {
            alert('Validación exitosa - Formulario listo para enviar');
        }
    });
}

// ==========================================
// VALIDACIÓN FORMULARIO DE ASISTENCIAS
// ==========================================

const formAsistencia = document.getElementById('formAsistencia');
if (formAsistencia) {
    formAsistencia.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        const materia = document.getElementById('materiaAsistencia').value;
        const fecha = document.getElementById('fechaAsistencia').value;
    
        if (!materia) {
            alert('Debe seleccionar una materia');
            isValid = false;
        }
        
        if (!fecha) {
            alert('Debe seleccionar una fecha');
            isValid = false;
        }
        
        if (isValid) {
            alert('Validación exitosa - Formulario listo para enviar');
        }
    });
}

// ==========================================
// VALIDACIÓN FORMULARIO DE REPORTES
// ==========================================

const formReporte = document.getElementById('formReporte');
if (formReporte) {
    formReporte.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const tipoReporte = document.getElementById('tipoReporte').value;
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;
        
        let isValid = true;
        
        // Validar tipo de reporte
        if (!tipoReporte) {
            alert('Debe seleccionar un tipo de reporte');
            isValid = false;
        }
        
        // Validar fechas
        if (!fechaInicio || !fechaFin) {
            alert('Debe seleccionar ambas fechas');
            isValid = false;
        } else if (new Date(fechaInicio) > new Date(fechaFin)) {
            alert('La fecha de inicio no puede ser mayor que la fecha fin');
            isValid = false;
        }
        
        if (isValid) {
            alert('Validación exitosa - Formulario listo para enviar');
        }
    });
}

// ==========================================
// VALIDACIÓN FORMULARIO RECUPERAR CONTRASEÑA
// ==========================================

const recuperarForm = document.getElementById('recuperarForm');
if (recuperarForm) {
    recuperarForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        limpiarError('emailRecuperarError');
        
        const email = document.getElementById('emailRecuperar').value.trim();
        
        let isValid = true;
        
        // Validar email
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
            alert('Validación exitosa - Formulario listo para enviar');
        }
    });
}

console.log('Sistema de validaciones ULEAM cargado correctamente');