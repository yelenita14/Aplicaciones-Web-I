import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Estudiantes from '@/views/Estudiantes.vue'
import Asistencias from '@/views/Asistencias.vue'
import Materias from '@/views/Materias.vue'
import Reportes from '@/views/Reportes.vue'
import RecuperarContrasena from '@/views/RecuperarContrasena.vue'
import PanelEstudiante from '@/views/PanelEstudiante.vue'

const routes = [
  {path: '/', name: 'Login', component: Login},
  {path : '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true }},
  {path : '/estudiantes', name: 'Estudiantes', component: Estudiantes, meta: { requiresAuth: true }},
  {path : '/asistencias', name: 'Asistencias', component: Asistencias, meta: { requiresAuth: true }},
  {path : '/materias', name: 'Materias', component: Materias, meta: { requiresAuth: true }},
  {path : '/reportes', name: 'Reportes', component: Reportes, meta: { requiresAuth: true }},
  {path : '/recuperar-contrasena', name: 'RecuperarContrasena', component: RecuperarContrasena},
  {path : '/panel-estudiante', name: 'PanelEstudiante', component: PanelEstudiante, meta: { requiresAuth: true }},
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.usuarioActual){
    next('/' )
  }
  else if(to.path === '/' && authStore.usuarioActual){
    next('/dashboard')
  }
  else{
    next()
  }
})

export default router
