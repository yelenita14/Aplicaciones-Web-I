<template>
  <div class="dashboard-container">
    <Sidebar />
    
    <!-- Mensaje de alerta flotante (fuera del main-content) -->
    <div v-if="componenteMontado && mensajeAlerta" :class="`notificacion ${claseAlerta} show`">
      {{ mensajeAlerta }}
    </div>

    <main class="main-content">
      <header class="top-bar">
        <h1>Gestión de Materias</h1>
        <button class="btn-primary" @click="nuevaMateria">
          + Nueva Materia
        </button>
      </header>
      
      <div class="filters">
        <input 
          type="text" 
          v-model="busqueda"
          placeholder="Buscar materia..."
        >
        <select v-model="filtroNivel">
          <option value="">Todos los niveles</option>
          <option v-for="n in 9" :key="n" :value="String(n)">
            Nivel {{ n }}
          </option>
        </select>
        <button class="btn-primary" @click="buscarMaterias">
          Buscar
        </button>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Materia</th>
              <th>Docente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="materia in materiasFiltradas" :key="materia.codigo">
              <td>{{ materia.codigo }}</td>
              <td>{{ materia.nombre }}</td>
              <td>{{ materia.docente }}</td>
              <td>
                <button 
                  class="btn-edit" 
                  @click="editarMateria(materia)"
                >
                  Editar
                </button>
                <button 
                  class="btn-delete" 
                  @click="eliminarMateriaConfirm(materia.codigo)"
                >
                  Eliminar
                </button>
              </td>
            </tr>
            <tr v-if="materiasFiltradas.length === 0">
              <td colspan="4" style="text-align: center; padding: 2rem; color: #666;">
                No hay materias registradas
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal Materia -->
    <ModalMateria
      v-if="modalMateriaVisible"
      :materia="materiaSeleccionada"
      :modo="modoModal"
      @cerrar="cerrarModalMateria"
      @guardar="guardarMateria"
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
import ModalMateria from '@/components/ModalMateria.vue'
import ModalConfirm from '@/components/ModalConfirm.vue'
import { useMateriasStore } from '@/stores/materias'

const materiasStore = useMateriasStore()

const busqueda = ref('')
const filtroNivel = ref('')
const modalMateriaVisible = ref(false)
const modalConfirmVisible = ref(false)
const materiaSeleccionada = ref(null)
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

const materiasFiltradas = computed(() => {
  // IMPORTANTE: Usar materiasVisibles en lugar de materias
  let resultado = materiasStore.materiasVisibles

  if (filtroNivel.value) {
    resultado = resultado.filter(m => m.nivel === filtroNivel.value)
  }

  if (busqueda.value) {
    const busq = busqueda.value.toLowerCase()
    resultado = resultado.filter(m => {
      const texto = `${m.codigo} ${m.nombre}`.toLowerCase()
      return texto.includes(busq)
    })
  }

  return resultado
})

const mostrarAlerta = (mensaje, tipo = 'error') => {
  if (timeoutAlerta) {
    clearTimeout(timeoutAlerta)
  }
  
  mensajeAlerta.value = mensaje
  tipoAlerta.value = tipo
  
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

const buscarMaterias = () => {
  // La búsqueda es reactiva, esta función es solo para consistencia con la UI original
}

const nuevaMateria = () => {
  materiaSeleccionada.value = null
  modoModal.value = 'nuevo'
  modalMateriaVisible.value = true
}

const editarMateria = (materia) => {
  materiaSeleccionada.value = { ...materia }
  modoModal.value = 'editar'
  modalMateriaVisible.value = true
}

const eliminarMateriaConfirm = (codigo) => {
  mensajeConfirm.value = '¿Estás seguro de eliminar esta materia? Se eliminarán también las asistencias relacionadas.'
  accionPendiente.value = () => {
    try {
      const resultado = materiasStore.eliminarMateria(codigo)
      if (resultado) {
        mostrarAlerta('Materia eliminada exitosamente', 'success')
      }
    } catch (error) {
      mostrarAlerta(error.message, 'error')
    }
  }
  modalConfirmVisible.value = true
}

const cerrarModalMateria = () => {
  modalMateriaVisible.value = false
  materiaSeleccionada.value = null
}

const guardarMateria = (materia) => {
  try {
    if (modoModal.value === 'nuevo') {
      materiasStore.agregarMateria(materia)
      cerrarModalMateria()
      setTimeout(() => {
        mostrarAlerta('Materia guardada exitosamente', 'success')
      }, 300)
    } else {
      materiasStore.editarMateria(materia.codigo, materia)
      cerrarModalMateria()
      setTimeout(() => {
        mostrarAlerta('Materia guardada exitosamente', 'success')
      }, 300)
    }
  } catch (error) {
    mostrarAlerta(error.message, 'error')
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
  setTimeout(() => {
    componenteMontado.value = true
  }, 100)
})
</script>