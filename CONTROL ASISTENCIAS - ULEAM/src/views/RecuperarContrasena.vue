<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo">
        <img src="/ULEAM.png" alt="ULEAM Logo">
      </div>

      <h2>RECUPERAR CONTRASEÑA</h2>

      <form @submit.prevent="cambiarClave" class="login-form">
        <div v-if="!usuarioAutenticado" class="form-group">
          <label>Correo institucional:</label>
          <input type="email" v-model="email" required />
        </div>

        <div class="form-group">
          <label>Nueva contraseña:</label>
          <input type="password" v-model="password" required />
        </div>

        <div class="form-group">
          <label>Confirmar contraseña:</label>
          <input type="password" v-model="confirmar" required />
        </div>

        <span class="error-message" v-if="error">{{ error }}</span>
        <span class="success-message" v-if="success">{{ success }}</span>

        <button type="submit" class="btn-primary">
          Cambiar contraseña
        </button>

        <div class="forgot-password">
          <router-link to="/">← Volver al inicio de sesión</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useEstudiantesStore } from '@/stores/estudiantes'
import { encriptarContrasena } from '@/utils/encriptacion'

const router = useRouter()
const authStore = useAuthStore()
const estudiantesStore = useEstudiantesStore()

const email = ref('')
const password = ref('')
const confirmar = ref('')
const error = ref('')
const success = ref('')
const usuarioAutenticado = ref(!!authStore.usuarioActual)

const cambiarClave = () => {
  error.value = ''
  success.value = ''

  // Cargar estudiantes si no están cargados
  if (estudiantesStore.estudiantes.length === 0) {
    estudiantesStore.cargarEstudiantes()
  }

  let emailAUsar = email.value

  // Si está autenticado, usar su email
  if (authStore.usuarioActual) {
    emailAUsar = authStore.usuarioActual.email
  } else if (!email.value) {
    // Si no está autenticado, debe ingresar el email
    error.value = 'Debe ingresar su correo institucional'
    return
  }

  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }

  if (password.value !== confirmar.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
  let idx = usuarios.findIndex(
    u => u.email?.toLowerCase() === emailAUsar.toLowerCase()
  )

  // Si el usuario no existe, verificar si es un estudiante registrado
  if (idx === -1) {
    const estudiante = estudiantesStore.estudiantes.find(
      e => e.email?.toLowerCase() === emailAUsar.toLowerCase()
    )
    
    if (estudiante) {
      // Es un estudiante registrado, crear la cuenta
      const nuevoUsuario = {
        nombre: `${estudiante.nombres} ${estudiante.apellidos}`,
        email: emailAUsar,
        password: encriptarContrasena(password.value),
        matricula: estudiante.matricula,
        tipo: 'estudiante',
        fechaCreacion: new Date().toISOString()
      }
      usuarios.push(nuevoUsuario)
      idx = usuarios.length - 1
    } else {
      error.value = 'El correo no está registrado en el sistema'
      return
    }
  }

  usuarios[idx].password = encriptarContrasena(password.value)
  localStorage.setItem('usuarios', JSON.stringify(usuarios))

  success.value = 'Contraseña actualizada correctamente'
  password.value = ''
  confirmar.value = ''
  email.value = ''
  
  setTimeout(() => {
    router.push('/')
  }, 2000)
}
</script>
