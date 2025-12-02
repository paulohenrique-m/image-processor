FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar todas as dependências (incluindo dev para build)
RUN npm install

# Copiar código
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:18-alpine

WORKDIR /app

# Instalar serve globalmente
RUN npm install -g serve

# Copiar build do estágio anterior
COPY --from=builder /app/build ./build

# Expor porta
EXPOSE 3000

# Comando para servir build
CMD ["serve", "-s", "build", "-l", "3000"]