// Validar email
export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Validar email institucional ULEAM
export function validarEmailULEAM(email) {
  return email.endsWith('@uleam.edu.ec') || email.endsWith('@live.uleam.edu.ec')
}

// Validar cédula ecuatoriana
export function validarCedula(cedula) {
  if (!cedula) return { valido: false, mensaje: 'La cédula es obligatoria' }
  
  const cedulaLimpia = cedula.replace(/[^0-9]/g, '')
  
  if (cedulaLimpia.length !== 10) {
    return { valido: false, mensaje: 'La cédula debe tener 10 dígitos' }
  }
  
  if (!/^\d+$/.test(cedulaLimpia)) {
    return { valido: false, mensaje: 'La cédula debe contener solo números' }
  }
  
  const provincia = parseInt(cedulaLimpia.substring(0, 2))
  if (provincia < 1 || provincia > 24) {
    return { valido: false, mensaje: 'Código de provincia inválido' }
  }
  
  const digitoVerificador = parseInt(cedulaLimpia.charAt(9))
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  let suma = 0
  
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedulaLimpia.charAt(i)) * coeficientes[i]
    if (valor > 9) valor -= 9
    suma += valor
  }
  
  const resultado = suma % 10 === 0 ? 0 : 10 - (suma % 10)
  
  if (resultado !== digitoVerificador) {
    return { valido: false, mensaje: 'Cédula inválida (verificación fallida)' }
  }
  
  return { valido: true, mensaje: 'Cédula válida' }
}

// Validar teléfono ecuatoriano
export function validarTelefono(telefono) {
  if (!telefono) return { valido: false, mensaje: 'El teléfono es obligatorio' }
  
  const telefonoLimpio = telefono.replace(/[^0-9]/g, '')
  
  if (telefonoLimpio.length !== 10) {
    return { valido: false, mensaje: 'El teléfono debe tener 10 dígitos' }
  }
  
  const regex = /^(09|08)\d{8}$/
  if (!regex.test(telefonoLimpio)) {
    return { valido: false, mensaje: 'Formato de teléfono inválido (debe comenzar con 09 o 08)' }
  }
  
  return { valido: true, mensaje: 'Teléfono válido' }
}

// Validar solo letras
export function validarSoloLetras(texto) {
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  return regex.test(texto)
}

// Validar matrícula
export function validarMatricula(matricula) {
  const regex = /^[0-9]{4}P[0-9]-[0-9]{4,5}$/
  return regex.test(matricula)
}

// Parsear fecha YYYY-MM-DD como Date local
export function parseYMD(dateStr) {
  if (!dateStr) return null
  
  // Si es un ISO string (contiene T), extraer solo la parte de fecha
  if (dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0]
  }
  
  const parts = dateStr.split('-')
  if (parts.length !== 3) return new Date(dateStr)
  const y = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10) - 1
  const d = parseInt(parts[2], 10)
  return new Date(y, m, d)
}

// Formatear YYYY-MM-DD a representación local (es-EC)
export function formatYMD(dateStr) {
  const dt = parseYMD(dateStr)
  if (!dt || isNaN(dt.getTime())) return dateStr || ''
  return dt.toLocaleDateString('es-EC')
}