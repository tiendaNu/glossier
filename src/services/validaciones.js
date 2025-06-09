export function validarCampos(producto, requiereImagenes = true) {
  const errores = {};

  if (!producto.nombre || producto.nombre.trim() === "") {
    errores.nombre = "El nombre es obligatorio";
  }

  if (
    producto.precio == null ||
    isNaN(producto.precio) ||
    Number(producto.precio) <= 0
  ) {
    errores.precio = "El precio debe ser un número mayor a 0";
  }

  if (
    requiereImagenes &&
    (!Array.isArray(producto.imagenes) || producto.imagenes.length === 0)
  ) {
    errores.imagenes = "Debe subir al menos una imagen";
  }

  if (!producto.descripcion || producto.descripcion.trim() === "") {
    errores.descripcion = "La descripción es obligatoria";
  } else if (producto.descripcion.length > 300) {
    errores.descripcion = "La descripción no puede superar los 300 caracteres";
  }

  if (producto.cantidad == null || producto.cantidad === "") {
    errores.cantidad = "La cantidad es obligatoria";
  } else {
    const cantidad = Number(producto.cantidad);
    if (!Number.isInteger(cantidad) || cantidad < 0) {
      errores.cantidad =
        "La cantidad debe ser un número entero mayor o igual a 0";
    }
  }

  if (!producto.categoria || producto.categoria.trim() === "") {
    errores.categoria = "La categoría es obligatoria";
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  };
}
