<template>
  <div class="dashboard-container">
    <Sidebar />
    
    <main class="main-content">
      <header class="top-bar">
        <h1>Panel de Control</h1>
        <div class="date-info">
          <span id="currentDate">{{ fechaActual }}</span>
        </div>
      </header>
      
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-icon students-icon">👨‍🎓</div>
          <div class="card-content">
            <h3>Estudiantes Registrados</h3>
            <p class="card-number">{{ totalEstudiantes }}</p>
          </div>
        </div>
        
        <div class="card">
          <div class="card-icon present-icon">✓</div>
          <div class="card-content">
            <h3>Asistencias</h3>
            <p class="card-number">{{ estadisticas.presentes }}</p>
          </div>
        </div>
        
        <div class="card">
          <div class="card-icon absent-icon">✗</div>
          <div class="card-content">
            <h3>Inasistencias</h3>
            <p class="card-number">{{ estadisticas.ausentes }}</p>
          </div>
        </div>
      </div>

      <!-- Gráficos de Estadísticas -->
      <section class="charts-section">
        <div class="dashboard-grid">
          <div class="card" style="grid-column: 1 / -1; background: white; padding: 20px;">
            <h2 style="margin: 0 0 20px 0; color: #333; font-size: 18px;">Análisis de Asistencias</h2>
            <ChartAsistencias />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import ChartAsistencias from '@/components/ChartAsistencias.vue'
import { useEstudiantesStore } from '@/stores/estudiantes'
import { useAsistenciasStore } from '@/stores/asistencias'

const estudiantesStore = useEstudiantesStore()
const asistenciasStore = useAsistenciasStore()

const fechaActual = ref('')

const totalEstudiantes = computed(() => {
  return estudiantesStore.estudiantesVisibles.length
})

const estadisticas = computed(() => {
  return asistenciasStore.obtenerEstadisticas()
})

const actualizarFecha = () => {
  const hoy = new Date()
  const opciones = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  fechaActual.value = hoy.toLocaleDateString('es-ES', opciones)
}

onMounted(() => {
  actualizarFecha()
})
</script>

<style scoped>
/* Los estilos se heredan del CSS global */
.charts-section {
  margin-top: 30px;
}

.charts-section .card {
  display: flex;
  flex-direction: column;
}

.charts-section h2 {
  color: #333;
  margin: 0 0 20px 0;
  padding: 0;
  font-size: 18px;
  font-weight: 600;
  width: 100%;
  order: -1;
}
</style>