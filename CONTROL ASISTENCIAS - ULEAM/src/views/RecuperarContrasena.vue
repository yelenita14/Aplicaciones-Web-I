<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo">
        <img src="/ULEAM.png" alt="ULEAM Logo">
      </div>
      
      <h2>RECUPERAR CONTRASEÑA</h2>
      
      <form @submit.prevent="enviarCodigo" class="login-form">
        <div class="form-group">
          <label for="emailRecuperar">Correo institucional:</label>
          <input 
            type="email" 
            id="emailRecuperar"
            v-model="email"
            required
            @input="limpiarError"
          >
          <span class="error-message" v-if="error">{{ error }}</span>
        </div>
        
        <button type="submit" class="btn-primary">
          Enviar código
        </button>
        
        <div class="forgot-password">
          <router-link to="/">← Volver al inicio de sesión</router-link>
        </div>
      </form>
    </div>

    <!-- Notification Toast -->
    <Notification
      v-if="notificationVisible"
      :mensaje="notificationMensaje"
      :tipo="notificationTipo"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Notification from '@/components/Notification.vue'
import { validarEmail, validarEmailULEAM } from '@/utils/validaciones'

const router = useRouter()

const email = ref('')
const error = ref('')

// Notification
const notificationVisible = ref(false)
const notificationMensaje = ref('')
const notificationTipo = ref('info')

const limpiarError = () => {
  error.value = ''
}

const enviarCodigo = () => {
  error.value = ''

  if (!email.value) {
    error.value = 'El correo es obligatorio'
    return
  }

  if (!validarEmail(email.value)) {
    error.value = 'Formato de correo inválido'
    return
  }

  if (!validarEmailULEAM(email.value)) {
    error.value = 'Debe usar un correo institucional @uleam.edu.ec'
    return
  }

  // Simulación de envío de código
  mostrarNotificacion('✓ Código enviado al correo', 'success')
  
  setTimeout(() => {
    router.push('/')
  }, 2000)
}

const mostrarNotificacion = (mensaje, tipo) => {
  notificationMensaje.value = mensaje
  notificationTipo.value = tipo
  notificationVisible.value = true
  
  setTimeout(() => {
    notificationVisible.value = false
  }, 5000)
}
</script>

<style scoped>
/* Los estilos se heredan del CSS global */
</style>