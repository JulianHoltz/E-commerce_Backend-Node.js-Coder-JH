import { Router } from "express"; //Importo modulo router de express
import fs from "fs/promises";
import path from "path";
import { getDirname } from "../utils/dirname.js";
// import {uploader} from '../utilis.js' //Esto todavia no existe...

//TO DO LIST
//OJO, falta arregalr lo de los IDs, la formula para que sean unicos no garantiza que sean unicos...

const router = Router();
const __dirname = getDirname(import.meta.url);

//Obtener todos los productos yendo al router
router.get("/", async (req, res) => {
  try {
    const response = await loadProducts();
    res.json(response);
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//obtener producto por id
router.get("/:pid", async (req, res) => {
  const { pid } = req.params;
  if (!pid) {
    return res.status(400).json({ error: "ID is required" });
  }
  try {
    const products = await loadProducts();
    const product = products.find((p) => p.id === pid);
    if (!product) {
      return res.status(404).json({ error: "product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Agreagar una nuevo producto
router.post("/", async (req, res) => {
  const {
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails,
  } = req.body;
  if (
    !title ||
    !description ||
    !code ||
    !price ||
    !status ||
    !stock ||
    !category
  ) {
    return res
      .status(400)
      .json({
        error:
          "Name, description, code, price, status, stock and category are required",
      });
  }
  //Traigo la infomracion de la lista de productos actual
  try {
    const response = await loadProducts();

    const nuevoProducto = {
      id: (response.length + 1).toString(),
      title: title,
      description: description,
      code: code,
      price: price,
      status: true,
      stock: stock,
      category: category,
      thumbnails: thumbnails,
    };

    res.json(saveProduct(nuevoProducto));
  } catch (error) {
    console.error("Error de conexion:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Actualizar un producto
router.put("/:pid", async (req, res) => {
  const { pid } = req.params;
  let { title, description, code, price, status, stock, category, thumbnails } =
    req.body;

  if (!pid) {
    return res.status(400).json({ error: "ID is required" });
  }
  try {
    const products = await loadProducts();
    const product = products.find((p) => p.id === pid);
    if (!product) {
      return res.status(404).json({ error: "product not found" });
    }

    if (!title) {
      title = product.title;
    }
    if (!description) {
      description = product.description;
    }
    if (!code) {
      code = product.code;
    }
    if (!price) {
      price = product.price;
    }
    if (!status) {
      status = product.status;
    }
    if (!stock) {
      stock = product.stock;
    }
    if (!category) {
      category = product.category;
    }
    if (!thumbnails) {
      thumbnails = product.thumbnails;
    }

    product.title = title;
    product.description = description;
    product.code = code;
    product.price = price;
    product.status = status;
    product.stock = stock;
    product.category = category;
    product.thumbnails = thumbnails;

    //gguardar
    const filePath = path.resolve(__dirname, "../data/products.json");
    await fs.writeFile(filePath, JSON.stringify(products, null, 2), "utf-8");

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Eliminar un producto
router.delete("/:pid", async (req, res) => {
  const { pid } = req.params;
  if (!pid) {
    return res.status(400).json({ error: "ID is required" });
  }
  try {
    const products = await loadProducts();
    const product = products.find((p) => p.id === pid);
    if (!product) {
      return res.status(404).json({ error: "product not found" });
    }
    const updateProducts = products.filter((o) => o.id !== pid);
    await saveList(updateProducts);
    res.json({message: "salio todo ok"});
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//PRODUCTO PARA PRUEBAS
const productTest = {
  id: "0001",
  title: "Test Product",
  description: "Producto de prueba",
  code: "0000000000",
  price: 1500,
  status: true,
  stock: "5",
  category: "Backend",
  thumbnails: "",
};

//const stringifyJSON = JSON.stringify(productTest);

async function loadProducts() {
  //Declaro la ruta absoluta del archivo OJO, si queda dentro del TRY el CATCH no lo va a poder usar!
  const filePath = path.resolve(__dirname, "../data/products.json");

  try {
    // Intentar leer el archivo
    const data = await fs.readFile(filePath, "utf-8");
    console.log(data);

    // Parsear el contenido del archivo
    const products = JSON.parse(data);
    console.log(products);
    return products;
  } catch (error) {
    // Si el archivo no existe, aviso
    if (error.code === "ENOENT") {
      console.warn("El archivo no existe.");
    } else {
      // Manejo de otros errores
      console.error("Error, algo salió mal:", error);
    }
  }
}

async function saveProduct(newProd) {
  //Declaro la ruta absoluta del archivo,
  const filePath = path.resolve(__dirname, "../data/products.json");

  try {
    // Intentar leer el archivo
    const data = await fs.readFile(filePath, "utf-8");

    // Parsear el contenido del archivo
    const products = JSON.parse(data);

    // Agregar el nuevo producto
    products.push(newProd);

    // Guardar el archivo actualizado
    await fs.writeFile(filePath, JSON.stringify(products, null, 2), "utf-8");
    return "Producto añadido con éxito:", newProd;
  } catch (error) {
    // Si el archivo no existe, crearlo
    if (error.code === "ENOENT") {
      console.warn("El archivo no existe. Creando uno nuevo...");

      // Crear un nuevo array con el producto inicial
      const products = [productTest];

      // Guardar el archivo
      await fs.writeFile(filePath, JSON.stringify(products, null, 2), "utf-8");
      console.log("Archivo creado y producto añadido con éxito:", productTest);
    } else {
      // Manejo de otros errores
      console.error("Error, algo salió mal:", error);
    }
  }
}

async function saveList(newList) {
    //Declaro la ruta absoluta del archivo,
    const filePath = path.resolve(__dirname, "../data/products.json");
  
    try {
      // Intentar leer el archivo
      const data = await fs.readFile(filePath, "utf-8");
  
      // Guardar el archivo actualizado
      await fs.writeFile(filePath, JSON.stringify(newList, null, 2), "utf-8");
      return "Lista guardada con éxito:", newList;
    } catch (error) {
      // Si el archivo no existe, crearlo
      if (error.code === "ENOENT") {
        console.warn("El archivo no existe. Creando uno nuevo...");
  
        // Guardar el archivo
        await fs.writeFile(filePath, JSON.stringify(newList, null, 2), "utf-8");
        console.log("Archivo creado y la Lista se a añadido con éxito:", newList);
      } else {
        // Manejo de otros errores
        console.error("Error, algo salió mal:", error);
      }
    }
  }

export default router;
