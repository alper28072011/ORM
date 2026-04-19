# Production Dockerfile
FROM node:22-slim

# Puppeteer için gerekli olan tüm kütüphaneler (libglib vb) ve CA sertifikaları
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Paketlerin kurulumu
COPY package*.json ./
RUN npm install

# Kaynak kodlarının kopyalanması
COPY . .

# Build işlemi
RUN npm run build

# Uygulamanın çalıştırılmasına dair port atamaları (Cloud Run için genelde 8080'dir ancak bu sistem 3000 zorunlu tutuyor)
ENV PORT 3000
EXPOSE 3000

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/google-chrome-stable

# Başlatma komutu
CMD ["npm", "start"]
