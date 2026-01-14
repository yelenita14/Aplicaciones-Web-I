import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useJustificacionesStore = defineStore('justificaciones', () => {
  const justificaciones = ref([])

  const cargarJustificaciones = () => {
    const data = localStorage.getItem('justificaciones')
    justificaciones.value = data ? JSON.parse(data) : []
  }

  const guardarJustificaciones = () => {
    localStorage.setItem('justificaciones', JSON.stringify(justificaciones.value))
  }

  const agregarJustificacion = (justificacion) => {
    justificaciones.value.push(justificacion)
    guardarJustificaciones()
  }

  const actualizarEstado = (id, nuevoEstado, observacion = null) => {
    const justif = justificaciones.value.find(j => j.id === id)
    if (justif) {
      justif.estado = nuevoEstado
      if (observacion) {
        justif.observaciones = observacion
      }
      justif.fechaRevision = new Date().toISOString()
      guardarJustificaciones()
    }
  }

  cargarJustificaciones()

  return {
    justificaciones,
    cargarJustificaciones,
    agregarJustificacion,
    actualizarEstado
  }
})