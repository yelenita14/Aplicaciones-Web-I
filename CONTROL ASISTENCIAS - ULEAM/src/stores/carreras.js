import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCarrerasStore = defineStore('carreras', () => {
  const carreras = ref([])

  const cargarCarreras = () => {
    const data = localStorage.getItem('carreras')
    if (data) {
      carreras.value = JSON.parse(data)
    } else {
      inicializarCarrerasPredeterminadas()
    }
  }

  const guardarCarreras = () => {
    localStorage.setItem('carreras', JSON.stringify(carreras.value))
  }

  const inicializarCarrerasPredeterminadas = () => {
    carreras.value = [
      { nombre: 'Ingeniería en Tecnología de la Información', facultad: 'Facultad de Ciencias Informáticas' },
      { nombre: 'Ingeniería en Software', facultad: 'Facultad de Ciencias Informáticas' },
      { nombre: 'Ingeniería en Sistemas', facultad: 'Facultad de Ciencias Informáticas' },
      { nombre: 'Derecho', facultad: 'Facultad de Derecho' },
      { nombre: 'Arquitectura', facultad: 'Facultad de Arquitectura' },
      { nombre: 'Enfermería', facultad: 'Facultad de Ciencias de la Salud' },
      { nombre: 'Medicina', facultad: 'Facultad de Ciencias de la Salud' },
      { nombre: 'Administración de Empresas', facultad: 'Facultad de Ciencias Administrativas' }
    ]
    guardarCarreras()
  }

  const agregarCarrera = (carrera) => {
    const existe = carreras.value.find(
      c => c.nombre.toLowerCase() === carrera.nombre.toLowerCase()
    )
    
    if (!existe) {
      carreras.value.push(carrera)
      guardarCarreras()
      return true
    }
    return false
  }

  cargarCarreras()

  return {
    carreras,
    cargarCarreras,
    agregarCarrera
  }
})