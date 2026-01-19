<template>
  <div class="dashboard-container">
    <Sidebar />
    
    <main class="main-content">
      <header class="top-bar">
        <h1>Control de Asistencias</h1>
        <div style="display: flex; align-items: center; gap: 15px;">
          <button class="btn-notification" @click="abrirNotificaciones">
            🔔 Notificaciones
            <span 
              v-if="notificacionesStore.cantidadPendientes > 0"
              style="display: inline; background: #e74c3c; color: white; border-radius: 50%; padding: 2px 6px; font-size: 12px; margin-left: 5px;"
              class="badge"
            >
              {{ notificacionesStore.cantidadPendientes }}
            </span>
          </button>
        </div>
      </header>

      <div class="attendance-controls">
        <div class="form-group">
          <label for="materiaAsistencia">Materia:</label>
          <select 
            id="materiaAsistencia" 
            v-model="materiaSeleccionada"
            class="select-styled" 
            required
            @change="onMateriaChange"
          >
            <option value="">Seleccione una materia</option>
            <option 
              v-for="materia in materiasStore.materiasVisibles" 
              :key="materia.codigo"
              :value="materia.codigo"
            >
              {{ materia.nombre }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="fechaAsistencia">Fecha:</label>
          <input 
            type="date" 
            id="fechaAsistencia"
            v-model="fechaSeleccionada"
            class="input-styled" 
            required
            @change="onFechaChange"
          >
        </div>
        <button 
          type="button" 
          class="btn-primary btn-cargar"
          @click="cargarEstudiantes"
        >
          Registrar Asistencia
        </button>
      </div>
      
      <div class="export-import-controls">
        <button type="button" class="btn-export" @click="exportarJSON">
          Exportar JSON
        </button>
        <button type="button" class="btn-export" @click="exportarXML">
          Exportar XML
        </button>
        <button type="button" class="btn-import" @click="triggerImport">
          Importar Archivo
        </button>
        <input 
          ref="fileInput"
          type="file" 
          style="display: none;" 
          accept=".json,.xml" 
          @change="importarArchivo"
        >
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre/Apellidos</th>
              <th>Correo institucional</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="attendanceTableBody">
            <tr v-if="cargando">
              <td colspan="4" style="text-align: center; padding: 40px; color: #666;">
                Cargando estudiantes...
              </td>
            </tr>
            <tr v-else v-for="estudiante in estudiantesCargados" :key="estudiante.matricula">
              <td>{{ estudiante.nombres }} {{ estudiante.apellidos }}</td>
              <td>{{ estudiante.email }}</td>
              <td class="center-cell">
                <input 
                  type="radio" 
                  class="radio-input"
                  :name="`falta_${estudiante.matricula}`"
                  v-model="attendanceData[estudiante.matricula]"
                  :value="true"
                >
              </td>
              <td>
                <input 
                  type="text" 
                  class="obs-input"
                  v-model="observaciones[estudiante.matricula]"
                  placeholder="Observación / Justificación"
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <button 
        type="button" 
        class="btn-save-attendance" 
        @click="guardarAsistencias"
      >
        Guardar Asistencia
      </button>
    </main>

    <!-- Modal Notificaciones -->
    <ModalNotificaciones
      v-if="modalNotificacionesVisible"
      @cerrar="cerrarNotificaciones"
      @revisar="abrirRevisarJustificacion"
    />

    <!-- Modal Revisar Justificación -->
    <ModalRevisarJustificacion
      v-if="modalRevisarVisible"
      :justificacion="justificacionSeleccionada"
      @cerrar="cerrarRevisarJustificacion"
      @aprobar="aprobarJustificacion"
      @rechazar="rechazarJustificacion"
    />

    <!-- Modal Confirm -->
    <ModalConfirm
      v-if="modalConfirmVisible"
      :mensaje="mensajeConfirm"
      @confirmar="confirmarAccion"
      @cancelar="cancelarAccion"
    />

    <!-- Notification Toast -->
    <Notification
      v-if="notificationVisible"
      :mensaje="notificationMensaje"
      :tipo="notificationTipo"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import ModalNotificaciones from '@/components/ModalNotificaciones.vue'
import ModalRevisarJustificacion from '@/components/ModalRevisarJustificacion.vue'
import ModalConfirm from '@/components/ModalConfirm.vue'
import Notification from '@/components/Notification.vue'
import { useEstudiantesStore } from '@/stores/estudiantes'
import { useMateriasStore } from '@/stores/materias'
import { useAsistenciasStore } from '@/stores/asistencias'
import { useNotificacionesStore } from '@/stores/notificaciones'
import { useAuthStore } from '@/stores/auth'
import { exportarJSONUtil, exportarXMLUtil, importarArchivoUtil } from '@/utils/exportImport'

const estudiantesStore = useEstudiantesStore()
const materiasStore = useMateriasStore()
const asistenciasStore = useAsistenciasStore()
const notificacionesStore = useNotificacionesStore()
const authStore = useAuthStore()

const materiaSeleccionada = ref('')
const fechaSeleccionada = ref('')
const estudiantesCargados = ref([])
const attendanceData = ref({})
const observaciones = ref({})
const modalNotificacionesVisible = ref(false)
const modalRevisarVisible = ref(false)
const modalConfirmVisible = ref(false)
const justificacionSeleccionada = ref(null)
const mensajeConfirm = ref('')
const accionPendiente = ref(null)
const fileInput = ref(null)
const cargando = ref(false)

// Notification
const notificationVisible = ref(false)
const notificationMensaje = ref('')
const notificationTipo = ref('info')

const onMateriaChange = () => {
  if (materiaSeleccionada.value && fechaSeleccionada.value) {
    cargarEstudiantes()
  }
}

const onFechaChange = () => {
  if (materiaSeleccionada.value && fechaSeleccionada.value) {
    cargarEstudiantes()
  }
}

const cargarEstudiantes = () => {
  console.log('Cargando estudiantes...', { 
    materia: materiaSeleccionada.value, 
    fecha: fechaSeleccionada.value 
  })
  
  if (!materiaSeleccionada.value || !fechaSeleccionada.value) {
    mostrarNotificacion('Por favor seleccione una materia y una fecha', 'error')
    return
  }

  cargando.value = true

  // Limpiar datos anteriores
  estudiantesCargados.value = []
  attendanceData.value = {}
  observaciones.value = {}

  setTimeout(() => {
    try {
      // Cargar estudiantes visibles del docente
      const estudiantes = estudiantesStore.estudiantesVisibles

      console.log('Estudiantes visibles:', estudiantes.length)

      if (estudiantes.length === 0) {
        mostrarNotificacion('No hay estudiantes registrados para esta materia', 'warning')
        cargando.value = false
        return
      }

      // Verificar si ya existen registros para esta fecha y materia
      const registrosExistentes = asistenciasStore.asistencias.filter(a => 
        a.codigoMateria === materiaSeleccionada.value && 
        a.fecha === fechaSeleccionada.value &&
        a.registradoPorEmail?.toLowerCase() === authStore.usuarioActual?.email?.toLowerCase()
      )

      console.log('Registros existentes:', registrosExistentes.length)

      // Cargar estudiantes con sus registros previos si existen
      estudiantesCargados.value = estudiantes.map(est => {
        const registro = registrosExistentes.find(r => r.matricula === est.matricula)
        
        if (registro) {
          // Si el estado es 'ausente', marcar como true (checkbox marcado)
          attendanceData.value[est.matricula] = registro.estado === 'ausente'
          observaciones.value[est.matricula] = registro.observacion || ''
        } else {
          // Por defecto, sin marcar (asistencia)
          attendanceData.value[est.matricula] = false
        }
        
        return { ...est }
      })

      console.log('Estudiantes cargados:', estudiantesCargados.value.length)

      if (registrosExistentes.length > 0) {
        mostrarNotificacion('Se cargaron registros existentes', 'info')
      } else {
        mostrarNotificacion(`Se cargaron ${estudiantesCargados.value.length} estudiantes`, 'success')
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error)
      mostrarNotificacion('Error al cargar estudiantes', 'error')
    } finally {
      cargando.value = false
    }
  }, 100)
}

const guardarAsistencias = () => {
  if (!materiaSeleccionada.value || !fechaSeleccionada.value) {
    mostrarNotificacion('Por favor seleccione una materia y fecha', 'error')
    return
  }

  if (estudiantesCargados.value.length === 0) {
    mostrarNotificacion('No hay estudiantes para registrar', 'error')
    return
  }

  const materia = materiasStore.materias.find(m => m.codigo === materiaSeleccionada.value)
  const materiaNombre = materia?.nombre || 'Sin nombre'

  // Verificar que todos tengan un estado definido (todos deben tener true o false)
  const sinRegistro = estudiantesCargados.value.filter(
    e => attendanceData.value[e.matricula] === undefined || attendanceData.value[e.matricula] === null
  )

  const procederGuardado = () => {
    try {
      // Eliminar registros anteriores de esta fecha/materia/docente
      asistenciasStore.eliminarAsistenciasPorFechaMateria(
        fechaSeleccionada.value,
        materiaSeleccionada.value
      )

      // Crear nuevos registros
      const nuevasAsistencias = []
      
      estudiantesCargados.value.forEach(est => {
        const estaFalta = attendanceData.value[est.matricula]
        // Si está marcado = falta (ausente), si no está marcado = asistencia (presente)
        const estado = estaFalta ? 'ausente' : 'presente'
        
        nuevasAsistencias.push({
          id: `${Date.now()}_${est.matricula}_${Math.random()}`,
          matricula: est.matricula,
          nombres: est.nombres,
          apellidos: est.apellidos,
          email: est.email,
          materia: materiaNombre,
          codigoMateria: materiaSeleccionada.value,
          fecha: fechaSeleccionada.value,
          estado: estado,
          observacion: observaciones.value[est.matricula] || '',
          registradoPorEmail: authStore.usuarioActual?.email || '',
          fechaRegistro: new Date().toISOString()
        })
      })

      asistenciasStore.registrarAsistenciasMasivo(nuevasAsistencias)
      
      mostrarNotificacion(
        `✓ ${nuevasAsistencias.length} asistencias guardadas exitosamente`, 
        'success'
      )
      
      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        estudiantesCargados.value = []
        attendanceData.value = {}
        observaciones.value = {}
        materiaSeleccionada.value = ''
        fechaSeleccionada.value = new Date().toISOString().split('T')[0]
      }, 2000)
    } catch (error) {
      console.error('Error al guardar asistencias:', error)
      mostrarNotificacion('Error al guardar asistencias', 'error')
    }
  }

  if (sinRegistro.length > 0) {
    mensajeConfirm.value = `Hay ${sinRegistro.length} estudiante(s) sin registrar estado de asistencia. ¿Desea continuar?`
    accionPendiente.value = procederGuardado
    modalConfirmVisible.value = true
  } else {
    procederGuardado()
  }
}

const abrirNotificaciones = () => {
  modalNotificacionesVisible.value = true
}

const cerrarNotificaciones = () => {
  modalNotificacionesVisible.value = false
}

const abrirRevisarJustificacion = (justificacion) => {
  justificacionSeleccionada.value = justificacion
  modalRevisarVisible.value = true
  modalNotificacionesVisible.value = false
}

const cerrarRevisarJustificacion = () => {
  modalRevisarVisible.value = false
  justificacionSeleccionada.value = null
}

const aprobarJustificacion = () => {
  if (!justificacionSeleccionada.value) return
  
  try {
    // Actualizar estado de justificación
    const justificaciones = JSON.parse(localStorage.getItem('justificaciones') || '[]')
    const justif = justificaciones.find(j => 
      j.id === justificacionSeleccionada.value.detalles?.justificacionId
    )
    
    if (justif) {
      justif.estado = 'aprobada'
      justif.fechaRevision = new Date().toISOString()
      justif.revisadoPor = authStore.usuarioActual?.email || ''
      localStorage.setItem('justificaciones', JSON.stringify(justificaciones))
      
      // AGREGAR ESTO: Actualizar la asistencia a "justificado"
      const asistencias = JSON.parse(localStorage.getItem('asistencias') || '[]')
      const asistencia = asistencias.find(a => a.id === justif.attendanceId)
      
      if (asistencia) {
        asistencia.estado = 'justificado'
        asistencia.observacion = `Justificado: ${justif.motivo}`
        localStorage.setItem('asistencias', JSON.stringify(asistencias))
        console.log('Asistencia actualizada a justificado')
      }
    }

    // Marcar notificación como leída
    notificacionesStore.marcarComoLeida(justificacionSeleccionada.value.id)
    
    mostrarNotificacion('✓ Justificación aprobada exitosamente', 'success')
    cerrarRevisarJustificacion()
  } catch (error) {
    console.error('Error al aprobar justificación:', error)
    mostrarNotificacion('Error al aprobar justificación', 'error')
  }
}

const rechazarJustificacion = () => {
  if (!justificacionSeleccionada.value) return
  
  const razon = prompt('Ingrese la razón del rechazo:')
  if (razon === null || razon.trim() === '') {
    mostrarNotificacion('Debe ingresar una razón para rechazar', 'warning')
    return
  }

  try {
    // Actualizar estado de justificación
    const justificaciones = JSON.parse(localStorage.getItem('justificaciones') || '[]')
    const justif = justificaciones.find(j => 
      j.id === justificacionSeleccionada.value.detalles?.justificacionId
    )
    
    if (justif) {
      justif.estado = 'rechazada'
      justif.observaciones = razon
      justif.fechaRevision = new Date().toISOString()
      justif.revisadoPor = authStore.usuarioActual?.email || ''
      localStorage.setItem('justificaciones', JSON.stringify(justificaciones))
    }

    // Marcar notificación como leída
    notificacionesStore.marcarComoLeida(justificacionSeleccionada.value.id)
    
    mostrarNotificacion('✗ Justificación rechazada', 'error')
    cerrarRevisarJustificacion()
  } catch (error) {
    console.error('Error al rechazar justificación:', error)
    mostrarNotificacion('Error al rechazar justificación', 'error')
  }
}

const exportarJSON = () => {
  try {
    if (estudiantesCargados.value.length === 0) {
      mostrarNotificacion('No hay datos para exportar', 'warning')
      return
    }
    exportarJSONUtil(estudiantesCargados.value, attendanceData.value, observaciones.value, {
      materia: materiaSeleccionada.value,
      fecha: fechaSeleccionada.value
    })
    mostrarNotificacion('✓ Archivo JSON exportado exitosamente', 'success')
  } catch (error) {
    console.error('Error al exportar JSON:', error)
    mostrarNotificacion('Error al exportar JSON', 'error')
  }
}

const exportarXML = () => {
  try {
    if (estudiantesCargados.value.length === 0) {
      mostrarNotificacion('No hay datos para exportar', 'warning')
      return
    }
    exportarXMLUtil(estudiantesCargados.value, attendanceData.value, observaciones.value, {
      materia: materiaSeleccionada.value,
      fecha: fechaSeleccionada.value
    })
    mostrarNotificacion('✓ Archivo XML exportado exitosamente', 'success')
  } catch (error) {
    console.error('Error al exportar XML:', error)
    mostrarNotificacion('Error al exportar XML', 'error')
  }
}

const triggerImport = () => {
  if (!fileInput.value) {
    mostrarNotificacion('Error al abrir selector de archivos', 'error')
    return
  }
  fileInput.value.click()
}

const importarArchivo = (event) => {
  try {
    importarArchivoUtil(event, (datosImportados) => {
      mostrarNotificacion('✓ Datos importados exitosamente', 'success')
      
      // Recargar datos
      estudiantesStore.cargarEstudiantes()
      asistenciasStore.cargarAsistencias()
      
      // Si hay estudiantes importados, cargarlos
      if (datosImportados?.estudiantes?.length > 0) {
        estudiantesCargados.value = datosImportados.estudiantes
        
        // Cargar asistencias si vienen en el archivo
        if (datosImportados.asistencias) {
          attendanceData.value = datosImportados.asistencias
        }
        if (datosImportados.observaciones) {
          observaciones.value = datosImportados.observaciones
        }
      }
    })
  } catch (error) {
    console.error('Error al importar archivo:', error)
    mostrarNotificacion('Error al importar archivo', 'error')
  }
}

const confirmarAccion = () => {
  if (accionPendiente.value) {
    accionPendiente.value()
    accionPendiente.value = null
  }
  modalConfirmVisible.value = false
}

const cancelarAccion = () => {
  accionPendiente.value = null
  modalConfirmVisible.value = false
  mostrarNotificacion('Acción cancelada', 'info')
}

const mostrarNotificacion = (mensaje, tipo) => {
  notificationMensaje.value = mensaje
  notificationTipo.value = tipo
  notificationVisible.value = true
  
  setTimeout(() => {
    notificationVisible.value = false
  }, 5000)
}

onMounted(() => {
  // Establecer fecha de hoy por defecto (ajustado a zona horaria local)
  const hoy = new Date().toLocaleDateString('en-CA')
  fechaSeleccionada.value = hoy
  
  // Cargar datos necesarios
  if (materiasStore.materias.length === 0) {
    materiasStore.cargarMaterias()
  }
  if (estudiantesStore.estudiantes.length === 0) {
    estudiantesStore.cargarEstudiantes()
  }
  if (notificacionesStore.notificaciones.length === 0) {
    notificacionesStore.cargarNotificaciones()
  }
})
</script>

<style scoped>
/* Los estilos se heredan del CSS global */
</style>