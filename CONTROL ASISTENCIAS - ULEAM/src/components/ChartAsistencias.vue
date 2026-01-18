<template>
  <div class="charts-container">
    <!-- Gráfico de Pastel -->
    <div class="chart-wrapper">
      <canvas id="chartPastel" ref="chartPastelRef"></canvas>
    </div>
    <div class="chart-legend">
      <div class="legend-item">
        <span class="legend-color" style="background-color: #4CAF50;"></span>
        <span>Presente: {{ datos.presentes }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: #FF6B6B;"></span>
        <span>Ausente: {{ datos.ausentes }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: #FFC107;"></span>
        <span>Justificado: {{ datos.justificados }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import Chart from 'chart.js/auto'
import { useEstudiantesStore } from '@/stores/estudiantes'
import { useAsistenciasStore } from '@/stores/asistencias'

// Registrar elementos de Chart.js
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const chartPastelRef = ref(null)
let chartPastel = null

const estudiantesStore = useEstudiantesStore()
const asistenciasStore = useAsistenciasStore()

const datos = ref({
  presentes: 0,
  ausentes: 0,
  justificados: 0
})

const calcularDatos = () => {
  const stats = asistenciasStore.obtenerEstadisticas()
  datos.value = {
    presentes: stats.presentes,
    ausentes: stats.ausentes,
    justificados: stats.justificados
  }
}

const renderCharts = () => {
  if (!chartPastelRef.value) return

  // Gráfico de Pastel
  if (chartPastel) chartPastel.destroy()
  
  const total = datos.value.presentes + datos.value.ausentes + datos.value.justificados
  const displayData = total === 0 ? [1] : [datos.value.presentes, datos.value.ausentes, datos.value.justificados]
  const displayLabels = total === 0 ? ['Sin datos'] : ['Presente', 'Ausente', 'Justificado']
  const displayColors = total === 0 ? ['#cccccc'] : ['#4CAF50', '#FF6B6B', '#FFC107']
  const displayBorders = total === 0 ? ['#999999'] : ['#45a049', '#da5252', '#e0ad00']
  
  chartPastel = new Chart(chartPastelRef.value, {
    type: 'doughnut',
    data: {
      labels: displayLabels,
      datasets: [{
        data: displayData,
        backgroundColor: displayColors,
        borderColor: displayBorders,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      }
    }
  })
}

const actualizarGrafico = () => {
  calcularDatos()
  setTimeout(renderCharts, 50)
}

onMounted(() => {
  actualizarGrafico()
  
  // Observar cambios en las asistencias
  const unsubscribe = asistenciasStore.$subscribe(() => {
    actualizarGrafico()
  })
})
</script>

<style scoped>
.charts-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 280px;
}

.chart-legend {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 13px;
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 4px;
  background: #f9f9f9;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
</style>
