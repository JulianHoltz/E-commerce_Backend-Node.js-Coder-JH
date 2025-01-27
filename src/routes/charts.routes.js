import { Router } from "express"; //Importo modulo router de express
import fs from "fs/promises";
import path from "path";
import { getDirname } from "../utils/dirname.js";
// import {uploader} from '../utilis.js' //Esto todavia no existe...

//TO DO LIST


const router = Router();
const __dirname = getDirname(import.meta.url);

//Obtener todos los carritos yendo al router
router.get("/", async (req, res) => {
  try {
    const response = await loadCharts();
    res.json(response);
  } catch (error) {
    console.error("Error al cargar los carritos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Crear Carrito Nuevo
router.post("/", async (req,res) => {
  res.json("no hago nada, por que no quiero");
})

//obtener carrito por id
router.get("/:cid", async (req, res) => {
  const { cid } = req.params;
  if (!cid) {
    return res.status(400).json({ error: "ID is required" });
  }
  try {
    const charts = await loadCharts();
    const chart = charts.find((c) => c.id === cid);
    if (!chart) {
      return res.status(404).json({ error: "chart not found" });
    }
    res.json(chart);
  } catch (error) {
    console.error("Error al cargar los carritos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Agregar producto al carrito
router.post("/:cid/product/", async (req,res) => {
  const {cid} = req.params;
  const {pid, quantity} = req.body;

  if (!cid || !pid || !quantity) {
    return res.status(400).json({ error: "Chart ID, Product ID and Product Quantity are required" });
  }
  try {
    const charts = await loadCharts();
    const chart = charts.find((c) => c.id === cid);
    if (!chart) {
      return res.status(404).json({ error: "chart not found" });
    }

    //Busco si el producto ya esta cargado:
    const products = chart.products;
    const product = products.find((p) => p.id === pid);
    //si no existe lo sumo
    if (!product) {
      const newProduct = {"id": `${pid}`, "quantity":`${quantity}`};
      chart.products.push(newProduct);
    //si existe le sumo la cantidad
    } else {
      product.quantity = toString(parseInt(product.quantity) + parseInt(quantity));
    }

  

    //guardo los cambios
    saveList(charts);
    res.json(`Se aniadio el producto al carrito`); //esto solo muestra, no guarda


    
  } catch (error) {
    console.error("Error al cargar los carritos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }

});

async function loadCharts() {
  //Declaro la ruta absoluta del archivo
  const filePath = path.resolve(__dirname, "../data/charts.json");

  try {
    // Intentar leer el archivo
    const data = await fs.readFile(filePath, "utf-8");
    console.log(data);

    // Parsear el contenido del archivo
    const products = JSON.parse(data);
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

async function saveList(newList) {
    //Declaro la ruta absoluta del archivo,
    const filePath = path.resolve(__dirname, "../data/charts.json");
  
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