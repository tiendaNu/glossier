import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Form,
  Container,
  Spinner,
  Modal,
} from "react-bootstrap";
import {
  getProductos,
  agregarProducto,
  editarProducto,
  eliminarProducto,
} from "../services/firebaseService";
import { validarCampos } from "../services/validaciones";
import "./Admin.css";

function Admin() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [imagenes, setImagenes] = useState([]); // array de URLs
  const [imagenesArchivo, setImagenesArchivo] = useState([]); // array de archivos seleccionados
  const [descripcion, setDescripcion] = useState("");
  const [agotado, setAgotado] = useState(false);
  const [cantidad, setCantidad] = useState("");
  const [categoria, setCategoria] = useState("");
  const [editId, setEditId] = useState(null);
  const [errores, setErrores] = useState({});
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const lista = await getProductos();
      const ordenados = lista.sort((a, b) => {
        const fechaA = a.fechaCarga ? new Date(a.fechaCarga).getTime() : 0;
        const fechaB = b.fechaCarga ? new Date(b.fechaCarga).getTime() : 0;
        return fechaB - fechaA;
      });
      setProductos(ordenados);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const limpiarFormulario = () => {
    setNombre("");
    setPrecio("");
    setImagenes([]);
    setImagenesArchivo([]);
    setDescripcion("");
    setAgotado(false);
    setCantidad("");
    setCategoria("");
    setEditId(null);
    setErrores({});
  };

  const abrirFormularioAgregar = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const iniciarEdicion = (producto) => {
    setNombre(producto.nombre);
    setPrecio(producto.precio.toString());
    setImagenes(producto.imagenes || []);
    setImagenesArchivo([]);
    setDescripcion(producto.descripcion || "");
    setAgotado(producto.agotado || false);
    setCantidad(producto.cantidad?.toString() || "");
    setCategoria(producto.categoria || "");
    setEditId(producto.id);
    setErrores({});
    setMostrarFormulario(true);
  };

  // Subir imagen a Cloudinary y devolver URL
  const subirImagenCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append(
      "upload_preset",
      process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
    );
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      );
      if (!res.ok) throw new Error("Error al subir la imagen");
      const archivo = await res.json();
      return archivo.secure_url;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // Cuando se selecciona un archivo, lo agregamos a imagenesArchivo y mostramos preview
  const handleArchivoSeleccionado = (e) => {
    if (!e.target.files) return;
    const archivosNuevos = Array.from(e.target.files);

    // Limitar a máximo 2 imágenes
    if (imagenes.length + imagenesArchivo.length + archivosNuevos.length > 2) {
      alert("Solo puedes subir hasta 2 imágenes");
      return;
    }

    setImagenesArchivo((prev) => [...prev, ...archivosNuevos]);
  };

  // Quitar imagen (URL o archivo) del array
  const quitarImagen = (index, esArchivo = false) => {
    if (esArchivo) {
      setImagenesArchivo((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImagenes((prev) => prev.filter((_, i) => i !== index));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    try {
      // Subir imágenes nuevas
      const urlsNuevas = [];
      for (const archivo of imagenesArchivo) {
        const url = await subirImagenCloudinary(archivo);
        if (!url) {
          setErrores({ imagenes: "Error al subir alguna de las imágenes" });
          setEnviando(false);
          return;
        }
        urlsNuevas.push(url);
      }

      // Combinar imágenes existentes y nuevas
      const imagenesFinales = [...imagenes, ...urlsNuevas];

      const nuevoProducto = {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        imagenes: imagenesFinales,
        descripcion: descripcion.trim(),
        agotado,
        cantidad: cantidad === "" ? 0 : parseInt(cantidad, 10),
        categoria: categoria.trim(),
      };

      // Validar campos con el nuevo objeto
      const validacion = validarCampos(
        nuevoProducto,
        imagenesArchivo.length > 0
      );
      if (!validacion.valido) {
        setErrores(validacion.errores);
        setEnviando(false);
        return;
      }

      if (editId) {
        await editarProducto(editId, {
          ...nuevoProducto,
          fechaCarga: new Date().toISOString(),
        });
      } else {
        await agregarProducto({
          ...nuevoProducto,
          fechaCarga: new Date().toISOString(),
        });
      }

      setMostrarFormulario(false);
      limpiarFormulario();
      fetchProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminarProducto = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este producto?")) {
      try {
        await eliminarProducto(id);
        fetchProductos();
      } catch (error) {
        console.error("Error al eliminar producto:", error);
      }
    }
  };

  const productosFiltrados = productos.filter((prod) =>
    prod.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Panel de Administración</h2>

      <div className="mb-3 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2">
        <Button variant="success" onClick={abrirFormularioAgregar}>
          Agregar Producto
        </Button>
        <Form.Control
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Imágenes</th>
              <th>Descripción</th>
              <th>Agotado</th>
              <th>Cantidad</th>
              <th>Categoría</th>
              <th>Fecha Carga</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((prod) => (
              <tr key={prod.id}>
                <td>{prod.nombre}</td>
                <td>${prod.precio.toFixed(2)}</td>
                <td style={{ display: "flex", gap: "8px" }}>
                  {prod.imagenes?.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`${prod.nombre} imagen ${idx + 1}`}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                      }}
                    />
                  ))}
                </td>
                <td>{prod.descripcion}</td>
                <td>{prod.agotado ? "Sí" : "No"}</td>
                <td>{prod.cantidad}</td>
                <td>{prod.categoria}</td>
                <td>
                  {prod.fechaCarga
                    ? new Date(prod.fechaCarga).toLocaleDateString()
                    : ""}
                </td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => iniciarEdicion(prod)}
                    className="me-2"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleEliminarProducto(prod.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        show={mostrarFormulario}
        onHide={() => {
          setMostrarFormulario(false);
          limpiarFormulario();
        }}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Editar Producto" : "Agregar Producto"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-3">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresar nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                isInvalid={!!errores.nombre}
              />
              <Form.Control.Feedback type="invalid">
                {errores.nombre}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingresar precio"
                min={0}
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                isInvalid={!!errores.precio}
              />
              <Form.Control.Feedback type="invalid">
                {errores.precio}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Imágenes (máximo 2)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                multiple
                onChange={handleArchivoSeleccionado}
                isInvalid={!!errores.imagenes}
              />
              <Form.Control.Feedback type="invalid">
                {errores.imagenes}
              </Form.Control.Feedback>

              <div className="d-flex flex-wrap gap-3 mt-2">
                {/* Imágenes URLs existentes con botón para eliminar */}
                {imagenes.map((url, idx) => (
                  <div key={`url-${idx}`} style={{ position: "relative" }}>
                    <img
                      src={url}
                      alt={`Imagen ${idx + 1}`}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        padding: "0 6px",
                      }}
                      onClick={() => quitarImagen(idx, false)}
                    >
                      X
                    </Button>
                  </div>
                ))}

                {/* Imágenes nuevas (archivos) con botón para eliminar */}
                {imagenesArchivo.map((file, idx) => {
                  const urlTemp = URL.createObjectURL(file);
                  return (
                    <div key={`file-${idx}`} style={{ position: "relative" }}>
                      <img
                        src={urlTemp}
                        alt={`Preview archivo ${idx + 1}`}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          padding: "0 6px",
                        }}
                        onClick={() => quitarImagen(idx, true)}
                      >
                        X
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ingresar descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                isInvalid={!!errores.descripcion}
              />
              <Form.Control.Feedback type="invalid">
                {errores.descripcion}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 d-flex align-items-center gap-3">
              <Form.Control
                type="number"
                placeholder="Cantidad"
                min={0}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                style={{ maxWidth: "150px" }}
                isInvalid={!!errores.cantidad}
              />
              
              <Form.Check
                type="checkbox"
                label="Agotado"
                checked={agotado}
                onChange={(e) => setAgotado(e.target.checked)}
                style={{ flexShrink: 0 }}
              />
              <Form.Control.Feedback type="invalid">
                {errores.cantidad}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresar categoría"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                isInvalid={!!errores.categoria}
              />
              <Form.Control.Feedback type="invalid">
                {errores.categoria}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setMostrarFormulario(false);
                  limpiarFormulario();
                }}
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={enviando}>
                {enviando
                  ? (editId ? "Guardando..." : "Agregando...")
                  : (editId ? "Guardar Cambios" : "Agregar Producto")}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Admin;
