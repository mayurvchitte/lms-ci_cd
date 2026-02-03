pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    environment {
        COMPOSE_FILE   = 'docker-compose.yml'
        BACKEND_IMAGE  = 'mahesh1925/lms-backend'
        FRONTEND_IMAGE = 'mahesh1925/lms-frontend'
    }

    stages {

        // =========================
        // 1️⃣ Checkout Source Code
        // =========================
        stage('Checkout') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/maheshpalakonda/lms-ci_cd.git',
                    credentialsId: 'github-pat'
            }
        }

        // =========================
        // 2️⃣ Build Docker Images
        // =========================
        stage('Build Images') {
            steps {
                withCredentials([
                    file(credentialsId: 'frontend-env', variable: 'FRONTEND_ENV')
                ]) {
                    sh '''
                        set -e

                        echo "🏗️ Building backend image..."
                        docker build \
                          -t ${BACKEND_IMAGE}:latest \
                          -f backend/Dockerfile.backend backend

                        echo "==============================="
                        echo "🔍 DEBUG FRONTEND ENV FILE"
                        echo "==============================="
                        cat "$FRONTEND_ENV"
                        echo "==============================="

                        echo "📥 Loading frontend env vars..."
                        export VITE_GOOGLE_CLIENT_ID=$(grep '^VITE_GOOGLE_CLIENT_ID=' "$FRONTEND_ENV" | cut -d= -f2-)
                        export VITE_FIREBASE_APIKEY=$(grep '^VITE_FIREBASE_APIKEY=' "$FRONTEND_ENV" | cut -d= -f2-)
                        export VITE_API_URL=$(grep '^VITE_API_URL=' "$FRONTEND_ENV" | cut -d= -f2-)

                        echo "🏗️ Building frontend image (Buildx, no cache)..."
                        docker buildx build --no-cache \
                          --build-arg VITE_GOOGLE_CLIENT_ID="$VITE_GOOGLE_CLIENT_ID" \
                          --build-arg VITE_FIREBASE_APIKEY="$VITE_FIREBASE_APIKEY" \
                          --build-arg VITE_API_URL="$VITE_API_URL" \
                          -t ${FRONTEND_IMAGE}:latest \
                          -f frontend/Dockerfile.frontend \
                          frontend
                    '''
                }
            }
        }

        // =========================
        // 3️⃣ Push Images to Docker Hub
        // =========================
        stage('Push Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        set -e

                        echo "🔐 Logging into Docker Hub..."
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                        docker push ${BACKEND_IMAGE}:latest
                        docker push ${FRONTEND_IMAGE}:latest

                        docker logout
                    '''
                }
            }
        }

        // =========================
        // 4️⃣ Deploy Containers
        // =========================
        stage('Deploy') {
            steps {
                withCredentials([
                    file(credentialsId: 'backend-env', variable: 'BACKEND_ENV'),
                    file(credentialsId: 'frontend-env', variable: 'FRONTEND_ENV')
                ]) {
                    sh '''
                        set -e

                        echo "🚀 Deploying containers using Jenkins secret env files..."

                        export BACKEND_ENV="$BACKEND_ENV"
                        export FRONTEND_ENV="$FRONTEND_ENV"

                        docker compose down || true
                        docker compose up -d --force-recreate --remove-orphans

                        echo "✅ Deployment completed successfully"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD Pipeline completed successfully!"
        }
        failure {
            echo "❌ CI/CD Pipeline failed — check logs above."
        }
    }
}

