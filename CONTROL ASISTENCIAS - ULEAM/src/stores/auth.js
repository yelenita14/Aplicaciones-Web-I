import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { encriptarContrasena, validarContrasena } from '@/utils/encriptacion'

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
    // Validar que el usuario existe y la contraseña es correcta
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    let usuarioEncontrado = usuarios.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())
    
    // Si el usuario no existe, verificar si es un estudiante registrado
    if (!usuarioEncontrado) {
      const estudiantes = JSON.parse(localStorage.getItem('estudiantes') || '[]')
      const estudiante = estudiantes.find(e => e.email?.toLowerCase() === email.toLowerCase())
      
      if (estudiante) {
        // Es un estudiante registrado, crear la cuenta con la contraseña que ingresó
        const nuevoUsuario = {
          nombre: `${estudiante.nombres} ${estudiante.apellidos}`,
          email: email,
          password: encriptarContrasena(password),
          matricula: estudiante.matricula,
          tipo: 'estudiante',
          fechaCreacion: new Date().toISOString()
        }
        usuarios.push(nuevoUsuario)
        localStorage.setItem('usuarios', JSON.stringify(usuarios))
        usuarioEncontrado = nuevoUsuario
        console.log(`Cuenta creada para estudiante: ${email}`)
      } else {
        console.error('Usuario no encontrado')
        return null
      }
    } else {
      // Validar contraseña encriptada
      if (!validarContrasena(password, usuarioEncontrado.password)) {
        console.error('Contraseña incorrecta')
        return null
      }
    }
    
    // Determinar tipo de usuario por el correo
    const esEstudiante = email.startsWith('e') && email.includes('@live.uleam.edu.ec')
    const esDocente = email.includes('@uleam.edu.ec') && !email.includes('@live.uleam.edu.ec')
    
    // Crear objeto de usuario
    const usuario = {
      nombre: usuarioEncontrado.nombre || email
        .split('@')[0]
        .replace('.', ' ')
        .replace(/\b\w/g, letra => letra.toUpperCase()),
      email: email,
      tipo: esEstudiante ? 'estudiante' : 'docente',
      matricula: usuarioEncontrado.matricula,
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