<template>
  <div 
    class="modal-overlay"
    style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;"
    @click.self="$emit('cerrar')"
  >
    <div 
      class="modal"
      style="background: white; width: 90%; max-width: 800px; max-height: 90vh; border-radius: 12px; overflow: auto;"
    >
      <div class="modal-header">
        <h2>Justificar Falta</h2>
        <button class="modal-close" @click="$emit('cerrar')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="info-box">
          <p class="info-text">
            <strong>📌 Información:</strong> Complete el formulario para justificar su inasistencia. 
            El docente revisará su solicitud.
          </p>
        </div>
        
        <form @submit.prevent="enviarJustificacion">
          <div class="form-group">
            <label>Materia:</label>
            <input 
              type="text" 
              :value="asistencia.materia"
              class="input-styled" 
              readonly
            >
          </div>

          <div class="form-group">
            <label>Fecha de la falta:</label>
            <input 
              type="text" 
              :value="formatearFecha(asistencia.fecha)"
              class="input-styled" 
              readonly
            >
          </div>

          <div class="form-group">
            <label>Tipo de justificación</label>
            <select 
              v-model="form.tipo"
              class="select-styled" 
              required
            >
              <option value="">Seleccione un tipo</option>
              <option value="medico">Certificado Médico</option>
              <option value="calamidad">Calamidad Doméstica</option>
              <option value="tramite">Trámite Institucional</option>
              <option value="otro">Otro</option>
            </select>
            <span class="error-message" v-if="errores.tipo">
              {{ errores.tipo }}
            </span>
          </div>

          <div class="form-group">
            <label>Motivo de la ausencia</label>
            <textarea 
              v-model="form.motivo"
              class="textarea-styled" 
              required 
              placeholder="Describa detalladamente el motivo de su ausencia..."
            ></textarea>
            <span class="error-message" v-if="errores.motivo">
              {{ errores.motivo }}
            </span>
          </div>

          <div class="form-group">
            <label>Adjuntar documento de respaldo (PDF, JPG, PNG)</label>
            <div class="file-upload-area" @click="triggerFileInput">
              <p class="file-name">
                {{ nombreArchivo || '📎 Haga clic para seleccionar un archivo' }}
              </p>
              <input 
                ref="fileInput"
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png" 
                class="file-input" 
                @change="handleFileSelect"
              >
            </div>
            <span class="error-message" v-if="errores.archivo">
              {{ errores.archivo }}
            </span>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="$emit('cerrar')">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              Enviar Justificación
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useEstudiantesStore } from '@/stores/estudiantes'
import { formatYMD } from '@/utils/validaciones'
import { nowLocalISO } from '@/utils/validaciones'

const authStore = useAuthStore()
const estudiantesStore = useEstudiantesStore()

const props = defineProps({
  asistencia: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['cerrar', 'guardar'])

const form = ref({
  tipo: '',
  motivo: ''
})

const errores = ref({})
const fileInput = ref(null)
const nombreArchivo = ref('')
const archivoData = ref(null)

const formatearFecha = (fecha) => {
  return formatYMD(fecha)
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    errores.value.archivo = 'El archivo es demasiado grande. Tama帽o m谩ximo: 5MB'
    event.target.value = ''
    return
  }

  nombreArchivo.value = file.name
  
  // Leer archivo como Data URL solo si es peque帽o
  if (file.size <= 2 * 1024 * 1024) {
    try {
      archivoData.value = await readFileAsDataURL(file)
    } catch (e) {
      console.error('Error leyendo archivo:', e)
      archivoData.value = null
    }
  } else {
    archivoData.value = null
  }
}

const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

const validarFormulario = () => {
  errores.value = {}
  let isValid = true

  if (!form.value.tipo) {
    errores.value.tipo = 'Debe seleccionar un tipo de justificación'
    isValid = false
  }

  if (!form.value.motivo || form.value.motivo.trim().length < 10) {
    errores.value.motivo = 'El motivo debe tener al menos 10 caracteres'
    isValid = false
  }

  return isValid
}

const enviarJustificacion = () => {
  if (!validarFormulario()) return

  // Obtener datos del estudiante actual
  const estudiante = estudiantesStore.estudiantes.find(
    est => est.email === authStore.usuarioActual.email
  )

  if (!estudiante) {
    alert('Error: No se encontró información del estudiante')
    return
  }

  const justificacion = {
    id: Date.now(),
    attendanceId: props.asistencia.id,
    matricula: estudiante.matricula,
    nombres: estudiante.nombres,
    apellidos: estudiante.apellidos,
    email: estudiante.email,
    materia: props.asistencia.materia,
    codigoMateria: props.asistencia.codigoMateria,
    fechaFalta: props.asistencia.fecha,
    registradoPor: props.asistencia.registradoPor || null,
    registradoPorEmail: props.asistencia.registradoPorEmail || null,
    tipo: form.value.tipo,
    motivo: form.value.motivo.trim(),
    archivo: nombreArchivo.value || null,
    archivoData: archivoData.value,
    estado: 'Pendiente',
    fechaSolicitud: nowLocalISO(),
    observaciones: null
  }

  emit('guardar', justificacion)
}
</script>

<style scoped>
/* Los estilos se heredan del CSS global */
</style>