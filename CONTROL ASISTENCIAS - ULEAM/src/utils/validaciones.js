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
  if (cedula.length !== 10) return false
  
  const provincia = parseInt(cedula.substring(0, 2))
  if (provincia < 1 || provincia > 24) return false
  
  const digitoVerificador = parseInt(cedula.charAt(9))
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  let suma = 0
  
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.charAt(i)) * coeficientes[i]
    if (valor > 9) valor -= 9
    suma += valor
  }
  
  const resultado = suma % 10 === 0 ? 0 : 10 - (suma % 10)
  return resultado === digitoVerificador
}

// Validar teléfono ecuatoriano
export function validarTelefono(telefono) {
  const regex = /^(09|08)\d{8}$/
  return regex.test(telefono)
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