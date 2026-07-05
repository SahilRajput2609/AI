FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/dashboard ./apps/dashboard
COPY packages ./packages
RUN npm ci && npm run build -w apps/dashboard

FROM nginx:alpine
COPY --from=build /app/apps/dashboard/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
