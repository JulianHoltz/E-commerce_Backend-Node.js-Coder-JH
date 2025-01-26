import {Router} from 'express'; //Importo modulo router de express
import fs from 'fs/promises';
import path from 'path';
import { getDirname } from '../utils/dirname.js';
// import {uploader} from '../utilis.js' //Esto todavia no existe...

const router = Router();
const __dirname = getDirname(import.meta.url);
let products = []; //array para almacenar productos por ahora...

//Obtener todos los productos yendo al router
router.get('/', async (req,res) => {
    try{
        const response = await loadProducts();
        res.json(response);
    } catch (error){
        console.error('Error al cargar los productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


//obtener producto por id
router.get('/:id', async(req,res) => {
    const {id} = req.params;
    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }
    try{
        const products = await loadProducts();
        const product = products.find(p => p.id === id);
        if (!product){
            return res.status(404).json({error: 'product not found'});
        }
        res.json(product);
    } catch (error){
        console.error('Error al cargar los productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }

});

//Agreagar una nuevo producto
router.post('/',(req,res) => {
    const {name, type} = req.body;
    if (!name || !type){
        return res.status(400).json({error: 'Name and Type are required'});
    }

    const newProduct = {id: products.length + 1, name, type};
    pets.push(newProduct);
    res.status(201).json({message: 'Product added succesfully', product: newProduct});
});


//Actualizar un producto
router.put('/:name', (req,res) => {
    const {name} = req.params;
    const {type} = req.body;
    const product = products.find(p => p.name.toLowerCase() === name.toLowerCase());
    if(!product){
        return res.status(404).json({error: "product not found"});
    }
    if (!type){
        return res.status(400).json({error: "Type is required"});
    }
    product.type = type;
    res.json({message: 'Product updated succesfully'})
});

//Eliminar un producto
router.delete('/:name', (req,pos) => {
    const {name} = req.params;
    const initialLength = products.length;
    products = products.filter(p => p.name.toLowerCase() !== name.toLowerCase());
    if (products.length === initialLength){
        return res.status(404).json({error: 'Product not found'});
    } 
    res.json({message: 'Product deleted'});
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
    thumbnails: ""
}

//const stringifyJSON = JSON.stringify(productTest);

async function loadProducts() {
    //Declaro la ruta absoluta del archivo OJO, si queda dentro del TRY el CATCH no lo va a poder usar!
    const filePath = path.resolve(__dirname, '../data/products.json');

    try {
        
        // Intentar leer el archivo
         const data = await fs.readFile(filePath, 'utf-8');
         console.log(data)
        

        // Parsear el contenido del archivo
         const products = JSON.parse(data);
         return products;


    } catch (error) {
        // Si el archivo no existe, aviso
        if (error.code === 'ENOENT') {
            console.warn('El archivo no existe.');
        } else {
            // Manejo de otros errores
            console.error('Error, algo salió mal:', error);
        }
    }
}

async function saveProduct() {
    //Declaro la ruta absoluta del archivo,
    const filePath = path.resolve(__dirname, '../data/products.json');

    try {
        // Intentar leer el archivo
        const data = await fs.readFile(filePath, 'utf-8');
        console.log(`Contenido del archivo: ${data}`);

        // Parsear el contenido del archivo
        const products = JSON.parse(data);

        // Agregar el nuevo producto
        products.push(productTest);

        // Guardar el archivo actualizado
        await fs.writeFile(filePath, JSON.stringify(products, null, 2), 'utf-8');
        console.log('Producto añadido con éxito:', productTest);
    } catch (error) {
        // Si el archivo no existe, crearlo
        if (error.code === 'ENOENT') {
            console.warn('El archivo no existe. Creando uno nuevo...');

            // Crear un nuevo array con el producto inicial
            const products = [productTest];

            // Guardar el archivo
            await fs.writeFile(filePath, JSON.stringify(products, null, 2), 'utf-8');
            console.log('Archivo creado y producto añadido con éxito:', productTest);
        } else {
            // Manejo de otros errores
            console.error('Error, algo salió mal:', error);
        }
    }
}

//Save new Product


export default router;