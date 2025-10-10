const form = document.getElementById("clienteForm");
const tabla = document.querySelector("#tablaClientes tbody");
let filaEditando = null;

// Guardar o actualizar cliente
form.addEventListener("submit", function(event) {
  event.preventDefault();

  const nombre = document.getElementById("nombres").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const cedula = document.getElementById("cedula").value.trim();
  const direccion = document.getElementById("direccion").value.trim();

  // Validaciones
  if (!nombre || !correo || !telefono || !cedula || !direccion) {
    alert("Por favor, complete todos los campos.");
    return;
  }

  if (!/^\d{10}$/.test(cedula)) {
    alert("La cédula debe tener 10 dígitos numéricos.");
    return;
  }

  if (!/^\d{7,10}$/.test(telefono)) {
    alert("El teléfono debe tener entre 7 y 10 dígitos numéricos.");
    return;
  }

  if (!/\S+@\S+\.\S+/.test(correo)) {
    alert("El correo electrónico no es válido.");
    return;
  }

  if (filaEditando) {
    filaEditando.cells[0].textContent = nombre;
    filaEditando.cells[1].textContent = correo;
    filaEditando.cells[2].textContent = telefono;
    filaEditando.cells[3].textContent = cedula;
    filaEditando.cells[4].textContent = direccion;
    filaEditando = null;
    form.reset();
    document.getElementById("btnGuardar").textContent = "Guardar";
    return;
  }

  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td>${nombre}</td>
    <td>${correo}</td>
    <td>${telefono}</td>
    <td>${cedula}</td>
    <td>${direccion}</td>
    <td>
      <button class="accion editar">Editar</button>
      <button class="accion eliminar">Eliminar</button>
    </td>
  `;
  tabla.appendChild(fila);
  form.reset();
});

// Editar o eliminar cliente
tabla.addEventListener("click", (e) => {
  if (e.target.classList.contains("eliminar")) {
    e.target.closest("tr").remove();
  }

  if (e.target.classList.contains("editar")) {
    filaEditando = e.target.closest("tr");
    document.getElementById("nombres").value = filaEditando.cells[0].textContent;
    document.getElementById("correo").value = filaEditando.cells[1].textContent;
    document.getElementById("telefono").value = filaEditando.cells[2].textContent;
    document.getElementById("cedula").value = filaEditando.cells[3].textContent;
    document.getElementById("direccion").value = filaEditando.cells[4].textContent;

    document.getElementById("btnGuardar").textContent = "Actualizar";
  }
});
