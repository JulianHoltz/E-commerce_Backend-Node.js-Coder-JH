import express from 'express'; //importo la libreria de express
import productsRouter from './routes/products.routes.js'
import chartsRouter from './routes/charts.routes.js'
import morgan from 'morgan';




//colores para logs en la consola
const colores = {
    reset: "\x1b[0m",
    info: "\x1b[34m", //azul
    succes: "\x1b[32m", //verde
    warning: "\x1b[33m", //amarillo
    error: "\x1b[31m", //rojo
};

//Instancio express y el puerto
const app = express();
const PORT = 8080;


//Middleware para parsear JSON
app.use(express.json()); //este es para mandar objetos complejos en JSON y que los entienda...
app.use(express.urlencoded({extended: true})); //esto convierte datos accesibles a traves de req.body en true objetos complejos, si es false no soporta objetos complejos
app.use(morgan("tiny"));


//Rutas principales
//app.use("/api/users", userRouter); //Esto todavia no lo uso
app.use("/api/products", productsRouter);
app.use("/api/charts", chartsRouter);


//paginas publicas
app.use("/static", express.static("public"));


//Servidor en escucha...
app.listen(PORT, () =>
console.log(`${colores.info}Servidor escuchando el puerto:${PORT}`)
);

