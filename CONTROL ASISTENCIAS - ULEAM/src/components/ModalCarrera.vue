<template>
  <div 
    class="modal-overlay modal-carrera-overlay"
    @click.self="$emit('cerrar')"
  >
    <div class="modal">
      <header class="modal-header">
        <h2>Nueva Carrera</h2>
        <button class="modal-close" @click="$emit('cerrar')">&times;</button>
      </header>

      <form @submit.prevent="guardar" class="modal-body">
        <div class="form-group">
          <label for="nombreCarrera">Nombre de la Carrera *</label>
          <input 
            id="nombreCarrera"
            v-model="form.nombre"
            class="input-styled" 
            placeholder="Ej: Ingeniería en Sistemas" 
            required
            autofocus
          >
          <span class="error-message" v-if="errores.nombre">
            {{ errores.nombre }}
          </span>
        </div>

        <div class="form-group">
          <label for="facultadCarrera">Facultad</label>
          <input 
            id="facultadCarrera"
            v-model="form.facultad"
            class="input-styled" 
            placeholder="Ej: Facultad de Ciencias Informáticas"
          >
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="$emit('cerrar')">
            Cancelar
          </button>
          <button type="submit" class="btn-primary">
            Agregar Carrera
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCarrerasStore } from '@/stores/carreras'

const carrerasStore = useCarrerasStore()

const emit = defineEmits(['cerrar', 'guardar'])

const form = ref({
  nombre: '',
  facultad: ''
})

const errores = ref({})

const guardar = () => {
  errores.value = {}
  
  if (!form.value.nombre.trim()) {
    errores.value.nombre = 'El nombre de la carrera es obligatorio'
    return
  }

  const exito = carrerasStore.agregarCarrera({
    nombre: form.value.nombre.trim(),
    facultad: form.value.facultad.trim()
  })

  if (!exito) {
    errores.value.nombre = 'Esta carrera ya existe'
    return
  }

  // Emitir el evento con la carrera guardada
  emit('guardar', { ...form.value })
  form.value = { nombre: '', facultad: '' }
}
</script>