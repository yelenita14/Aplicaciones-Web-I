<template>
  <div class="modal-flotante" @click.self="$emit('cancelar')">
    <div class="modal-contenido">
      <p>{{ mensaje }}</p>
      <div class="modal-botones">
        <button class="btn-confirmar" @click="$emit('confirmar')">
          Confirmar
        </button>
        <button class="btn-cancelar" @click="$emit('cancelar')">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  mensaje: {
    type: String,
    default: '¿Estás seguro?'
  }
})

defineEmits(['confirmar', 'cancelar'])
</script>

<style scoped>
</style>