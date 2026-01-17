<template>
  <div class="modal-overlay" @click.self="$emit('cerrar')">
    <div class="modal">
      <header class="modal-header">
        <h2>{{ modo === 'nuevo' ? 'Nueva Materia' : 'Editar Materia' }}</h2>
        <button class="modal-close" @click="$emit('cerrar')">&times;</button>
      </header>

      <form @submit.prevent="guardar" class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label for="codigoMateria">Código</label>
            <input 
              id="codigoMateria"
              v-model="form.codigo"
              class="input-styled" 
              placeholder="IS-001"
              :disabled="modo === 'editar'"
            >
            <span class="error-message" v-if="errores.codigo">
              {{ errores.codigo }}
            </span>
          </div>
          <div class="form-group">
            <label for="nivelMateria">Nivel</label>
            <select 
              id="nivelMateria"
              v-model="form.nivel"
              class="select-styled"
            >
              <option value="">Seleccione nivel</option>
              <option v-for="n in 9" :key="n" :value="String(n)">
                {{ n }}
              </option>
            </select>
            <span class="error-message" v-if="errores.nivel">
              {{ errores.nivel }}
            </span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="nombreMateria">Nombre de la materia</label>
            <input 
              id="nombreMateria"
              v-model="form.nombre"
              class="input-styled" 
              placeholder="Ingeniería de Software II"
            >
            <span class="error-message" v-if="errores.nombre">
              {{ errores.nombre }}
            </span>
          </div>
          <div class="form-group">
            <label for="creditosMateria">Créditos</label>
            <input 
              id="creditosMateria"
              v-model.number="form.creditos"
              type="number" 
              min="1" 
              max="200" 
              class="input-styled" 
              placeholder="3"
            >
            <span class="error-message" v-if="errores.creditos">
              {{ errores.creditos }}
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="docenteMateria">Docente</label>
          <input 
            id="docenteMateria"
            v-model="form.docente"
            class="input-styled" 
            placeholder="Juan Pérez"
          >
          <span class="error-message" v-if="errores.docente">
            {{ errores.docente }}
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
import { validarSoloLetras } from '@/utils/validaciones'
import { useMateriasStore } from '@/stores/materias'

const materiasStore = useMateriasStore()

const props = defineProps({
  materia: {
    type: Object,
    default: null
  },
  modo: {
    type: String,
    default: 'nuevo'
  }
})

const emit = defineEmits(['cerrar', 'guardar'])

const form = ref({
  codigo: '',
  nombre: '',
  nivel: '',
  creditos: '',
  docente: ''
})

const errores = ref({})

watch(() => props.materia, (nuevaMateria) => {
  if (nuevaMateria) {
    form.value = { ...nuevaMateria }
  }
}, { immediate: true })

const validarFormulario = () => {
  errores.value = {}
  let isValid = true

  if (!form.value.codigo || form.value.codigo.length < 3) {
    errores.value.codigo = 'El código debe tener al menos 3 caracteres'
    isValid = false
  }

  // Si es nuevo, verificar que el código no exista
  if (props.modo === 'nuevo') {
    const existe = materiasStore.materias.find(m => m.codigo === form.value.codigo)
    if (existe) {
      errores.value.codigo = 'El código ya existe'
      isValid = false
    }
  }

  if (!form.value.nombre || form.value.nombre.length < 3) {
    errores.value.nombre = 'El nombre debe tener al menos 3 caracteres'
    isValid = false
  }

  if (!form.value.nivel) {
    errores.value.nivel = 'Debe seleccionar un nivel'
    isValid = false
  }

  if (!form.value.creditos || form.value.creditos < 1 || form.value.creditos > 200) {
    errores.value.creditos = 'Los créditos deben estar entre 1 y 200'
    isValid = false
  }

  if (!form.value.docente || !validarSoloLetras(form.value.docente)) {
    errores.value.docente = 'Nombre de docente inválido (solo letras)'
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

<style scoped>
</style>