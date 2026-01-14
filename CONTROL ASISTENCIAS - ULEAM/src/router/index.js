import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Estudiantes from '../views/Estudiantes.vue'
import Asistencias from '@/views/Asistencias.vue'
import Materias from '@/views/Materias.vue'
import Reportes from '@/views/Reportes.vue'
import RecuperarContrasena from '@/views/RecuperarContrasena.vue'
import PanelEstudiante from '@/views/PanelEstudiante.vue'

const routes = [
  {path: '/', name: 'Login', component: Login},
  {path : '/dashboard', name: 'Dashboard', component: Dashboard},
  {path : '/estudiantes', name: 'Estudiantes', component: Estudiantes},
  {path : '/asistencias', name: 'Asistencias', component: Asistencias},
  {path : '/materias', name: 'Materias', component: Materias},
  {path : '/reportes', name: 'Reportes', component: Reportes},
  {path : '/recuperar', name: 'RecuperarContrasena', component: RecuperarContrasena},
  {path : '/panel-estudiante', name: 'PanelEstudiante', component: PanelEstudiante},
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
