import { useEffect, useState } from "react";
import ProductList from "../components/ProductList";
import {
  getProducts,
  searchProducts,
  getCategories,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Estados para Búsqueda (Paso 9)
  const [search, setSearch] = useState("");

  // Estados para Categorías (Pasos 10 y 11)
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");

  // Estados para Formulario y Edición (Pasos 13 y 14)
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
  });

  // Estados para Paginación (Paso 12)
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts(pageNumber = 1) {
    try {
      setLoading(true);
      setError("");
      const skip = (pageNumber - 1) * limit;
      const data = await getProducts(limit, skip);
      setProducts(data.products);
      setTotal(data.total);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  }

  // Paso 9: Búsqueda de productos
  async function handleSearch(event) {
    event.preventDefault();
    try {
      setLoading(true);
      if (search.trim() === "") {
        await loadProducts(1);
        return;
      }
      const data = await searchProducts(search);
      setProducts(data.products);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Pasos 10 y 11: Filtrar por categoría
  async function handleCategory(event) {
    const selectedCategory = event.target.value;
    setCategory(selectedCategory);
    try {
      setLoading(true);
      if (selectedCategory === "") {
        await loadProducts(1);
        return;
      }
      const data = await getProductsByCategory(selectedCategory);
      setProducts(data.products);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  // Paso 13: Crear producto
  async function handleCreate(event) {
    event.preventDefault();
    try {
      const newProduct = await createProduct({
        ...form,
        price: Number(form.price),
      });
      setProducts([newProduct, ...products]);
      setForm({ title: "", price: "", description: "" });
    } catch (error) {
      setError(error.message);
    }
  }

  // Paso 14: Preparar datos para editar producto
  function handleEdit(product) {
    setEditingId(product.id);
    setForm({
      title: product.title,
      price: product.price,
      description: product.description,
    });
  }

  // Paso 14: Actualizar producto
  async function handleUpdate(event) {
    event.preventDefault();
    try {
      const updated = await updateProduct(editingId, {
        ...form,
        price: Number(form.price),
      });
      setProducts(
        products.map((product) =>
          product.id === editingId ? { ...product, ...updated } : product
        )
      );
      setEditingId(null);
      setForm({ title: "", price: "", description: "" });
    } catch (error) {
      setError(error.message);
    }
  }

  // Paso 15: Eliminar producto
  async function handleDelete(id) {
    try {
      await deleteProduct(id);
      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      setError(error.message);
    }
  }

  // Paso 12: Funciones de paginación
  function nextPage() {
    const totalPages = Math.ceil(total / limit);
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      loadProducts(newPage);
    }
  }

  function previousPage() {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      loadProducts(newPage);
    }
  }

  if (loading && products.length === 0) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section>
      <h1>Productos</h1>

      {/* Paso 9: Buscador */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>

      {/* Pasos 10 y 11: Selector de Categorías */}
      <select value={category} onChange={handleCategory}>
        <option value="">Todas las categorías</option>
        {categories.map((item) => {
          const value = item.slug ?? item;
          const label = item.name ?? item;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>

      {/* Pasos 13 y 14: Formulario de Crear / Actualizar */}
      <form onSubmit={editingId ? handleUpdate : handleCreate} className="product-form">
        <input
          type="text"
          name="title"
          placeholder="Nombre"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={form.price}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Descripción"
          value={form.description}
          onChange={handleChange}
        />
        <button type="submit">{editingId ? "Actualizar" : "Guardar"}</button>
      </form>

      {/* Paso 15: Listado con opciones de edición y eliminación */}
      <ProductList
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Paso 12: Controles de Paginación */}
      <div className="pagination">
        <button onClick={previousPage} disabled={page === 1}>
          Anterior
        </button>
        <span>Página {page}</span>
        <button onClick={nextPage} disabled={page >= Math.ceil(total / limit)}>
          Siguiente
        </button>
      </div>
    </section>
  );
}

export default Products;