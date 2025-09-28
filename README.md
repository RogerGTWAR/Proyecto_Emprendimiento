<p align="center">
    <img src="frontend/public/Logo.png" width="200" height="200" alt="MateriaLab Logo">
    <br>
    <span style="color: #111A3B; font-size: 3rem; font-weight: 700;">MateriaLab</span>
</p>

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

## Crear la base de datos

En la raiz del proyecto encontraras el archivo hackathonDB.sql, descargalo 
y asegurate de ejecutarlo en tu gestor de base de datos de PostgreSQL.

## Crea un archivo .env y copia los valores del archivo env.example en .env

Una vez tengas el archivo .env reemplaza los valores por tus respectivas credenciales 
para el funcionamiento correcto de la app.

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
