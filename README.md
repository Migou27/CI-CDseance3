# 📦 CI-CD Seance 3 - Pipeline Automatisé

Un projet d'exemple complet démontrant les **meilleures pratiques de CI/CD** avec GitHub Actions, Docker, et orchestration multi-conteneurs.

---

## 🎯 Vue d'ensemble

Ce projet illustre l'intégration continue et le déploiement continu à travers :
- ✅ Tests et linting automatisés
- 🐳 Conteneurisation multi-stage optimisée
- 🔐 Scan de sécurité des images Docker
- 📤 Publication automatique sur registry
- 🏗️ Infrastructure complète avec orchestration

---

## 🔄 Pipeline CI/CD

### Architecture du Workflow

```
PUSH/PR sur main
       ↓
┌─────────────────────┐
│   JOB 1: TEST       │  ← Lance systématiquement sur tout push/PR
│  - Lint             │
│  - Tests unitaires  │
│  - Coverage report  │
└──────────┬──────────┘
           ↓ (succès requis)
┌─────────────────────┐
│   JOB 2: BUILD      │  ← Lance UNIQUEMENT sur push vers main
│  - Build image      │
│  - Push sur GHCR    │
│  - Scan Trivy       │
│  - Cache optimisé   │
└─────────────────────┘
```

### 📝 Détail des Jobs

#### **Job 1 : Test** (Toujours)
- ✓ Checkout du code
- ✓ Setup Node.js 20 avec cache npm
- ✓ Installation des dépendances (`npm ci`)
- ✓ Exécution du linting
- ✓ Exécution des tests avec couverture
- ✓ Upload artefact de coverage

**Fichier:** [.github/workflows/ci.yml](.github/workflows/ci.yml#L11-L27)

#### **Job 2 : Build & Push** (Uniquement sur `push` vers `main`)
- ✓ Authentification GHCR avec token GitHub
- ✓ Setup Docker Buildx (pour cache et features avancées)
- ✓ Extraction metadata (tags SHA + latest)
- ✓ Build multi-stage avec cache GitHub
- ✓ Push image vers registry
- ✓ Scan Trivy pour vulnérabilités CRITIQUES
- ✓ Fail si vulnérabilités trouvées

**Conditions strictes:**
- Dépend du succès du Job 1 (`needs: test`)
- Seulement sur `push` (pas sur PR)
- Seulement sur branche `main`

**Fichier:** [.github/workflows/ci.yml](.github/workflows/ci.yml#L29-L78)

---

## 🐳 Architecture Docker

### Dockerfile - Build Multi-Stage

**Avantages:**
- 🎯 Image finale légère (on ne garde que le runtime)
- 🔒 Sécurité renforcée (utilisateur non-root)
- ⚡ Cache optimal (dépendances séparées du code)

#### Stage 1 : **Builder**
```dockerfile
FROM node:20-alpine AS builder
- Installation de TOUTES les dépendances
- Copie du code source
- Pruning pour ne garder que les dépendances de production
```

#### Stage 2 : **Production**
```dockerfile
FROM node:20-alpine AS production
- ✅ Utilisateur non-root (appuser)
- ✅ Copie UNIQUEMENT des dépendances de prod
- ✅ Healthcheck Docker interne
- ✅ Expose port 3000
- 🚀 Commande: node src/server.js
```

**Fichier:** [Dockerfile](Dockerfile)

---

## 🔗 Docker Compose - Orchestration Locale

### Services

| Service | Image | Rôle |
|---------|-------|------|
| **api** | Build custom | Application Node.js |
| **db** | postgres:16-alpine | Base de données PostgreSQL |
| **redis** | redis:7-alpine | Cache & session store |
| **nginx** | nginx:alpine | Reverse proxy (port 80) |

### Configuration Importante

```yaml
api:
  - env: DATABASE_URL, REDIS_URL, NODE_ENV=production
  - depends_on: db (healthcheck), redis
  - restart: unless-stopped

db:
  - healthcheck: pg_isready chaque 10s
  - volume: pgdata (persistance)
  - timeout start: 30s

redis:
  - maxmemory: 128mb
  - politique: allkeys-lru (éviction LRU)

nginx:
  - ports: 80:80
  - config: ./nginx/default.conf (read-only)
  - depends_on: api
```

**Fichier:** [docker-compose.yml](docker-compose.yml)

---

## 🚀 Démarrage Local

### Prérequis
- Docker & Docker Compose
- Node.js 20+ (pour développement)
- npm

### Lancer l'application

```bash
# Configuration des variables d'environnement
echo "POSTGRES_USER=todo_user" > .env
echo "POSTGRES_PASSWORD=todo_pass123" >> .env
echo "POSTGRES_DB=todo_db" >> .env

# Démarrage des services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f api
```

### Vérification
```bash
# Vérifier les services
docker-compose ps

# Vérifier l'app
curl http://localhost/health

# Voir les logs
docker-compose logs api
```

### Arrêt
```bash
docker-compose down
```

---

## 💻 Développement Local (sans Docker)

```bash
# Installation des dépendances
npm ci

# Mode développement (watch files)
npm run dev

# Tests
npm test

# Linting
npm run lint
```

---

## 🔐 Sécurité du Pipeline

### ✅ Mesures implémentées

1. **Scan d'images Trivy**
   - Détecte les vulnérabilités critiques
   - Fail le pipeline si trouvé
   - Rapport au format table

2. **Cache GitHub Actions**
   - `cache-from: type=gha` (lecture du cache)
   - `cache-to: type=gha,mode=max` (écriture complète)
   - Réduction drastique des temps de build

3. **Non-root user en production**
   - `USER appuser` dans Dockerfile
   - Limite les risques si le conteneur est compromis

4. **Secrets management**
   - `GITHUB_TOKEN` utilisé pour auth (pas de token hardcodé)
   - Rotation automatique

5. **Healthchecks**
   - Compose: `service_healthy` pour db
   - Docker: Healthcheck interne sur port 3000

---

## 📊 Registry & Tags

Images publiées sur **GitHub Container Registry (GHCR)**:

```
ghcr.io/migou27/ci-cdseance3:sha-<commit-hash>
ghcr.io/migou27/ci-cdseance3:latest
```

**Tagging strategy:**
- Chaque commit = tag SHA unique (traçabilité)
- `latest` = dernier commit de main (référence stable)

---

## 🔍 Fichiers Clés

```
.
├── .github/workflows/ci.yml      ← Pipeline CI/CD
├── Dockerfile                     ← Build multi-stage production-ready
├── docker-compose.yml             ← Orchestration locale
├── docker-compose.prod.yml        ← Config production (optionnel)
├── nginx/
│   └── default.conf               ← Configuration reverse proxy
├── src/
│   ├── server.js                  ← Serveur principal
│   ├── db.js                      ← Connexion BD
│   └── routes/
│       └── tasks.js               ← Endpoints API
├── tests/                         ← Suites de test
├── package.json                   ← Dépendances & scripts
└── README.md                      ← Ce fichier
```

---

## 🎓 Apprentissages CI/CD

Ce projet démontre :

1. **Pipeline multi-stage** : Test avant build
2. **Dépendances entre jobs** : Build que si tests OK
3. **Conditionnels avancés** : Push uniquement sur main
4. **Optimisations Docker** : Build multi-stage + cache
5. **Sécurité en priorité** : Scan + user non-root + healthchecks
6. **Registry orchestration** : GHCR avec tagging intelligent
7. **Local-first workflow** : Docker Compose pour dev

---

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Trivy Security Scanner](https://github.com/aquasecurity/trivy)
- [Express.js Guide](https://expressjs.com/)

---

**Dernière mise à jour:** Avril 2026
