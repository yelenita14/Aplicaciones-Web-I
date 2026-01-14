import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useMateriasStore = defineStore('materias', () => {
  const materias = ref([])
  const authStore = useAuthStore()

  const cargarMaterias = () => {
    const data = localStorage.getItem('materias')
    materias.value = data ? JSON.parse(data) : []
    
    // Eliminar duplicados por código (mantener el primero)
    const codigosVistos = new Set()
    materias.value = materias.value.filter(mat => {
      if (codigosVistos.has(mat.codigo)) {
        return false // Eliminar duplicado
      }
      codigosVistos.add(mat.codigo)
      return true // Mantener
    })
    
    // Guardar limpio
    guardarMaterias()
  }

  const guardarMaterias = () => {
    localStorage.setItem('materias', JSON.stringify(materias.value))
  }

  // Computed para materias visibles según el usuario
  const materiasVisibles = computed(() => {
    if (!authStore.usuarioActual || authStore.usuarioActual.tipo !== 'docente') {
      return materias.value
    }

    const usuarioEmail = authStore.usuarioActual.email?.toLowerCase()
    return materias.value.filter(mat => 
      mat.propietarioEmail && 
      usuarioEmail && 
      mat.propietarioEmail.toLowerCase() === usuarioEmail
    )
  })

  // Verificar si un código de materia ya existe en el sistema
  const codigoExiste = (codigo, excluirEmail = null) => {
    return materias.value.some(mat => 
      mat.codigo === codigo && 
      (!excluirEmail || mat.propietarioEmail?.toLowerCase() !== excluirEmail.toLowerCase())
    )
  }

  // Verificar si un nombre de materia ya existe para el docente actual
  const nombreExiste = (nombre, excluirCodigo = null) => {
    const usuarioEmail = authStore.usuarioActual?.email?.toLowerCase()
    return materias.value.some(mat => 
      mat.nombre?.toLowerCase() === nombre.toLowerCase() && 
      mat.propietarioEmail?.toLowerCase() === usuarioEmail &&
      (!excluirCodigo || mat.codigo !== excluirCodigo)
    )
  }

  const agregarMateria = (materia) => {
    // Validar que el código no exista en el sistema
    if (codigoExiste(materia.codigo)) {
      throw new Error('Este código de materia ya está registrado por otro docente')
    }

    // Validar que el nombre no exista para este docente
    if (nombreExiste(materia.nombre)) {
      throw new Error('Ya tienes una materia con este nombre')
    }

    // Asignar el docente propietario
    if (authStore.usuarioActual && authStore.usuarioActual.tipo === 'docente') {
      materia.propietarioEmail = authStore.usuarioActual.email
      materia.propietarioNombre = authStore.usuarioActual.nombre
      materia.fechaCreacion = new Date().toISOString()
      // El campo 'docente' se mantiene para compatibilidad pero ahora es el nombre del propietario
      materia.docente = authStore.usuarioActual.nombre
    }

    materias.value.push(materia)
    guardarMaterias()
    return true
  }

  const editarMateria = (codigo, nuevosDatos) => {
    const idx = materias.value.findIndex(m => m.codigo === codigo)
    if (idx !== -1) {
      const materiaActual = materias.value[idx]
      
      // Verificar que el docente actual sea el propietario
      if (authStore.usuarioActual?.tipo === 'docente') {
        const usuarioEmail = authStore.usuarioActual.email?.toLowerCase()
        const propietarioEmail = materiaActual.propietarioEmail?.toLowerCase()
        
        if (usuarioEmail !== propietarioEmail) {
          throw new Error('No tienes permisos para editar esta materia')
        }
      }

      // Si se está cambiando el nombre, validar que no exista
      if (nuevosDatos.nombre && nuevosDatos.nombre !== materiaActual.nombre) {
        if (nombreExiste(nuevosDatos.nombre, codigo)) {
          throw new Error('Ya tienes una materia con este nombre')
        }
      }

      // Mantener datos del propietario original
      nuevosDatos.propietarioEmail = materiaActual.propietarioEmail
      nuevosDatos.propietarioNombre = materiaActual.propietarioNombre
      nuevosDatos.fechaCreacion = materiaActual.fechaCreacion
      nuevosDatos.fechaModificacion = new Date().toISOString()
      nuevosDatos.docente = materiaActual.propietarioNombre

      materias.value[idx] = { ...materiaActual, ...nuevosDatos }
      guardarMaterias()
      return true
    }
    return false
  }

  const eliminarMateria = (codigo) => {
    const idx = materias.value.findIndex(m => m.codigo === codigo)
    if (idx !== -1) {
      const materiaActual = materias.value[idx]
      
      // Verificar que el docente actual sea el propietario
      if (authStore.usuarioActual?.tipo === 'docente') {
        const usuarioEmail = authStore.usuarioActual.email?.toLowerCase()
        const propietarioEmail = materiaActual.propietarioEmail?.toLowerCase()
        
        if (usuarioEmail !== propietarioEmail) {
          throw new Error('No tienes permisos para eliminar esta materia')
        }
      }

      materias.value.splice(idx, 1)
      guardarMaterias()

      // Eliminar asistencias relacionadas
      const asistencias = JSON.parse(localStorage.getItem('asistencias') || '[]')
      const filtradas = asistencias.filter(a => a.codigoMateria !== codigo)
      localStorage.setItem('asistencias', JSON.stringify(filtradas))

      return true
    }
    return false
  }

  const buscarPorCodigo = (codigo) => {
    return materias.value.find(m => m.codigo === codigo)
  }

  // Computed para select - solo muestra materias visibles
  const materiasSelect = computed(() => {
    return materiasVisibles.value.map(m => ({
      value: m.codigo,
      text: m.nombre
    }))
  })

  // Verificar si el usuario actual es propietario de una materia
  const esPropietario = (codigo) => {
    if (!authStore.usuarioActual || authStore.usuarioActual.tipo !== 'docente') {
      return true // Los administradores pueden ver todo
    }

    const materia = buscarPorCodigo(codigo)
    if (!materia) return false

    const usuarioEmail = authStore.usuarioActual.email?.toLowerCase()
    const propietarioEmail = materia.propietarioEmail?.toLowerCase()
    
    return usuarioEmail === propietarioEmail
  }

  cargarMaterias()

  return {
    materias,
    materiasVisibles,
    materiasSelect,
    cargarMaterias,
    agregarMateria,
    editarMateria,
    eliminarMateria,
    buscarPorCodigo,
    codigoExiste,
    nombreExiste,
    esPropietario
  }
})