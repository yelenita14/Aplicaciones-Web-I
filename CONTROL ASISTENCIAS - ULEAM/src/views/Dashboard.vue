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
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
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
</style>