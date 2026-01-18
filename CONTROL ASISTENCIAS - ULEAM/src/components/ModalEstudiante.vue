<template>
  <div 
    class="modal-overlay" 
    @click.self="$emit('cerrar')"
  >
    <div class="modal">
      <header class="modal-header">
        <h2>{{ modo === 'nuevo' ? 'Nuevo Estudiante' : 'Editar Estudiante' }}</h2>
        <button class="modal-close" @click="$emit('cerrar')">&times;</button>
      </header>

      <form @submit.prevent="guardar" class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label for="matricula">Matrícula</label>
            <input 
              id="matricula"
              v-model="form.matricula"
              class="input-styled" 
              placeholder="2023P1-43758"
              :disabled="modo === 'editar'"
            >
            <span class="error-message" v-if="errores.matricula">
              {{ errores.matricula }}
            </span>
          </div>
          <div class="form-group">
            <label for="cedula">Cédula</label>
            <input 
              id="cedula"
              v-model="form.cedula"
              class="input-styled" 
              placeholder="1234567890" 
              maxlength="10"
              @input="validarSoloNumeros('cedula')"
            >
            <span class="error-message" v-if="errores.cedula">
              {{ errores.cedula }}
            </span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="nombres">Nombres</label>
            <input 
              id="nombres"
              v-model="form.nombres"
              class="input-styled" 
              placeholder="Juan Carlos"
            >
            <span class="error-message" v-if="errores.nombres">
              {{ errores.nombres }}
            </span>
          </div>
          <div class="form-group">
            <label for="apellidos">Apellidos</label>
            <input 
              id="apellidos"
              v-model="form.apellidos"
              class="input-styled" 
              placeholder="Pérez"
            >
            <span class="error-message" v-if="errores.apellidos">
              {{ errores.apellidos }}
            </span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="emailEstudiante">Email institucional</label>
            <input 
              id="emailEstudiante"
              v-model="form.email"
              class="input-styled" 
              placeholder="e123456@live.uleam.edu.ec"
            >
            <span class="error-message" v-if="errores.email">
              {{ errores.email }}
            </span>
          </div>
          <div class="form-group">
            <label for="telefono">Teléfono</label>
            <input 
              id="telefono"
              v-model="form.telefono"
              class="input-styled" 
              placeholder="0987654321" 
              maxlength="10"
              @input="validarSoloNumeros('telefono')"
            >
            <span class="error-message" v-if="errores.telefono">
              {{ errores.telefono }}
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="carrera">Carrera</label>
          <div class="carrera-select-container">
            <select 
              id="carrera"
              v-model="form.carrera"
              class="select-styled"
            >
              <option value="">Seleccione una carrera</option>
              <option 
                v-for="carrera in carrerasStore.carreras" 
                :key="carrera.nombre"
                :value="carrera.nombre"
              >
                {{ carrera.nombre }}
              </option>
            </select>
            <button 
              type="button" 
              class="btn-add-carrera" 
              @click="abrirModalCarrera"
            >
              + Nueva Carrera
            </button>
          </div>
          <span class="error-message" v-if="errores.carrera">
            {{ errores.carrera }}
          </span>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="$emit('cerrar')">
            Cancelar
          </button>
          <button type="submit" class="btn-primary">
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useCarrerasStore } from '@/stores/carreras'
import { 
  validarEmail, 
  validarEmailULEAM, 
  validarCedula, 
  validarTelefono,
  validarSoloLetras,
  validarMatricula 
} from '@/utils/validaciones'

const carrerasStore = useCarrerasStore()

const props = defineProps({
  estudiante: {
    type: Object,
    default: null
  },
  modo: {
    type: String,
    default: 'nuevo'
  }
})

const emit = defineEmits(['cerrar', 'guardar', 'abrir-modal-carrera'])

const abrirModalCarrera = () => {
  // Emitir evento para que el padre maneje la apertura del modal de carrera
  emit('abrir-modal-carrera')
}

const form = ref({
  matricula: '',
  cedula: '',
  nombres: '',
  apellidos: '',
  email: '',
  telefono: '',
  carrera: ''
})

const errores = ref({})

// Inicializar formulario cuando cambia el prop estudiante
watch(() => props.estudiante, (nuevoEstudiante) => {
  if (nuevoEstudiante) {
    form.value = { ...nuevoEstudiante }
  } else {
    // Limpiar formulario para nuevo estudiante
    form.value = {
      matricula: '',
      cedula: '',
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      carrera: ''
    }
  }
  // Limpiar errores
  errores.value = {}
}, { immediate: true })

const validarSoloNumeros = (campo) => {
  form.value[campo] = form.value[campo].replace(/\D/g, '')
}

const validarFormulario = () => {
  errores.value = {}
  let isValid = true

  if (!form.value.matricula || !validarMatricula(form.value.matricula)) {
    errores.value.matricula = 'Formato inválido. Ejemplo: 2023P1-43758'
    isValid = false
  }

  if (!form.value.cedula) {
    errores.value.cedula = 'La cédula es obligatoria'
    isValid = false
  } else {
    const validacionCedula = validarCedula(form.value.cedula)
    if (!validacionCedula.valido) {
      errores.value.cedula = validacionCedula.mensaje
      isValid = false
    }
  }

  if (!form.value.nombres || !validarSoloLetras(form.value.nombres) || form.value.nombres.length < 3) {
    errores.value.nombres = 'Nombres inválidos (mínimo 3 caracteres, solo letras)'
    isValid = false
  }

  if (!form.value.apellidos || !validarSoloLetras(form.value.apellidos) || form.value.apellidos.length < 3) {
    errores.value.apellidos = 'Apellidos inválidos (mínimo 3 caracteres, solo letras)'
    isValid = false
  }

  if (!form.value.email || !validarEmail(form.value.email) || !validarEmailULEAM(form.value.email)) {
    errores.value.email = 'Email institucional inválido (@uleam.edu.ec o @live.uleam.edu.ec)'
    isValid = false
  }

  if (!form.value.telefono) {
    errores.value.telefono = 'El teléfono es obligatorio'
    isValid = false
  } else {
    const validacionTelefono = validarTelefono(form.value.telefono)
    if (!validacionTelefono.valido) {
      errores.value.telefono = validacionTelefono.mensaje
      isValid = false
    }
  }

  if (!form.value.carrera) {
    errores.value.carrera = 'Debe seleccionar una carrera'
    isValid = false
  }

  return isValid
}

const guardar = () => {
  if (validarFormulario()) {
    emit('guardar', { ...form.value })
  }
}
</script>