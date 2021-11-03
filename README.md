# Apaga luz

Es un pequeño proyecto para mostrar el precio de la luz justo en el momento que entras a la web y una tabla con los precios del día.

## Datos

Los datos los consumo de la [API de REE](https://api.esios.ree.es/). Para ello necesitarás un TOKEN que deberás solicitar.

Los datos se obtienen y se procesan automáticamente con [flat-data](https://octo.github.com/projects/flat-data) a través de una GitHub Action. 

Todos los días se lanzan dos actualizaciones. La primera actualización de las tarifas de la luz se realiza a las 20:30 de la noche, la web se actualiza para mostrar una tabla con los precios del día siguiente, sin perder la tabla de precios del día en el que estamos. Hay que tener en cuenta que los precios desglosados por hora para el siguiente día se hacen públicos a las 20:15. La segunda actualización se realiza a las 00:00, y en esta se actualiza la tabla de las horas más baratas y las horas más caras.

## Lanza el proyecto

Primero hay que instalar las dependencias

```bash
yarn
```

o

```
npm i
```

Y lanza el proyecto con

```
yarn dev
```

o

```
npm run dev
```
