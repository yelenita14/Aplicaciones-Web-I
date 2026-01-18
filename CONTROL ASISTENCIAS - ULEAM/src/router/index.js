import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Estudiantes from '../views/Estudiantes.vue'
import Asistencias from '@/views/Asistencias.vue'
import Materias from '@/views/Materias.vue'
import Reportes from '@/views/Reportes.vue'
import RecuperarContrasena from '@/views/RecuperarContrasena.vue'
import PanelEstudiante from '@/views/PanelEstudiante.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiereDocente: true } },
  { path: '/estudiantes', name: 'Estudiantes', component: Estudiantes, meta: { requiereDocente: true } },
  { path: '/asistencias', name: 'Asistencias', component: Asistencias, meta: { requiereDocente: true } },
  { path: '/materias', name: 'Materias', component: Materias, meta: { requiereDocente: true } },
  { path: '/reportes', name: 'Reportes', component: Reportes, meta: { requiereDocente: true } },
  { path: '/recuperar-contrasena', name: 'RecuperarContrasena', component: RecuperarContrasena },
  { path: '/panel-estudiante', name: 'PanelEstudiante', component: PanelEstudiante, meta: { requiereEstudiante: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Guard de ruta para validar permisos
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const usuarioActual = authStore.usuarioActual
  
  // Si requiere docente
  if (to.meta.requiereDocente) {
    if (!usuarioActual) {
      next('/')
      return
    }
    if (usuarioActual.tipo !== 'docente') {
      next('/panel-estudiante')
      return
    }
  }
  
  // Si requiere estudiante
  if (to.meta.requiereEstudiante) {
    if (!usuarioActual) {
      next('/')
      return
    }
    if (usuarioActual.tipo !== 'estudiante') {
      next('/dashboard')
      return
    }
  }
  
  next()
})

export default router
