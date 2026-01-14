<template>
  <div class="modal-overlay" @click.self="$emit('cerrar')">
    <div class="modal">
      <div class="modal-header">
        <h2>📋 Revisar Justificación</h2>
        <button class="modal-close" @click="$emit('cerrar')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="info-box">
          <p class="info-text">
            <strong>📌 Información:</strong> Revisa la justificación del estudiante y aprueba o rechaza.
          </p>
        </div>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin-bottom: 12px; color: #2c3e50;">Información del Estudiante</h4>
          <p><strong>Nombre:</strong> {{ detalles.estudianteNombres }} {{ detalles.estudianteApellidos }}</p>
          <p><strong>Email:</strong> {{ detalles.estudianteEmail }}</p>
          <p><strong>Materia:</strong> {{ detalles.materia }}</p>
          <p><strong>Fecha de Falta:</strong> {{ formatearFecha(detalles.fechaFalta) }}</p>
        </div>
        
        <div style="background: #fff9e6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin-bottom: 12px; color: #2c3e50;">Detalles de la Justificación</h4>
          <p><strong>Tipo:</strong> {{ formatearTipo(detalles.tipoJustificacion) }}</p>
          <p><strong>Motivo:</strong></p>
          <p style="padding: 10px; background: white; border-radius: 6px; border-left: 3px solid #f39c12; margin-bottom: 15px;">
            {{ detalles.motivo }}
          </p>
          <p><strong>Fecha de Solicitud:</strong> {{ formatearFechaHora(justificacion.fechaCreacion) }}</p>
          
          <div style="margin-top: 15px;">
            <p style="margin-bottom: 8px;"><strong>Archivo adjunto:</strong> 
              <a 
                v-if="detalles.archivoData"
                :href="detalles.archivoData" 
                :download="detalles.archivo"
                target="_blank"
                style="color: #3498db; text-decoration: none;"
              >
                {{ detalles.archivo }}
              </a>
              <span v-else-if="detalles.archivo" style="color: #95a5a6;">
                {{ detalles.archivo }} (archivo guardado sin contenido)
              </span>
              <span v-else style="color: #95a5a6;">
                No hay archivo adjunto
              </span>
            </p>
            
            <!-- Vista previa del documento -->
            <div v-if="detalles.archivoData">
              <iframe 
                v-if="esPDF"
                :src="detalles.archivoData"
                style="width: 100%; height: 500px; border: 1px solid #ccc; border-radius: 6px; margin-top: 10px;"
                title="Vista previa del documento"
              ></iframe>
              <img 
                v-else-if="esImagen"
                :src="detalles.archivoData"
                :alt="detalles.archivo"
                style="width: 100%; max-height: 500px; object-fit: contain; border: 1px solid #ccc; border-radius: 6px; margin-top: 10px;"
              />
            </div>
          </div>
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button class="btn-danger" @click="$emit('rechazar')" style="flex: 1; padding: 12px;">
            ✗ Rechazar
          </button>
          <button class="btn-success" @click="$emit('aprobar')" style="flex: 1; padding: 12px;">
            ✓ Aprobar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatYMD } from '@/utils/validaciones'

const props = defineProps({
  justificacion: {
    type: Object,
    required: true
  }
})

defineEmits(['cerrar', 'aprobar', 'rechazar'])

const detalles = computed(() => props.justificacion?.detalles || {})

const esPDF = computed(() => {
  if (!detalles.value.archivoData) return false
  return detalles.value.archivoData.startsWith('data:application/pdf')
})

const esImagen = computed(() => {
  if (!detalles.value.archivoData) return false
  return detalles.value.archivoData.startsWith('data:image/')
})

const formatearFecha = (fecha) => {
  if (!fecha) return ''
  return formatYMD(fecha)
}

const formatearFechaHora = (fecha) => {
  if (!fecha) return ''
  const date = new Date(fecha)
  const dia = String(date.getDate()).padStart(2, '0')
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const año = date.getFullYear()
  const horas = String(date.getHours()).padStart(2, '0')
  const minutos = String(date.getMinutes()).padStart(2, '0')
  const periodo = date.getHours() >= 12 ? 'p. m.' : 'a. m.'
  
  return `${dia}/${mes}/${año}, ${horas}:${minutos} ${periodo}`
}

const formatearTipo = (tipo) => {
  const tipos = {
    medico: 'Certificado Médico',
    calamidad: 'Calamidad Doméstica',
    tramite: 'Trámite Institucional',
    otro: 'Otro'
  }
  return tipos[tipo] || tipo
}
</script>

<style scoped>
/* Los estilos se heredan del CSS global */
</style>