# Ronak Thakkar — Portfolio Website

> **Senior QA Test Engineer** | 5+ years at TechMahindra | Quality Assurance, Test Automation, Agile

[![CI/CD Pipeline](https://github.com/RThakkar007/ronak-portfolio-obsidian-gold/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/RThakkar007/ronak-portfolio-obsidian-gold/actions/workflows/ci-cd.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ronak-portfolio&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ronak-portfolio)
[![Docker Image](https://img.shields.io/docker/pulls/rthakkar007/ronak-portfolio)](https://hub.docker.com/r/rthakkar007/ronak-portfolio)

---

## Infrastructure Overview

This repository contains the full **MNC-level DevOps infrastructure** for the Ronak Thakkar portfolio website. The infrastructure follows industry best practices across CI/CD, containerisation, orchestration, security scanning, infrastructure-as-code, and observability.

| Layer | Tool | Purpose |
|---|---|---|
| **CI/CD** | Jenkins + GitHub Actions | Automated build, test, and deploy pipelines |
| **Code Quality** | SonarQube / SonarCloud | Static analysis, code smell detection, quality gates |
| **Containerisation** | Docker + Nginx | Multi-stage builds, non-root user, security hardening |
| **Orchestration** | Kubernetes + Helm | Scalable deployment with HPA, liveness/readiness probes |
| **Infrastructure** | Terraform (AWS EKS) | Infrastructure-as-Code for cloud provisioning |
| **Security Scanning** | Trivy (SAST + Container) | Vulnerability scanning for code and Docker images |
| **Monitoring** | Prometheus + Grafana | Metrics collection and visual dashboards |
| **Secrets** | GitHub Secrets / K8s Secrets | Secure credential management |

---

## Project Structure

```
ronak-portfolio-obsidian-gold/
├── index.html                        # Main portfolio page
├── css/
│   └── style.css                     # Styles
├── js/
│   └── main.js                       # JavaScript
│
├── Dockerfile                        # Multi-stage Docker build
├── nginx.conf                        # Nginx with security headers
├── docker-compose.yml                # Full local dev stack (Jenkins, SonarQube, Grafana)
├── .dockerignore
├── .gitignore
│
├── Jenkinsfile                       # Jenkins declarative pipeline
├── sonar-project.properties          # SonarQube project config
│
├── k8s/
│   └── helm/
│       └── ronak-portfolio/
│           ├── Chart.yaml
│           ├── values.yaml
│           └── templates/
│               ├── _helpers.tpl
│               ├── deployment.yaml
│               ├── service.yaml
│               └── ingress.yaml
│
├── terraform/
│   ├── main.tf                       # AWS VPC + EKS cluster
│   └── variables.tf
│
├── monitoring/
│   └── prometheus.yml                # Prometheus scrape config
│
└── .github/
    └── workflows/
        └── ci-cd.yml                 # GitHub Actions pipeline
```

---

## Quick Start (Local Development)

### Prerequisites

- Docker Desktop installed
- Docker Compose v2+

### Run the Full Stack Locally

```bash
# Clone the repository
git clone https://github.com/RThakkar007/ronak-portfolio-obsidian-gold.git
cd ronak-portfolio-obsidian-gold

# Start all services (Portfolio, Jenkins, SonarQube, Prometheus, Grafana)
docker-compose up -d

# Access services
# Portfolio:   http://localhost:80
# Jenkins:     http://localhost:8080
# SonarQube:   http://localhost:9000
# Prometheus:  http://localhost:9090
# Grafana:     http://localhost:3000
```

### Build Docker Image Only

```bash
docker build -t ronak-portfolio:local .
docker run -p 80:80 ronak-portfolio:local
```

---

## CI/CD Pipeline

### GitHub Actions (Recommended)

The pipeline defined in `.github/workflows/ci-cd.yml` runs automatically on every push:

1. **Code Quality** — SonarCloud scan + Trivy SAST scan
2. **Build** — Docker multi-stage build with layer caching
3. **Security** — Trivy container image vulnerability scan
4. **Push** — Push to Docker Hub with SHA and branch tags
5. **Deploy Dev** — Helm deploy to `dev` namespace (on `develop` branch)
6. **Deploy Prod** — Helm deploy to `prod` namespace (on `master` branch, requires approval)

### Jenkins Pipeline

The `Jenkinsfile` provides the same pipeline for on-premise Jenkins setups. Configure the following credentials in Jenkins:

| Credential ID | Type | Description |
|---|---|---|
| `dockerhub-credentials` | Username/Password | Docker Hub login |
| `sonar-token` | Secret Text | SonarQube token |
| `kubeconfig` | Secret File | Kubernetes config file |

---

## Kubernetes Deployment

### Deploy with Helm

```bash
# Add to dev namespace
helm upgrade --install ronak-portfolio ./k8s/helm/ronak-portfolio \
  --namespace dev \
  --create-namespace \
  --set image.tag=latest

# Add to prod namespace
helm upgrade --install ronak-portfolio ./k8s/helm/ronak-portfolio \
  --namespace prod \
  --create-namespace \
  --set image.tag=<BUILD_NUMBER>
```

### Key Kubernetes Features

- **Horizontal Pod Autoscaler (HPA)** — Scales from 2 to 5 replicas based on CPU/memory
- **Liveness & Readiness Probes** — Automatic restart and traffic routing
- **Non-root container** — Runs as UID 101 for security
- **Read-only root filesystem** — Hardened container security
- **TLS via cert-manager** — Automatic Let's Encrypt certificates
- **Resource limits** — CPU and memory limits enforced

---

## Infrastructure as Code (Terraform)

```bash
cd terraform

# Initialise providers and remote state
terraform init

# Preview changes
terraform plan -var="environment=production"

# Apply infrastructure
terraform apply -var="environment=production"
```

This provisions:
- AWS VPC with public/private subnets across 3 AZs
- EKS cluster (Kubernetes 1.28) with managed node groups
- S3 remote state backend with DynamoDB locking

---

## Security

The following security controls are implemented:

| Control | Implementation |
|---|---|
| **SAST** | Trivy filesystem scan on every PR |
| **Container Scanning** | Trivy image scan before push |
| **Security Headers** | X-Frame-Options, CSP, HSTS, XSS-Protection via Nginx |
| **Non-root Container** | Nginx runs as UID 101 |
| **Read-only Filesystem** | `readOnlyRootFilesystem: true` in K8s |
| **Secrets Management** | GitHub Secrets / Kubernetes Secrets |
| **TLS Encryption** | cert-manager + Let's Encrypt |

---

## Monitoring

Access Grafana at `http://localhost:3000` (default: admin/admin).

Prometheus scrapes metrics from:
- Portfolio Nginx instance
- Nginx exporter (request rates, latency, error rates)

---

## Required GitHub Secrets

Configure these secrets in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password or access token |
| `SONAR_TOKEN` | SonarCloud project token |
| `KUBECONFIG` | Base64-encoded kubeconfig for K8s cluster |

---

## Author

**Ronak Thakkar** — Senior QA Test Engineer  
[theronakthakkar@gmail.com](mailto:theronakthakkar@gmail.com) | [LinkedIn](https://linkedin.com/in/ronakthakkar)

---

*Infrastructure designed and implemented following MNC-level DevOps best practices.*
