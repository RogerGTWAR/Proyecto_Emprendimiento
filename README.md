<div align="center">
    <img src="frontend/public/Logo.png" width="200" height="200" alt="MateriaLab Logo">
    <br>
    <h1 style="color: #111A3B; font-weight: bold;">MateriaLab</h1>
</div>

# Requisitos del sistema

- Node.js y npm (LTS)
- PostgreSQL 18

Para ejecutar el programa necesitas seguir los siguientes pasos: 

## Clonar el repositorio

```bash
git clone https://github.com/RogerGTWAR/Proyecto_Emprendimiento.git
```

## Instalar las dependencias

Ve a la raiz del proyecto y ejecuta el siguiente comando: 

```bash 
npm install
```

Instala las dependencias al backend y frontend:
```bash 
cd backend
npm install
```
```bash 
cd ../frontend
npm install
```


## Crear la base de datos

En la raiz del proyecto encontraras el archivo hackathonDB.sql, descargalo 
y asegurate de ejecutarlo en tu gestor de base de datos de PostgreSQL.

## Crea y reemplaza los archivos .env

Dentro de las carpetas /backend y /frontend encontraras archivos example.env, 
debes de copiar el contenido de estos archivos y pegarlos en archivos .env que 
debes crear en la carpeta /backend y /frontend. Luego de pegar el contenido 
reemplaza cada una de las variables de entorno por tus credenciales.

## Conectar la base de datos con el backend

Ya que la base de datos esta lista y has reemplazado correctamente los valores en el
archivo .env ejecuta los siguientes comandos en la carpeta /backend del proyecto.

```bash 
npx prisma db pull
npx prisma generate
```

## Correr el programa

En la raiz del programa ejecuta el siguiente comando: 

```bash 
npm run dev
```
