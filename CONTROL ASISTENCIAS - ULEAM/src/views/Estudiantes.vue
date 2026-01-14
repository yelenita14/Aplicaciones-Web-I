<template>
  <div class="dashboard-container">
    <Sidebar />
    
    <!-- Mensaje de alerta flotante (fuera del main-content) -->
    <div v-if="componenteMontado && mensajeAlerta" :class="`notificacion ${claseAlerta} show`">
      {{ mensajeAlerta }}
    </div>

    <main class="main-content">
      <header class="top-bar">
        <h1>Gestión de Estudiantes</h1>
        <button class="btn-primary" @click="nuevoEstudiante">
          + Agregar Estudiante
        </button>
      </header>
      
      <div class="filters">
        <input 
          type="text" 
          v-model="busqueda"
          placeholder="Buscar estudiante..."
        >
        <select v-model="filtroCarrera">
          <option value="">Todas las carreras</option>
          <option 
            v-for="carrera in carrerasStore.carreras" 
            :key="carrera.nombre"
            :value="carrera.nombre"
          >
            {{ carrera.nombre }}
          </option>
        </select>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Nombre</th>
              <th>Carrera</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="estudiante in estudiantesFiltrados" :key="estudiante.matricula">
              <td>{{ estudiante.matricula }}</td>
              <td>{{ estudiante.nombres }} {{ estudiante.apellidos }}</td>
              <td>{{ estudiante.carrera }}</td>
              <td>{{ estudiante.email }}</td>
              <td>
                <button 
                  class="btn-edit" 
                  @click="editarEstudiante(estudiante)"
                >
                  Editar
                </button>
                <button 
                  class="btn-delete" 
                  @click="eliminarEstudianteConfirm(estudiante.matricula)"
                >
                  Eliminar
                </button>
              </td>
            </tr>
            <tr v-if="estudiantesFiltrados.length === 0">
              <td colspan="5" style="text-align: center; padding: 2rem; color: #666;">
                No hay estudiantes registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal Estudiante -->
    <ModalEstudiante
      v-if="modalEstudianteVisible"
      :estudiante="estudianteSeleccionado"
      :modo="modoModal"
      @cerrar="cerrarModalEstudiante"
      @guardar="guardarEstudiante"
      @abrir-modal-carrera="abrirModalCarreraDesdeEstudiante"
    />

    <!-- Modal Carrera (aparece encima del modal de estudiante) -->
    <ModalCarrera
      v-if="modalCarreraVisible"
      @cerrar="cerrarModalCarrera"
      @guardar="guardarCarrera"
    />

    <!-- Modal Confirm -->
    <ModalConfirm
      v-if="modalConfirmVisible"
      :mensaje="mensajeConfirm"
      @confirmar="confirmarAccion"
      @cancelar="cancelarAccion"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeMount } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import ModalEstudiante from '@/components/ModalEstudiante.vue'
import ModalCarrera from '@/components/ModalCarrera.vue'
import ModalConfirm from '@/components/ModalConfirm.vue'
import { useEstudiantesStore } from '@/stores/estudiantes'
import { useCarrerasStore } from '@/stores/carreras'

const estudiantesStore = useEstudiantesStore()
const carrerasStore = useCarrerasStore()

const busqueda = ref('')
const filtroCarrera = ref('')
const modalEstudianteVisible = ref(false)
const modalCarreraVisible = ref(false)
const modalConfirmVisible = ref(false)
const estudianteSeleccionado = ref(null)
const modoModal = ref('nuevo')
const mensajeConfirm = ref('')
const accionPendiente = ref(null)

// Para mensajes de alerta
const mensajeAlerta = ref('')
const tipoAlerta = ref('error') // 'error', 'success', 'info'
const claseAlerta = computed(() => {
  const clases = {
    error: 'alert-error',
    success: 'alert-success',
    info: 'alert-info'
  }
  return clases[tipoAlerta.value] || 'alert-info'
})
const componenteMontado = ref(false)
let timeoutAlerta = null

const estudiantesFiltrados = computed(() => {
  let resultado = estudiantesStore.estudiantesVisibles

  if (filtroCarrera.value) {
    resultado = resultado.filter(e => e.carrera === filtroCarrera.value)
  }

  if (busqueda.value) {
    const busq = busqueda.value.toLowerCase()
    resultado = resultado.filter(e => {
      const texto = `${e.matricula} ${e.nombres} ${e.apellidos} ${e.email}`.toLowerCase()
      return texto.includes(busq)
    })
  }

  return resultado
})

const mostrarAlerta = (mensaje, tipo = 'error') => {
  // Limpiar timeout anterior si existe
  if (timeoutAlerta) {
    clearTimeout(timeoutAlerta)
  }
  
  mensajeAlerta.value = mensaje
  tipoAlerta.value = tipo
  
  // Auto-ocultar después de 5 segundos
  timeoutAlerta = setTimeout(() => {
    cerrarAlerta()
  }, 5000)
}

const cerrarAlerta = () => {
  mensajeAlerta.value = ''
  if (timeoutAlerta) {
    clearTimeout(timeoutAlerta)
    timeoutAlerta = null
  }
}

const nuevoEstudiante = () => {
  console.log('Abriendo modal nuevo estudiante')
  estudianteSeleccionado.value = null
  modoModal.value = 'nuevo'
  modalEstudianteVisible.value = true
  console.log('Modal visible:', modalEstudianteVisible.value)
}

const editarEstudiante = (estudiante) => {
  estudianteSeleccionado.value = { ...estudiante }
  modoModal.value = 'editar'
  modalEstudianteVisible.value = true
}

const eliminarEstudianteConfirm = (matricula) => {
  mensajeConfirm.value = '¿Estás seguro de eliminar este estudiante? Se eliminarán también sus asistencias y justificaciones.'
  accionPendiente.value = () => {
    try {
      const resultado = estudiantesStore.eliminarEstudiante(matricula)
      if (resultado) {
        mostrarAlerta('Estudiante eliminado exitosamente', 'success')
      }
    } catch (error) {
      mostrarAlerta(error.message, 'error')
    }
  }
  modalConfirmVisible.value = true
}

const cerrarModalEstudiante = () => {
  modalEstudianteVisible.value = false
  estudianteSeleccionado.value = null
}

const guardarEstudiante = (estudiante) => {
  try {
    if (modoModal.value === 'nuevo') {
      estudiantesStore.agregarEstudiante(estudiante)
      cerrarModalEstudiante()
      // Mostrar alerta después de cerrar el modal (300ms para animación)
      setTimeout(() => {
        mostrarAlerta('Estudiante guardado exitosamente', 'success')
      }, 300)
    } else {
      estudiantesStore.editarEstudiante(estudiante.matricula, estudiante)
      cerrarModalEstudiante()
      // Mostrar alerta después de cerrar el modal (300ms para animación)
      setTimeout(() => {
        mostrarAlerta('Estudiante guardado exitosamente', 'success')
      }, 300)
    }
  } catch (error) {
    // Mostrar el error en una alerta SIN cerrar el modal
    mostrarAlerta(error.message, 'error')
    // No cerrar el modal cuando hay error para que el usuario pueda corregir
  }
}

const cerrarModalCarrera = () => {
  modalCarreraVisible.value = false
  // No es necesario reabrir el modal de estudiante porque nunca se cerró
}

const abrirModalCarreraDesdeEstudiante = () => {
  // Simplemente abrir el modal de carrera SIN cerrar el de estudiante
  // El modal de carrera aparecerá encima gracias a su z-index mayor (10000 vs 9999)
  modalCarreraVisible.value = true
}

const guardarCarrera = (carrera) => {
  const exito = carrerasStore.agregarCarrera(carrera)
  
  if (exito) {
    mostrarAlerta('Carrera agregada exitosamente', 'success')
  } else {
    mostrarAlerta('La carrera ya existe', 'error')
  }
  
  // Solo cerrar el modal de carrera, el de estudiante sigue abierto
  cerrarModalCarrera()
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
}

// Limpiar alertas ANTES de montar el componente
onBeforeMount(() => {
  mensajeAlerta.value = ''
  tipoAlerta.value = 'error'
  if (timeoutAlerta) {
    clearTimeout(timeoutAlerta)
    timeoutAlerta = null
  }
})

// Activar alertas solo después de montar el componente
onMounted(() => {
  cerrarAlerta()
  // Activar las alertas solo después de que el componente esté completamente montado
  setTimeout(() => {
    componenteMontado.value = true
  }, 100)
})
</script>