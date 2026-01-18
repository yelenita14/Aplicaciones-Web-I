<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo">
        <img src="/ULEAM.png" alt="ULEAM Logo">
      </div>

      <h2>CONTROL DE ASISTENCIA</h2>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Correo institucional:</label>
          <input 
            type="email" 
            v-model="email" 
            required
            @input="limpiarError('email')"
          >
          <span class="error-message" v-if="errores.email">{{ errores.email }}</span>
        </div>

        <div class="form-group">
          <label>Contraseña:</label>
          <input 
            type="password" 
            v-model="password" 
            required
            @input="limpiarError('password')"
          >
          <span class="error-message" v-if="errores.password">{{ errores.password }}</span>
        </div>

        <button type="submit" class="btn-primary">
          Iniciar sesión
        </button>

        <div class="forgot-password">
          <router-link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errores = ref({})

const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const validarEmailULEAM = (email) => {
  return email.endsWith('@uleam.edu.ec') || email.endsWith('@live.uleam.edu.ec')
}

const limpiarError = (campo) => {
  errores.value[campo] = null
}

const handleLogin = () => {
  errores.value = {}
  let isValid = true

  // Validar email
  if (email.value === '') {
    errores.value.email = 'El correo es obligatorio'
    isValid = false
  } else if (!validarEmail(email.value)) {
    errores.value.email = 'Formato de correo inválido'
    isValid = false
  } else if (!validarEmailULEAM(email.value)) {
    errores.value.email = 'Debe usar un correo institucional @uleam.edu.ec'
    isValid = false
  }

  // Validar contraseña
  if (password.value === '') {
    errores.value.password = 'La contraseña es obligatoria'
    isValid = false
  } else if (password.value.length < 6) {
    errores.value.password = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }

  if (isValid) {
    const tipoUsuario = authStore.login(email.value, password.value)
    
    if (tipoUsuario === null) {
      errores.value.password = 'Correo o contraseña incorrectos'
      return
    }
    
    // Redirigir según tipo de usuario
    if (tipoUsuario === 'estudiante') {
      router.push('/panel-estudiante')
    } else if (tipoUsuario === 'docente') {
      router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
/* Los estilos se heredan del CSS global */
</style>