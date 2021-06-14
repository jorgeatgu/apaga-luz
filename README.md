# Apaga luz

Es un pequeño proyecto para mostrar el precio de la luz justo en el momento que entras a la web y una tabla con los precios del día.

## Datos

Los datos los consumo de la [API de REE](https://api.esios.ree.es/). Para ello necesitarás un TOKEN que deberás solicitar.

Los datos se obtienen y se procesan automáticamente con [flat-data](https://octo.github.com/projects/flat-data) a través de una GitHub Action. Todos los días se lanza un CRON entre las 23:30 y 00:30 para obtener los precios del día siguiente. Los datos de la subasta se hacen públicos a las 20:30.

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
