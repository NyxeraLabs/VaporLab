FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY next.config.js ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./
COPY tsconfig.json ./
COPY next-env.d.ts ./
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY layouts ./layouts
COPY themes ./themes
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
