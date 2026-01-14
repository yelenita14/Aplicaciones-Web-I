import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useNotificacionesStore = defineStore('notificaciones', () => {
  const notificaciones = ref([])
  const authStore = useAuthStore()

  const normalize = (str) => {
    if (!str) return ''
    return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
  }

  const cargarNotificaciones = () => {
    const data = localStorage.getItem('notificacionesDocente')
    notificaciones.value = data ? JSON.parse(data) : []
  }

  const guardarNotificaciones = () => {
    localStorage.setItem('notificacionesDocente', JSON.stringify(notificaciones.value))
  }

  const notificacionesPendientes = computed(() => {
    const usuarioActual = authStore.usuarioActual
    if (!usuarioActual) return []

    return notificaciones.value.filter(n => {
      if (n.estado !== 'no_leida') return false
      if (n.broadcast) return true
      
      if (n.destinatarioEmail && usuarioActual.email) {
        return n.destinatarioEmail.toLowerCase() === usuarioActual.email.toLowerCase()
      }
      
      if (n.destinatarioNombre && usuarioActual.nombre) {
        return normalize(n.destinatarioNombre) === normalize(usuarioActual.nombre) ||
               normalize(usuarioActual.nombre).includes(normalize(n.destinatarioNombre))
      }
      
      return false
    })
  })

  const cantidadPendientes = computed(() => notificacionesPendientes.value.length)

  const crearNotificacionJustificacion = (justificacion) => {
    let destinatarioEmail = null
    let destinatarioNombre = null

    try {
      const materias = JSON.parse(localStorage.getItem('materias') || '[]')
      const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')

      if (justificacion.registradoPorEmail) {
        destinatarioEmail = justificacion.registradoPorEmail
        const uByEmail = usuarios.find(x => 
          x.email && x.email.toLowerCase() === destinatarioEmail.toLowerCase()
        )
        if (uByEmail && uByEmail.nombre) destinatarioNombre = uByEmail.nombre
      } else if (justificacion.registradoPor) {
        destinatarioNombre = justificacion.registradoPor
        const uByName = usuarios.find(x => 
          x.nombre && x.nombre.toLowerCase() === destinatarioNombre.toLowerCase()
        )
        if (uByName && uByName.email) destinatarioEmail = uByName.email
        if (destinatarioNombre.includes('@')) destinatarioEmail = destinatarioNombre
      }

      if (!destinatarioEmail && !destinatarioNombre) {
        const mat = materias.find(m => 
          (m.codigo && m.codigo === justificacion.codigoMateria) || 
          (m.nombre && m.nombre === justificacion.materia)
        )
        if (mat && mat.docente) {
          destinatarioNombre = mat.docente
          if (mat.docente.includes('@')) {
            destinatarioEmail = mat.docente
          } else {
            const u = usuarios.find(x => 
              x.nombre && x.nombre.toLowerCase() === mat.docente.toLowerCase()
            )
            if (u && u.email) destinatarioEmail = u.email
          }
        }
      }
    } catch (e) {
      console.error('Error resolviendo docente para notificación', e)
    }

    const isBroadcast = !destinatarioEmail && !destinatarioNombre

    const notificacion = {
      id: Date.now(),
      tipo: 'justificacion_pendiente',
      titulo: '📝 Nueva Justificación de Falta',
      mensaje: `${justificacion.nombres} ${justificacion.apellidos} ha justificado una falta de ${justificacion.materia}`,
      detalles: {
        estudianteMatricula: justificacion.matricula,
        estudianteNombres: justificacion.nombres,
        estudianteApellidos: justificacion.apellidos,
        estudianteEmail: justificacion.email,
        materia: justificacion.materia,
        fechaFalta: justificacion.fechaFalta,
        tipoJustificacion: justificacion.tipo,
        motivo: justificacion.motivo,
        justificacionId: justificacion.id,
        archivo: justificacion.archivo || null,
        archivoData: justificacion.archivoData || null
      },
      destinatarioEmail,
      destinatarioNombre,
      broadcast: isBroadcast,
      estado: 'no_leida',
      fechaCreacion: new Date().toISOString(),
      accion: 'revisar_justificacion'
    }

    notificaciones.value.push(notificacion)
    guardarNotificaciones()
  }

  const marcarComoLeida = (notificacionId) => {
    const notif = notificaciones.value.find(n => n.id === notificacionId)
    if (notif) {
      notif.estado = 'leida'
      guardarNotificaciones()
    }
  }

  cargarNotificaciones()

  return {
    notificaciones,
    notificacionesPendientes,
    cantidadPendientes,
    cargarNotificaciones,
    crearNotificacionJustificacion,
    marcarComoLeida
  }
})