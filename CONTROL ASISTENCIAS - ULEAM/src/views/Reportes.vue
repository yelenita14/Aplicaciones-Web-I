<template>
  <div class="dashboard-container">
    <Sidebar />
    
    <main class="main-content">
      <header class="top-bar">
        <h1>Reportes de Asistencia</h1>
      </header>
      
      <div class="report-filters">
        <h3>Generar Reporte</h3>
        <form @submit.prevent="generarReporte">
          <div class="form-row">
            <div class="form-group">
              <label for="tipoReporte">Tipo de Reporte:</label>
              <select 
                id="tipoReporte"
                v-model="tipoReporte"
                required
              >
                <option value="">Seleccione...</option>
                <option value="estudiante">Por Estudiante</option>
                <option value="materia">Por Materia</option>
                <option value="periodo">Por Período</option>
                <option value="general">General</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="fechaInicio">Fecha Inicio:</label>
              <input 
                type="date" 
                id="fechaInicio"
                v-model="fechaInicio"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="fechaFin">Fecha Fin:</label>
              <input 
                type="date" 
                id="fechaFin"
                v-model="fechaFin"
                required
              >
            </div>
          </div>
          <button type="submit" class="btn-primary">
            Generar Reporte
          </button>
        </form>
      </div>
    </main>

    <!-- Notification Toast -->
    <Notification
      v-if="notificationVisible"
      :mensaje="notificationMensaje"
      :tipo="notificationTipo"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Notification from '@/components/Notification.vue'
import { useAsistenciasStore } from '@/stores/asistencias'
import { generarReportePDF } from '@/utils/reportes'

const asistenciasStore = useAsistenciasStore()

const tipoReporte = ref('')
const fechaInicio = ref('')
const fechaFin = ref('')

// Notification
const notificationVisible = ref(false)
const notificationMensaje = ref('')
const notificationTipo = ref('info')

const generarReporte = () => {
  // Validar fechas
  if (!tipoReporte.value) {
    mostrarNotificacion('Debe seleccionar un tipo de reporte', 'error')
    return
  }

  if (!fechaInicio.value || !fechaFin.value) {
    mostrarNotificacion('Debe seleccionar ambas fechas', 'error')
    return
  }

  if (new Date(fechaInicio.value) > new Date(fechaFin.value)) {
    mostrarNotificacion('La fecha de inicio no puede ser mayor que la fecha fin', 'error')
    return
  }

  // Filtrar asistencias por rango de fechas
  const inicio = new Date(fechaInicio.value)
  const fin = new Date(fechaFin.value)
  
  const asistenciasEnRango = asistenciasStore.asistenciasVisibles.filter(a => {
    const fecha = new Date(a.fecha)
    return fecha >= inicio && fecha <= fin
  })

  if (asistenciasEnRango.length === 0) {
    mostrarNotificacion('No hay datos para generar el reporte en el rango de fechas seleccionado', 'error')
    return
  }

  // Generar PDF
  try {
    generarReportePDF(tipoReporte.value, fechaInicio.value, fechaFin.value, asistenciasEnRango)
    mostrarNotificacion('✓ Reporte PDF generado exitosamente', 'success')
  } catch (error) {
    console.error('Error generando reporte:', error)
    mostrarNotificacion('Error al generar el reporte', 'error')
  }
}

const mostrarNotificacion = (mensaje, tipo) => {
  notificationMensaje.value = mensaje
  notificationTipo.value = tipo
  notificationVisible.value = true
  
  setTimeout(() => {
    notificationVisible.value = false
  }, 5000)
}
</script>

<style scoped>
/* Los estilos se heredan del CSS global */
</style>