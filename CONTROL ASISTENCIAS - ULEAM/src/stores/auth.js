import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const usuarioActual = ref(null)
  const sesionActiva = ref(null)

  // Cargar datos de localStorage al iniciar
  const cargarSesion = () => {
    const usuario = localStorage.getItem('usuarioActual')
    const sesion = sessionStorage.getItem('sesionActiva')
    
    if (usuario) {
      usuarioActual.value = JSON.parse(usuario)
    }
    
    if (sesion) {
      sesionActiva.value = JSON.parse(sesion)
    }
  }

  const login = (email, password) => {
    // Determinar tipo de usuario por el correo
    const esEstudiante = email.startsWith('e') && email.includes('@live.uleam.edu.ec')
    const esDocente = email.includes('@uleam.edu.ec') && !email.includes('@live.uleam.edu.ec')
    
    // Crear objeto de usuario
    const usuario = {
      nombre: email
        .split('@')[0]
        .replace('.', ' ')
        .replace(/\b\w/g, letra => letra.toUpperCase()),
      email: email,
      tipo: esEstudiante ? 'estudiante' : 'docente',
      fechaLogin: new Date().toISOString()
    }

    // Guardar en localStorage
    localStorage.setItem('usuarioActual', JSON.stringify(usuario))
    usuarioActual.value = usuario
    
    // Guardar en sessionStorage
    const sesion = {
      email: email,
      tipo: usuario.tipo,
      horaLogin: new Date().toLocaleTimeString(),
      fechaLogin: new Date().toISOString(),
      activa: true
    }
    sessionStorage.setItem('sesionActiva', JSON.stringify(sesion))
    sessionStorage.setItem('usuarioSesion', email)
    sesionActiva.value = sesion
    
    // Guardar usuario en lista de usuarios
    try {
      const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
      const idx = usuarios.findIndex(u => u.email && u.email.toLowerCase() === email.toLowerCase())
      
      if (idx !== -1) {
        usuarios[idx].password = password
        usuarios[idx].nombre = usuario.nombre
        usuarios[idx].tipo = usuario.tipo
      } else {
        usuarios.push({ 
          email: email, 
          password: password, 
          nombre: usuario.nombre, 
          tipo: usuario.tipo 
        })
      }
      localStorage.setItem('usuarios', JSON.stringify(usuarios))
    } catch (e) {
      console.error('Error guardando usuario:', e)
    }
    
    return usuario.tipo
  }

  const logout = () => {
    localStorage.removeItem('usuarioActual')
    sessionStorage.removeItem('sesionActiva')
    sessionStorage.removeItem('usuarioSesion')
    usuarioActual.value = null
    sesionActiva.value = null
  }

  const isAuthenticated = computed(() => !!usuarioActual.value)
  const userType = computed(() => usuarioActual.value?.tipo || null)

  // Cargar sesión al inicializar
  cargarSesion()

  return {
    usuarioActual,
    sesionActiva,
    isAuthenticated,
    userType,
    login,
    logout,
    cargarSesion
  }
})