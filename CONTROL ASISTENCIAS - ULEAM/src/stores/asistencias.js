import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useAsistenciasStore = defineStore('asistencias', () => {
  const asistencias = ref([])
  const authStore = useAuthStore()

  const cargarAsistencias = () => {
    const data = localStorage.getItem('asistencias')
    asistencias.value = data ? JSON.parse(data) : []
  }

  const guardarAsistencias = () => {
    localStorage.setItem('asistencias', JSON.stringify(asistencias.value))
  }

  const asistenciasVisibles = computed(() => {
    if (!authStore.usuarioActual) return []

    const usuarioEmail = authStore.usuarioActual.email?.toLowerCase()
    
    if (authStore.usuarioActual.tipo === 'docente') {
      return asistencias.value.filter(a => 
        a.registradoPorEmail && 
        usuarioEmail && 
        a.registradoPorEmail.toLowerCase() === usuarioEmail
      )
    }
    
    if (authStore.usuarioActual.tipo === 'estudiante') {
      return asistencias.value.filter(a => 
        a.email && 
        usuarioEmail && 
        a.email.toLowerCase() === usuarioEmail
      )
    }
    
    return asistencias.value
  })

  const registrarAsistencia = (asistencia) => {
    if (authStore.usuarioActual) {
      asistencia.registradoPor = authStore.usuarioActual.nombre
      asistencia.registradoPorEmail = authStore.usuarioActual.email
      asistencia.fechaRegistro = new Date().toISOString()
    }
    asistencias.value.push(asistencia)
    guardarAsistencias()
  }

  const registrarAsistenciasMasivo = (listaAsistencias) => {
    listaAsistencias.forEach(asistencia => {
      if (authStore.usuarioActual) {
        asistencia.registradoPor = authStore.usuarioActual.nombre
        asistencia.registradoPorEmail = authStore.usuarioActual.email
        asistencia.fechaRegistro = new Date().toISOString()
      }
    })
    
    asistencias.value.push(...listaAsistencias)
    guardarAsistencias()
  }

  const eliminarAsistenciasPorFechaMateria = (fecha, codigoMateria) => {
    const usuarioEmail = authStore.usuarioActual?.email?.toLowerCase()
    asistencias.value = asistencias.value.filter(a => 
      !(a.fecha === fecha && 
        a.codigoMateria === codigoMateria && 
        a.registradoPorEmail?.toLowerCase() === usuarioEmail)
    )
    guardarAsistencias()
  }

  const obtenerEstadisticas = () => {
    const hoy = new Date().toISOString().split('T')[0]
    const usuarioEmail = authStore.usuarioActual?.email?.toLowerCase()
    
    let filtradas = asistenciasVisibles.value.filter(a => a.fecha === hoy)
    
    if (authStore.usuarioActual?.tipo === 'docente') {
      filtradas = filtradas.filter(a => 
        a.registradoPorEmail?.toLowerCase() === usuarioEmail
      )
    }

    const presentes = filtradas.filter(a => a.estado === 'presente').length
    const ausentes = filtradas.filter(a => a.estado === 'ausente').length

    return { presentes, ausentes, total: filtradas.length }
  }

  cargarAsistencias()

  return {
    asistencias,
    asistenciasVisibles,
    cargarAsistencias,
    registrarAsistencia,
    registrarAsistenciasMasivo,
    eliminarAsistenciasPorFechaMateria,
    obtenerEstadisticas
  }
})