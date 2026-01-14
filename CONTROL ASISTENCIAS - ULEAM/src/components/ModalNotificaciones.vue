<template>
  <div class="modal-overlay" @click.self="$emit('cerrar')">
    <div class="modal">
      <div class="modal-header">
        <h2>📬 Notificaciones Pendientes</h2>
        <button class="modal-close" @click="$emit('cerrar')">&times;</button>
      </div>
      <div class="modal-body">
        <div v-if="notificacionesPendientes.length === 0">
          <p style="text-align: center; color: var(--text-light);">
            No hay notificaciones pendientes
          </p>
        </div>
        <div v-else>
          <div 
            v-for="notif in notificacionesPendientes" 
            :key="notif.id"
            class="notification-card"
            @click="$emit('revisar', notif)"
          >
            <h4 class="notif-title">{{ notif.titulo }}</h4>
            <p class="notif-message">{{ notif.mensaje }}</p>
            <small class="notif-date">
              📅 {{ formatearFecha(notif.fechaCreacion) }}
            </small>
            <div class="notif-actions">
              <button 
                class="btn-primary btn-small" 
                @click.stop="$emit('revisar', notif)"
              >
                Ver Justificación
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificacionesStore } from '@/stores/notificaciones'

const notificacionesStore = useNotificacionesStore()

defineEmits(['cerrar', 'revisar'])

const notificacionesPendientes = computed(() => {
  return notificacionesStore.notificacionesPendientes
})

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-EC')
}
</script>

<style scoped>
/* Los estilos se heredan del CSS global */
</style>