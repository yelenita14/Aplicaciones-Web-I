import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { encriptarContrasena } from '@/utils/encriptacion'

export const useEstudiantesStore = defineStore('estudiantes', () => {
  const estudiantes = ref([])
  const authStore = useAuthStore()

  const cargarEstudiantes = () => {
    const data = localStorage.getItem('estudiantes')
    estudiantes.value = data ? JSON.parse(data) : []
    
    // Eliminar duplicados por matrícula (mantener el primero)
    const matriculasVistas = new Set()
    estudiantes.value = estudiantes.value.filter(est => {
      if (matriculasVistas.has(est.matricula)) {
        return false // Eliminar duplicado
      }
      matriculasVistas.add(est.matricula)
      return true // Mantener
    })
    
    // Guardar limpio
    guardarEstudiantes()
  }

  const guardarEstudiantes = () => {
    localStorage.setItem('estudiantes', JSON.stringify(estudiantes.value))
  }

  const estudiantesVisibles = computed(() => {
    if (!authStore.usuarioActual || authStore.usuarioActual.tipo !== 'docente') {
      return estudiantes.value
    }

    const usuarioEmail = authStore.usuarioActual.email?.toLowerCase()
    return estudiantes.value.filter(est => 
      est.propietarioEmail && 
      usuarioEmail && 
      est.propietarioEmail.toLowerCase() === usuarioEmail
    )
  })

  // Verificar si una matrícula ya existe en el sistema (para cualquier docente)
  const matriculaExiste = (matricula, excluirEmail = null) => {
    return estudiantes.value.some(est => 
      est.matricula === matricula && 
      (!excluirEmail || est.propietarioEmail?.toLowerCase() !== excluirEmail.toLowerCase())
    )
  }

  // Verificar si un email ya existe en el sistema (para cualquier docente)
  const emailExiste = (email, excluirMatricula = null) => {
    return estudiantes.value.some(est => 
      est.email?.toLowerCase() === email.toLowerCase() && 
      (!excluirMatricula || est.matricula !== excluirMatricula)
    )
  }

  const agregarEstudiante = (estudiante) => {
    // Validar que la matrícula no exista en el sistema
    if (matriculaExiste(estudiante.matricula)) {
      throw new Error('Esta matrícula ya está registrada por otro docente')
    }

    // Validar que el email no exista en el sistema
    if (emailExiste(estudiante.email)) {
      throw new Error('Este email ya está registrado por otro docente')
    }

    // Asignar el docente propietario
    if (authStore.usuarioActual && authStore.usuarioActual.tipo === 'docente') {
      estudiante.propietarioEmail = authStore.usuarioActual.email
      estudiante.propietarioNombre = authStore.usuarioActual.nombre
      estudiante.fechaCreacion = new Date().toISOString()
    }

    estudiantes.value.push(estudiante)
    guardarEstudiantes()

    // CREAR USUARIO AUTOMÁTICAMENTE
    // La contraseña por defecto es la matrícula (sin caracteres especiales)
    const contraseñaPorDefecto = estudiante.matricula.replace(/[^0-9]/g, '')
    
    // Obtener lista de usuarios
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    
    // Verificar si el usuario ya existe
    const usuarioExistente = usuarios.find(u => u.email?.toLowerCase() === estudiante.email.toLowerCase())
    
    if (!usuarioExistente) {
      // Crear nuevo usuario
      const nuevoUsuario = {
        nombre: `${estudiante.nombres} ${estudiante.apellidos}`,
        email: estudiante.email,
        password: encriptarContrasena(contraseñaPorDefecto),
        matricula: estudiante.matricula,
        tipo: 'estudiante',
        fechaCreacion: new Date().toISOString()
      }
      
      usuarios.push(nuevoUsuario)
      localStorage.setItem('usuarios', JSON.stringify(usuarios))
      console.log(`Usuario creado para ${estudiante.email} con contraseña temporal: ${contraseñaPorDefecto}`)
    }
    
    return true
  }

  const editarEstudiante = (matricula, nuevosDatos) => {
    const idx = estudiantes.value.findIndex(e => e.matricula === matricula)
    if (idx !== -1) {
      const estudianteActual = estudiantes.value[idx]
      
      // Verificar que el docente actual sea el propietario
      if (authStore.usuarioActual?.tipo === 'docente') {
        const usuarioEmail = authStore.usuarioActual.email?.toLowerCase()
        const propietarioEmail = estudianteActual.propietarioEmail?.toLowerCase()
        
        if (usuarioEmail !== propietarioEmail) {
          throw new Error('No tienes permisos para editar este estudiante')
        }
      }

      // Si se está cambiando el email, validar que no exista
      if (nuevosDatos.email && nuevosDatos.email !== estudianteActual.email) {
        if (emailExiste(nuevosDatos.email, matricula)) {
          throw new Error('Este email ya está registrado por otro docente')
        }
      }

      // Mantener datos del propietario original
      nuevosDatos.propietarioEmail = estudianteActual.propietarioEmail
      nuevosDatos.propietarioNombre = estudianteActual.propietarioNombre
      nuevosDatos.fechaCreacion = estudianteActual.fechaCreacion
      nuevosDatos.fechaModificacion = new Date().toISOString()

      estudiantes.value[idx] = { ...estudianteActual, ...nuevosDatos }
      guardarEstudiantes()
      return true
    }
    return false
  }

  const eliminarEstudiante = (matricula) => {
    const idx = estudiantes.value.findIndex(e => e.matricula === matricula)
    if (idx !== -1) {
      const estudianteActual = estudiantes.value[idx]
      
      // Verificar que el docente actual sea el propietario
      if (authStore.usuarioActual?.tipo === 'docente') {
        const usuarioEmail = authStore.usuarioActual.email?.toLowerCase()
        const propietarioEmail = estudianteActual.propietarioEmail?.toLowerCase()
        
        if (usuarioEmail !== propietarioEmail) {
          throw new Error('No tienes permisos para eliminar este estudiante')
        }
      }

      estudiantes.value.splice(idx, 1)
      guardarEstudiantes()

      // Eliminar asistencias relacionadas
      const asistencias = JSON.parse(localStorage.getItem('asistencias') || '[]')
      const filtradas = asistencias.filter(a => a.matricula !== matricula)
      localStorage.setItem('asistencias', JSON.stringify(filtradas))

      // Eliminar justificaciones relacionadas
      const justificaciones = JSON.parse(localStorage.getItem('justificaciones') || '[]')
      const filtradasJ = justificaciones.filter(j => j.matricula !== matricula)
      localStorage.setItem('justificaciones', JSON.stringify(filtradasJ))

      return true
    }
    return false
  }

  const buscarPorMatricula = (matricula) => {
    return estudiantes.value.find(e => e.matricula === matricula)
  }

  // Buscar estudiante por email
  const buscarPorEmail = (email) => {
    return estudiantes.value.find(e => e.email?.toLowerCase() === email.toLowerCase())
  }

  // Verificar si el usuario actual es propietario de un estudiante
  const esPropietario = (matricula) => {
    if (!authStore.usuarioActual || authStore.usuarioActual.tipo !== 'docente') {
      return true // Los administradores pueden ver todo
    }

    const estudiante = buscarPorMatricula(matricula)
    if (!estudiante) return false

    const usuarioEmail = authStore.usuarioActual.email?.toLowerCase()
    const propietarioEmail = estudiante.propietarioEmail?.toLowerCase()
    
    return usuarioEmail === propietarioEmail
  }

  cargarEstudiantes()

  return {
    estudiantes,
    estudiantesVisibles,
    cargarEstudiantes,
    agregarEstudiante,
    editarEstudiante,
    eliminarEstudiante,
    buscarPorMatricula,
    buscarPorEmail,
    matriculaExiste,
    emailExiste,
    esPropietario
  }
})