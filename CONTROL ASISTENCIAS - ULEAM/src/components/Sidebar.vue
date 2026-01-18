<template>
  <nav class="sidebar">
    <div class="logo-sidebar">
      <img src="/ULEAM.png" alt="ULEAM">
    </div>
    
    <ul class="menu">
      <li v-for="item in menuItems" :key="item.path + (item.section || '')">
        <router-link 
          v-if="!item.section"
          :to="item.path" 
          :class="{ active: isActive(item.path) }"
        >
          {{ item.label }}
        </router-link>
        <a 
          v-else
          href="#"
          @click.prevent="handleMenuClick(item)"
          :class="{ active: false }"
        >
          {{ item.label }}
        </a>
      </li>
    </ul>
    
    <div class="user-info">
      <p v-if="usuarioActual">
        {{ usuarioActual.tipo === 'docente' ? 'Docente' : 'Estudiante' }}: 
        {{ capitalizarNombre(usuarioActual.nombre) }}
      </p>
      <button class="btn-logout" @click="mostrarModalCerrarSesion">
        Cerrar Sesión
      </button>
    </div>

    <!-- Modal Cerrar Sesión -->
    <div 
      id="modalCerrarSesion" 
      class="modal-flotante" 
      v-show="modalCerrarSesionVisible"
    >
      <div class="modal-contenido">
        <p>¿Estás seguro de cerrar sesión?</p>
        <div class="modal-botones">
          <button class="btn-confirmar" @click="confirmarCerrarSesion">
            Confirmar
          </button>
          <button class="btn-cancelar" @click="cancelarCerrarSesion">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const modalCerrarSesionVisible = ref(false)

const usuarioActual = computed(() => authStore.usuarioActual)

const menuItems = computed(() => {
  if (authStore.userType === 'docente') {
    return [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/estudiantes', label: 'Estudiantes' },
      { path: '/asistencias', label: 'Asistencias' },
      { path: '/materias', label: 'Materias' },
      { path: '/reportes', label: 'Reportes' }
    ]
  } else {
    return [
      { path: '/panel-estudiante', label: 'Dashboard', section: 'dashboard' },
      { path: '/panel-estudiante', label: 'Mis Asistencias', section: 'asistencias' },
      { path: '/panel-estudiante', label: 'Justificaciones', section: 'justificaciones' }
    ]
  }
})

const handleMenuClick = (item) => {
  if (item.section && route.path === '/panel-estudiante') {
    // Si estamos en panel estudiante, emitir evento para cambiar sección
    const panelEstudiante = router.currentRoute.value.matched[0]?.instances?.default
    if (panelEstudiante && panelEstudiante.cambiarSeccion) {
      panelEstudiante.cambiarSeccion(item.section)
    }
  }
}

const isActive = (path) => {
  return route.path === path
}

const capitalizarNombre = (nombre) => {
  if (!nombre) return ''
  return nombre
    .split(' ')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ')
}

const mostrarModalCerrarSesion = () => {
  modalCerrarSesionVisible.value = true
}

const confirmarCerrarSesion = () => {
  authStore.logout()
  router.push('/')
}

const cancelarCerrarSesion = () => {
  modalCerrarSesionVisible.value = false
}
</script>

<style scoped>
/* Los estilos se heredan del CSS global */
</style>