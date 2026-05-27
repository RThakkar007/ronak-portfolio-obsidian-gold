# Build stage (if we had a build process, e.g., Node.js, but this is static HTML)
# We'll use a multi-stage build pattern anyway as it's an industry standard

# Stage 1: Base image for static files
FROM alpine:3.19 AS builder
WORKDIR /app
COPY . .
# Remove unnecessary files from the final image
RUN rm -rf .git .github k8s terraform Jenkinsfile Dockerfile nginx.conf sonar-project.properties

# Stage 2: Production Nginx image
FROM nginx:1.25-alpine

# Add non-root user for security (industry standard)
RUN addgroup -g 101 -S nginxuser && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginxuser -g nginxuser nginxuser

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets from builder stage
COPY --from=builder /app /usr/share/nginx/html

# Change ownership to non-root user
RUN chown -R nginxuser:nginxuser /usr/share/nginx/html && \
    chown -R nginxuser:nginxuser /var/cache/nginx && \
    chown -R nginxuser:nginxuser /var/log/nginx && \
    chown -R nginxuser:nginxuser /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginxuser:nginxuser /var/run/nginx.pid

# Switch to non-root user
USER nginxuser

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
