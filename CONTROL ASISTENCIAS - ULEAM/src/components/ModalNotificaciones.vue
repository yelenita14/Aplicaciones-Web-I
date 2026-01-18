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
  if (!fecha) return ''
  try {
    const date = new Date(fecha)
    const dia = String(date.getDate()).padStart(2, '0')
    const mes = String(date.getMonth() + 1).padStart(2, '0')
    const año = date.getFullYear()
    const horas = String(date.getHours()).padStart(2, '0')
    const minutos = String(date.getMinutes()).padStart(2, '0')
    const segundos = String(date.getSeconds()).padStart(2, '0')
    const periodo = date.getHours() >= 12 ? 'P.M' : 'A.M'
    
    return `${dia}/${mes}/${año}, ${horas}:${minutos}:${segundos} ${periodo}`
  } catch (e) {
    return fecha
  }
}
</script>

<style scoped>
/* Los estilos se heredan del CSS global */
</style>