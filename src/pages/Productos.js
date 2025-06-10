import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Form,
  Collapse,
  Modal,
  Button,
} from "react-bootstrap";
import { getProductos } from "../services/firebaseService";
import { Link } from "react-router-dom";
import "./Productos.css";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtrosVisible, setFiltrosVisible] = useState(false);
  const [filtroPrecio, setFiltroPrecio] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  // Estado para modal y navegación de imágenes
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [indiceImagen, setIndiceImagen] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      try {
        const data = await getProductos();
        setProductos(data);
      } catch (err) {
        console.error("Error al cargar productos:", err);
      }
      setLoading(false);
    };

    fetchProductos();
  }, []);

  // Extraemos categorías únicas para filtro
  const categoriasUnicas = [...new Set(productos.map((p) => p.categoria))];

  // Filtramos y ordenamos productos según filtros seleccionados
  const productosFiltrados = productos
    .filter((producto) =>
      filtroCategoria ? producto.categoria === filtroCategoria : true
    )
    .sort((a, b) => {
      if (filtroPrecio === "menor") return a.precio - b.precio;
      if (filtroPrecio === "mayor") return b.precio - a.precio;
      return 0;
    });

  // Abrir modal y resetear índice imagen
  const abrirModal = (producto) => {
    setProductoSeleccionado(producto);
    setIndiceImagen(0);
    setModalVisible(true);
  };

  // Cerrar modal y limpiar selección
  const cerrarModal = () => {
    setModalVisible(false);
    setProductoSeleccionado(null);
  };

  // Cambiar a imagen anterior
  const anteriorImagen = () => {
    if (!productoSeleccionado?.imagenes) return;
    setIndiceImagen((prev) =>
      prev === 0 ? productoSeleccionado.imagenes.length - 1 : prev - 1
    );
  };

  // Cambiar a imagen siguiente
  const siguienteImagen = () => {
    if (!productoSeleccionado?.imagenes) return;
    setIndiceImagen((prev) =>
      prev === productoSeleccionado.imagenes.length - 1 ? 0 : prev + 1
    );
  };

  // Función para armar el enlace de WhatsApp con mensaje personalizado
  const getWhatsappLink = (producto) => {
    const numero = "5493885715705";
    const nombre = producto?.nombre || "";
    const categoria = producto?.categoria || "";
    const descripcion = producto?.descripcion || "";
    const mensaje = encodeURIComponent(
      `Hola! Quisiera consultar el precio del producto "${nombre}".\nCategoría: ${categoria}\nDescripción: ${descripcion}\n¿Me podrías informar?`
    );
    if (window.innerWidth > 768) {
      return `https://web.whatsapp.com/send?phone=${numero}&text=${mensaje}`;
    }
    return `https://wa.me/${numero}?text=${mensaje}`;
  };

  return (
    <Container fluid className="p-4 custom-container">
      <div className="productos-banner mb-4">
        <h2 className="productos-banner-text">Nuestros Productos</h2>
      </div>

      <Row>
        {/* Filtros */}
        <Col xs={12} md={3} className="mb-4">
          <Card className="filtros-card p-3">
            <button
              className="mb-2 d-md-none buttonFilters"
              onClick={() => setFiltrosVisible(!filtrosVisible)}
              aria-controls="filtros"
              aria-expanded={filtrosVisible}
            >
              {filtrosVisible ? "Ocultar Filtros" : "Mostrar Filtros"}
            </button>

            <Collapse in={filtrosVisible || window.innerWidth >= 768}>
              <div id="filtros">
                <h5>Filtrar por Precio</h5>
                <Form.Check
                  type="radio"
                  label="Menor a Mayor"
                  name="precio"
                  value="menor"
                  checked={filtroPrecio === "menor"}
                  onChange={(e) => setFiltroPrecio(e.target.value)}
                  className="mb-2"
                />
                <Form.Check
                  type="radio"
                  label="Mayor a Menor"
                  name="precio"
                  value="mayor"
                  checked={filtroPrecio === "mayor"}
                  onChange={(e) => setFiltroPrecio(e.target.value)}
                  className="mb-2"
                />

                <h5 className="mt-3">Filtrar por Categoría</h5>
                {categoriasUnicas.map((categoria) => (
                  <Form.Check
                    key={categoria}
                    type="radio"
                    label={categoria}
                    name="categoria"
                    value={categoria}
                    checked={filtroCategoria === categoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="mb-2"
                  />
                ))}
                <Form.Check
                  type="radio"
                  label="Todas"
                  name="categoria"
                  value=""
                  checked={filtroCategoria === ""}
                  onChange={() => setFiltroCategoria("")}
                  className="mb-2"
                />
              </div>
            </Collapse>
          </Card>
        </Col>

        {/* Productos */}
        <Col xs={12} md={9}>
          {loading ? (
            <div className="text-center my-4">
              <Spinner animation="border" role="status" />
              <span className="ms-2">Cargando productos...</span>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <p>No hay productos disponibles</p>
          ) : (
            <Row>
              {productosFiltrados.map((producto) => (
                <Col
                  lg={4}
                  md={4}
                  sm={6}
                  xs={12}
                  className="mb-4"
                  key={producto.id}
                >
                  <Card
                    className="producto-card"
                    onClick={() => abrirModal(producto)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="image-container">
                      <Card.Img
                        src={
                          producto.imagenes
                            ? producto.imagenes[0]
                            : producto.imagen
                        }
                        alt={producto.nombre}
                        className="product-image"
                        style={{ maxHeight: "220px" }}
                      />
                    </div>
                    <Card.Body>
                      <Card.Title>{producto.nombre}</Card.Title>
                      <p className="producto-descripcion">
                        {producto.descripcion}
                      </p>
                      <Card.Text>${producto.precio}</Card.Text>
                      <Badge bg={producto.agotado ? "danger" : "success"}>
                        {producto.agotado ? "AGOTADO" : "DISPONIBLE"}
                      </Badge>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>

      {/* Modal para producto seleccionado */}
      <Modal show={modalVisible} onHide={cerrarModal} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>{productoSeleccionado?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col
              md={6} xs={12}
              className="d-flex justify-content-center align-items-center modal-imagen-container"
            >
              <div className="position-relative w-100">
                <img
                  src={
                    productoSeleccionado?.imagenes
                      ? productoSeleccionado.imagenes[indiceImagen]
                      : productoSeleccionado?.imagen
                  }
                  alt={productoSeleccionado?.nombre}
                  className="modal-product-image w-100"
                />
                {productoSeleccionado?.imagenes &&
                  productoSeleccionado.imagenes.length > 1 && (
                    <>
                      <Button
                        variant="dark"
                        onClick={anteriorImagen}
                        className="btn-anterior"
                      >
                        &#8592;
                      </Button>
                      <Button
                        variant="dark"
                        onClick={siguienteImagen}
                        className="btn-siguiente"
                      >
                        &#8594;
                      </Button>
                    </>
                  )}
              </div>
            </Col>
            <Col md={6} xs={12} className="modal-detalle-container">
              <h4>${productoSeleccionado?.precio}</h4>
              <p className="producto-categoria">
                <strong>Categoría: </strong>{" "}
                {productoSeleccionado?.categoria || "N/A"}
              </p>
              <p className="modal-descripcion">
                {productoSeleccionado?.descripcion}
              </p>
              <button
                className="btn btn-comprar"
                onClick={() => {
                  const url = getWhatsappLink(productoSeleccionado);
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
              >
                Comprar
              </button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      <Link
        to="https://www.instagram.com/glossier.tienda/"
        target="_blank"
        rel="noopener noreferrer"
        className="instagram-icon"
      >
        <i className="bi bi-instagram"></i>
      </Link>
    </Container>
  );
}

export default Productos;
