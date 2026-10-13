# Etapa 1: Build de Vite + React
FROM node:20-alpine AS build

WORKDIR /app

# Copiar manifests de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Compilar los estáticos optimizados
RUN npm run build

# Etapa 2: Servidor Web Nginx
FROM nginx:alpine

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el build compilado desde la etapa 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

