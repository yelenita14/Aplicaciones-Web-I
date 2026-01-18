<template>
  <div class="dashboard-container">
    <!-- Sidebar del estudiante -->
    <nav class="sidebar">
      <div class="logo-sidebar">
        <img src="/ULEAM.png" alt="ULEAM">
      </div>
      
      <ul class="menu">
        <li>
          <a 
            href="#" 
            :class="{ active: seccionActiva === 'dashboard' }" 
            @click.prevent="mostrarSeccion('dashboard')"
          >
            Dashboard
          </a>
        </li>
        <li>
          <a 
            href="#" 
            :class="{ active: seccionActiva === 'asistencias' }" 
            @click.prevent="mostrarSeccion('asistencias')"
          >
            Mis Asistencias
          </a>
        </li>
        <li>
          <a 
            href="#" 
            :class="{ active: seccionActiva === 'justificaciones' }" 
            @click.prevent="mostrarSeccion('justificaciones')"
          >
            Justificaciones
          </a>
        </li>
      </ul>
      
      <div class="user-info">
        <p>Estudiante: <span>{{ estudianteNombre }}</span></p>
        <button class="btn-logout" @click="cerrarSesion">Cerrar Sesión</button>
      </div>
    </nav>
    
    <!-- Contenido Principal -->
    <main class="main-content">
      <!-- Dashboard Section -->
      <div v-show="seccionActiva === 'dashboard'">
        <header class="top-bar">
          <h1>Panel de Control</h1>
          <div class="date-info">
            <span id="currentDate">{{ fechaActual }}</span>
          </div>
        </header>
        
        <!-- Estadísticas -->
        <div class="dashboard-grid">
          <div class="card">
            <div class="card-icon present-icon">✓</div>
            <div class="card-content">
              <h3>Total Asistencias</h3>
              <p class="card-number">{{ totalAsistencias }}</p>
            </div>
          </div>
          
          <div class="card">
            <div class="card-icon absent-icon">✗</div>
            <div class="card-content">
              <h3>Total Faltas</h3>
              <p class="card-number">{{ totalFaltas }}</p>
            </div>
          </div>
          
          <div class="card">
            <div class="card-icon pending-icon">📄</div>
            <div class="card-content">
              <h3>Justificaciones Pendientes</h3>
              <p class="card-number">{{ justificacionesPendientes }}</p>
            </div>
          </div>
        </div>
        
        <!-- Resumen por Materia -->
        <div class="card summary-card">
          <div class="summary-content">
            <h3 class="summary-title">📚 Resumen por Materia</h3>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Asistencias</th>
                    <th>Inasistencias</th>
                    <th>Porcentaje</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="resumenMaterias.length === 0">
                    <td colspan="5" class="empty-data">No hay datos disponibles</td>
                  </tr>
                  <tr v-for="materia in resumenMaterias" :key="materia.nombre">
                    <td>{{ materia.nombre }}</td>
                    <td>{{ materia.asistencias }}</td>
                    <td>{{ materia.inasistencias }}</td>
                    <td>{{ materia.porcentaje }}%</td>
                    <td>
                      <span :class="['estado-badge', materia.estado.toLowerCase()]">
                        {{ materia.estado }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mis Asistencias Section -->
      <div v-show="seccionActiva === 'asistencias'">
        <header class="top-bar">
          <h1>Mis Asistencias</h1>
        </header>
        
        <!-- Filtros -->
        <div class="filters">
          <select v-model="filtroMateria" class="select-styled">
            <option value="">📚 Todas las materias</option>
            <option v-for="materia in materiasConAsistencias" :key="materia" :value="materia">
              {{ materia }}
            </option>
          </select>
          <select v-model="filtroEstado" class="select-styled">
            <option value="">📊 Todos los estados</option>
            <option value="presente">✓ Presente</option>
            <option value="ausente">✗ Ausente</option>
            <option value="justificado">📝 Justificado</option>
          </select>
        </div>
        
        <!-- Tabla de Asistencias -->
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Materia</th>
                <th>Estado</th>
                <th>Acciones</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="asistenciasFiltradas.length === 0">
                <td colspan="5" class="empty-data">No hay registros de asistencia</td>
              </tr>
              <tr v-for="asistencia in asistenciasFiltradas" :key="asistencia.id">
                <td>{{ formatearFechaCorta(asistencia.fecha) }}</td>
                <td>{{ asistencia.materia }}</td>
                <td>
                  <span class="status-badge status-ausente">
                    {{ asistencia.estado === 'presente' ? 'Presente' : asistencia.estado === 'ausente' ? 'Ausente' : 'Justificado' }}
                  </span>
                </td>
                <td>
                  <button 
                    v-if="asistencia.estado === 'ausente' && !tieneJustificacionSimple(asistencia.id)" 
                    class="btn-justify"
                    @click="abrirModalJustificar(asistencia)"
                  >
                    Justificar
                  </button>
                  <span 
                    v-else-if="tieneJustificacionSimple(asistencia.id)" 
                    style="color: #6c757d; font-style: italic;"
                  >
                    Ya justificada
                  </span>
                </td>
                <td>
                  <input 
                    type="text" 
                    class="input-styled" 
                    placeholder="Sin observaciones"
                    :value="asistencia.observacion || ''"
                    style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 6px;"
                    readonly
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Justificaciones Section -->
      <div v-show="seccionActiva === 'justificaciones'">
        <header class="top-bar">
          <h1>Mis Justificaciones</h1>
        </header>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha Falta</th>
                <th>Materia</th>
                <th>Tipo</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Fecha Solicitud</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="justificaciones.length === 0">
                <td colspan="6" class="empty-data">No hay justificaciones registradas</td>
              </tr>
              <tr v-for="justificacion in justificaciones" :key="justificacion.id">
                <td>{{ formatearFecha(justificacion.fechaFalta) }}</td>
                <td>{{ justificacion.materia }}</td>
                <td>{{ formatearTipo(justificacion.tipo) }}</td>
                <td>{{ justificacion.motivo }}</td>
                <td>
                  <span class="status-badge status-pendiente">
                    {{ capitalizarEstado(justificacion.estado) }}
                  </span>
                </td>
                <td>{{ formatearFecha(justificacion.fechaSolicitud) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
    
    <!-- Modal Justificar Falta -->
    <div v-if="modalJustificarVisible" class="modal-overlay" @click.self="cerrarModalJustificar">
      <div class="modal">
        <div class="modal-header">
          <h2>Justificar Falta</h2>
          <button class="modal-close" @click="cerrarModalJustificar">&times;</button>
        </div>
        <div class="modal-body">
          <div class="info-box">
            <p class="info-text">
              <strong>📌 Información:</strong> Complete el formulario para justificar su inasistencia. El docente revisará su solicitud.
            </p>
          </div>
          
          <form @submit.prevent="enviarJustificacion">
            <div class="form-group">
              <label>Materia:</label>
              <input type="text" v-model="justificacionForm.materia" class="input-styled" readonly>
            </div>
            
            <div class="form-group">
              <label>Fecha de la falta:</label>
              <input type="text" v-model="justificacionForm.fecha" class="input-styled" readonly>
            </div>
            
            <div class="form-group">
              <label>Tipo de justificación</label>
              <select v-model="justificacionForm.tipo" class="select-styled" required>
                <option value="">Seleccione un tipo</option>
                <option value="medico">Certificado Médico</option>
                <option value="calamidad">Calamidad Doméstica</option>
                <option value="tramite">Trámite Institucional</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Motivo de la ausencia</label>
              <textarea 
                v-model="justificacionForm.motivo" 
                class="textarea-styled" 
                required 
                placeholder="Describa detalladamente el motivo de su ausencia..."
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>Adjuntar documento de respaldo (PDF, JPG, PNG)</label>
              <div class="file-upload-area" @click="$refs.fileInput.click()">
                <p class="file-name">{{ archivoNombre || '📎 Haga clic para seleccionar un archivo' }}</p>
              </div>
              <input 
                type="file" 
                ref="fileInput"
                accept=".pdf,.jpg,.jpeg,.png" 
                class="file-input" 
                @change="handleFileSelect"
                style="display: none;"
              >
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="cerrarModalJustificar">Cancelar</button>
              <button type="submit" class="btn-primary">Enviar Justificación</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Modal Cerrar Sesión -->
    <div v-if="modalCerrarSesionVisible" class="modal-flotante">
      <div class="modal-contenido">
        <p>¿Estás seguro de cerrar sesión?</p>
        <div class="modal-botones">
          <button class="btn-confirmar" @click="confirmarCerrarSesion">Confirmar</button>
          <button class="btn-cancelar" @click="cancelarCerrarSesion">Cancelar</button>
        </div>
      </div>
    </div>
    <div v-if="customConfirmarModal" class="modal-flotante" style="display: block">
  <div class="modal-contenido">
    <p style="margin-bottom: 12px; text-align: center;">{{ customConfirmarMensaje }}</p>
    <button 
      class="btn-confirmar" 
      @click="customConfirmarModal = false"
      style="display: block; margin: 0 auto; padding: 8px 24px; background: #5dade2; color: white; border: none; border-radius: 6px; cursor: pointer;"
    >
      Confirmar
    </button>
  </div>
</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificacionesStore } from '@/stores/notificaciones' 

const router = useRouter()
const authStore = useAuthStore()

// Estado
const seccionActiva = ref('dashboard')
const estudianteNombre = ref('')
const fechaActual = ref('')
const filtroMateria = ref('')
const filtroEstado = ref('')
const modalJustificarVisible = ref(false)
const modalCerrarSesionVisible = ref(false)
const archivoNombre = ref('')
const customConfirmarModal = ref(false)
const customConfirmarMensaje = ref('')
const enviandoJustificacion = ref(false)

// Datos del estudiante
const asistencias = ref([])
const justificaciones = ref([])

// Formulario de justificación
const justificacionForm = ref({
  asistenciaId: null,
  materia: '',
  fecha: '',
  tipo: '',
  motivo: ''
})

// Computed
const totalAsistencias = computed(() => {
  return asistencias.value.filter(a => a.estado === 'presente').length
})

const totalFaltas = computed(() => {
  return asistencias.value.filter(a => a.estado === 'ausente').length
})

const justificacionesPendientes = computed(() => {
  return justificaciones.value.filter(j => {
    const estado = j.estado.toLowerCase()
    return estado === 'pendiente'
  }).length
})

const materiasConAsistencias = computed(() => {
  const materias = [...new Set(asistencias.value.map(a => a.materia))]
  return materias
})

const asistenciasFiltradas = computed(() => {
  let resultado = asistencias.value
  
  if (filtroMateria.value) {
    resultado = resultado.filter(a => a.materia === filtroMateria.value)
  }
  
  if (filtroEstado.value) {
    resultado = resultado.filter(a => a.estado === filtroEstado.value)
  }
  
  return resultado
})

const resumenMaterias = computed(() => {
  const resumen = {}
  
  asistencias.value.forEach(asistencia => {
    if (!resumen[asistencia.materia]) {
      resumen[asistencia.materia] = {
        nombre: asistencia.materia,
        asistencias: 0,
        inasistencias: 0,
        total: 0
      }
    }
    
    resumen[asistencia.materia].total++
    
    if (asistencia.estado === 'presente') {
      resumen[asistencia.materia].asistencias++
    } else if (asistencia.estado === 'ausente') {
      resumen[asistencia.materia].inasistencias++
    }
  })
  
  return Object.values(resumen).map(materia => {
    const porcentaje = materia.total > 0 
      ? ((materia.asistencias / materia.total) * 100).toFixed(1)
      : 0.0
    
    let estado = 'Bien'
    if (porcentaje < 70) estado = 'Crítico'
    else if (porcentaje < 80) estado = 'Regular'
    
    return {
      ...materia,
      porcentaje,
      estado
    }
  })
})

// Métodos
const mostrarSeccion = (seccion) => {
  seccionActiva.value = seccion
  // Recargar datos cada vez que cambia de sección
  if (seccion === 'justificaciones' || seccion === 'asistencias') {
    cargarDatos()
  }
}

const cargarDatos = () => {
  const usuario = authStore.usuarioActual
  
  if (!usuario || usuario.tipo !== 'estudiante') {
    router.push('/')
    return
  }
  
  // Cargar estudiantes directamente desde localStorage
  const todosEstudiantes = JSON.parse(localStorage.getItem('estudiantes') || '[]')
  
  // Buscar por matrícula o por email
  const estudianteCompleto = todosEstudiantes.find(
    est => est.matricula === usuario.matricula || 
           est.email === usuario.email ||
           est.matricula === usuario.email // Por si el email está en matrícula
  )
  
  console.log('Usuario actual:', usuario)
  console.log('Estudiante encontrado:', estudianteCompleto)
  
  if (estudianteCompleto) {
    estudianteNombre.value = `${estudianteCompleto.nombres} ${estudianteCompleto.apellidos}`
  } else {
    // Si no se encuentra, mostrar lo que tenga el usuario
    estudianteNombre.value = usuario.nombre || usuario.matricula || 'Estudiante'
  }
  
  // Determinar la matrícula a usar para buscar asistencias
  const matriculaBuscar = estudianteCompleto?.matricula || usuario.matricula || usuario.email
  
  console.log('Buscando asistencias con matrícula:', matriculaBuscar)
  
  // Cargar asistencias del estudiante
  const todasAsistencias = JSON.parse(localStorage.getItem('asistencias') || '[]')
  console.log('Total asistencias en sistema:', todasAsistencias.length)
  console.log('Todas las asistencias:', todasAsistencias)
  
  asistencias.value = todasAsistencias.filter(a => {
    const coincide = a.matricula === matriculaBuscar || 
                     a.email === matriculaBuscar ||
                     a.matricula === usuario.email ||
                     a.email === usuario.matricula
    if (coincide) {
      console.log('Asistencia encontrada:', a)
    }
    return coincide
  })
  
  console.log('Asistencias del estudiante:', asistencias.value.length)
  
  // Cargar justificaciones del estudiante
  const todasJustificaciones = JSON.parse(localStorage.getItem('justificaciones') || '[]')
  console.log('Total justificaciones en sistema:', todasJustificaciones.length)
  console.log('Todas las justificaciones:', todasJustificaciones)
  console.log('Buscando justificaciones con matrícula:', matriculaBuscar)
  console.log('Email del usuario:', usuario.email)
  
  justificaciones.value = todasJustificaciones.filter(j => {
    // Buscar por matrícula o email
    const coincide = j.matricula === matriculaBuscar || 
                     j.matricula === usuario.email ||
                     j.email === matriculaBuscar ||
                     j.email === usuario.email ||
                     j.email === usuario.matricula
    if (coincide) {
      console.log('Justificación encontrada:', j)
    }
    return coincide
  })
  
  console.log('Justificaciones del estudiante:', justificaciones.value.length)
  
  // Actualizar fecha
  actualizarFecha()
}

const actualizarFecha = () => {
  const hoy = new Date()
  const opciones = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  fechaActual.value = hoy.toLocaleDateString('es-ES', opciones).toUpperCase()
}

const formatearFecha = (fecha) => {
  if (!fecha) return '-'
  
  // Si es un ISO string (contiene T y Z), extraer solo la fecha
  if (typeof fecha === 'string' && fecha.includes('T')) {
    fecha = fecha.split('T')[0]
  }
  
  // Si el formato es YYYY-MM-DD, dividir y usar directamente
  if (typeof fecha === 'string' && fecha.includes('-')) {
    const partes = fecha.split('-')
    if (partes.length === 3) {
      const [year, month, day] = partes
      return `${day}/${month}/${year}`
    }
  }
  
  return new Date(fecha).toLocaleDateString('es-EC')
}

const formatearFechaCorta = (fecha) => {
  if (!fecha) return '-'
  // Si el formato es YYYY-MM-DD, dividir y usar directamente
  if (typeof fecha === 'string' && fecha.includes('-')) {
    const [year, month, day] = fecha.split('-')
    return `${day}/${month}/${year}`
  }
  const date = new Date(fecha)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

const formatearTipo = (tipo) => {
  const tipos = {
    'medico': 'Médico',
    'calamidad': 'Calamidad',
    'tramite': 'Trámite',
    'otro': 'Otro'
  }
  return tipos[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1)
}

const capitalizarEstado = (estado) => {
  if (!estado) return ''
  return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase()
}

// Función simple para verificar si tiene justificación
const tieneJustificacionSimple = (asistenciaId) => {
  const todasJustificaciones = JSON.parse(localStorage.getItem('justificaciones') || '[]')
  return todasJustificaciones.some(j => j.attendanceId === asistenciaId)
}

// FUNCIÓN CORREGIDA: Verifica si puede justificar
const puedeJustificar = (asistencia) => {
  // Solo puede justificar si es ausente
  if (asistencia.estado !== 'ausente') return false
  
  const justificacion = justificaciones.value.find(j => j.attendanceId === asistencia.id)
  
  // Si no hay justificación, puede justificar
  if (!justificacion) return true
  
  // Si ya tiene justificación (pendiente, aceptada o rechazada), NO puede volver a justificar
  return false
}

// FUNCIÓN NUEVA: Obtiene el texto del estado con color
const obtenerTextoEstado = (asistencia) => {
  const justificacion = justificaciones.value.find(j => j.attendanceId === asistencia.id)
  
  if (!justificacion) return null
  
  const estadoNormalizado = justificacion.estado.toLowerCase()
  
  const estados = {
    'pendiente': { texto: '⏳ Pendiente de revisión', color: '#f39c12' },
    'aceptada': { texto: '✅ Justificación aceptada', color: '#27ae60' },
    'aceptado': { texto: '✅ Justificación aceptada', color: '#27ae60' },
    'aprobada': { texto: '✅ Justificación aprobada', color: '#27ae60' },
    'aprobado': { texto: '✅ Justificación aprobada', color: '#27ae60' },
    'rechazada': { texto: '❌ Rechazada', color: '#e74c3c' },
    'rechazado': { texto: '❌ Rechazada', color: '#e74c3c' }
  }
  
  return estados[estadoNormalizado] || { texto: justificacion.estado, color: '#6c757d' }
}

const abrirModalJustificar = (asistencia) => {
  justificacionForm.value = {
    asistenciaId: asistencia.id,
    materia: asistencia.materia,
    fecha: formatearFecha(asistencia.fecha),
    tipo: '',
    motivo: ''
  }
  modalJustificarVisible.value = true
}

const cerrarModalJustificar = () => {
  modalJustificarVisible.value = false
  archivoNombre.value = ''
  delete window.archivoSeleccionado 
  justificacionForm.value = {
    asistenciaId: null,
    materia: '',
    fecha: '',
    tipo: '',
    motivo: ''
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      customConfirmarModal.value = true
      customConfirmarMensaje.value = 'El archivo es muy grande. Máximo 5MB'
      setTimeout(() => {
        customConfirmarModal.value = false
      }, 3000)
      return
    }
    
    // Validar tipo de archivo
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    if (!tiposPermitidos.includes(file.type)) {
      customConfirmarModal.value = true
      customConfirmarMensaje.value = 'Solo se permiten archivos PDF, JPG o PNG'
      setTimeout(() => {
        customConfirmarModal.value = false
      }, 3000)
      return
    }
    
    archivoNombre.value = file.name
    window.archivoSeleccionado = file // Guardar archivo temporalmente
  }
}

const convertirArchivoABase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const enviarJustificacion = async () => {
  if(enviandoJustificacion.value){
    return
  }

  enviandoJustificacion.value = true

  const asistencia = asistencias.value.find(a => a.id === justificacionForm.value.asistenciaId)
  
  if (!asistencia) {
    customConfirmarModal.value = true
    customConfirmarMensaje.value = 'Error: No se encontró la asistencia'
    setTimeout(() => {
      customConfirmarModal.value = false
    }, 3000)
    enviandoJustificacion.value = false
    return
  }

  // Verificar si ya existe una justificación para esta asistencia
  const todasJustificaciones = JSON.parse(localStorage.getItem('justificaciones') || '[]')
  const yaExiste = todasJustificaciones.some(j => j.attendanceId === justificacionForm.value.asistenciaId)
  
  if (yaExiste) {
    customConfirmarModal.value = true
    customConfirmarMensaje.value = 'Ya existe una justificación para esta falta'
    setTimeout(() => {
      customConfirmarModal.value = false
    }, 3000)
    enviandoJustificacion.value = false
    cerrarModalJustificar()
    return
  }

  let archivoData = null
  if (archivoNombre.value && window.archivoSeleccionado) {
    try {
      archivoData = await convertirArchivoABase64(window.archivoSeleccionado)
    } catch (error) {
      customConfirmarModal.value = true
      customConfirmarMensaje.value = 'Error al procesar el archivo'
      setTimeout(() => {
        customConfirmarModal.value = false
      }, 3000)
      enviandoJustificacion.value = false
      return
    }
  }
  
  const nuevaJustificacion = {
    id: Date.now(),
    attendanceId: justificacionForm.value.asistenciaId,
    matricula: authStore.usuarioActual.matricula,
    nombres: estudianteNombre.value.split(' ')[0],
    apellidos: estudianteNombre.value.split(' ').slice(1).join(' ') || '',
    email: authStore.usuarioActual.email || authStore.usuarioActual.matricula,
    materia: justificacionForm.value.materia,
    codigoMateria: asistencia.codigoMateria,
    fechaFalta: asistencia.fecha,
    tipo: justificacionForm.value.tipo,
    motivo: justificacionForm.value.motivo,
    estado: 'Pendiente',
    fechaSolicitud: new Date().toLocaleDateString('en-CA'),
    registradoPorEmail: asistencia.registradoPorEmail,
    archivo: archivoNombre.value || null,
    archivoData: archivoData
  }
  
  todasJustificaciones.push(nuevaJustificacion)
  localStorage.setItem('justificaciones', JSON.stringify(todasJustificaciones))
  
  justificaciones.value.push(nuevaJustificacion)
  
  const notificacionesStore = useNotificacionesStore()
  notificacionesStore.crearNotificacionJustificacion(nuevaJustificacion)
  
  delete window.archivoSeleccionado
  
  cerrarModalJustificar()
  customConfirmarModal.value = true
  customConfirmarMensaje.value = 'Justificación enviada exitosamente. El docente la revisará pronto.'

  enviandoJustificacion.value = false
}

const cerrarSesion = () => {
  modalCerrarSesionVisible.value = true
}

const confirmarCerrarSesion = () => {
  authStore.logout()
  router.push('/')
}

const cancelarCerrarSesion = () => {
  modalCerrarSesionVisible.value = false
}

onMounted(() => {
  cargarDatos()
})
</script>