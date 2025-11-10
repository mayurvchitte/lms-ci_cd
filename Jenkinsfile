pipeline {
    agent any

    tools {
        jdk 'java21'
        nodejs 'NodeJS'
    }

    environment {
        COMPOSE_FILE     = 'docker-compose.yml'
        DOCKER_HUB_USER  = 'mahesh1925'
        BACKEND_IMAGE    = 'mahesh1925/lms-backend'
        FRONTEND_IMAGE   = 'mahesh1925/lms-frontend'
    }

    stages {

        /* 1️⃣ Checkout the main LMS repository */
        stage('Checkout Code') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/maheshpalakonda/lms-ci_cd.git',
                    credentialsId: 'github-pat'
            }
        }

        /* 2️⃣ Build Docker images for backend & frontend */
        stage('Build Docker Images') {
            steps {
                sh '''
                    echo "🏗️ Building Docker images..."
                    docker build -t ${BACKEND_IMAGE}:latest -f backend/Dockerfile.backend backend
                    docker build -t ${FRONTEND_IMAGE}:latest -f frontend/Dockerfile.frontend frontend
                '''
            }
        }

        /* 3️⃣ Push images to Docker Hub */
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "🔑 Logging into Docker Hub..."
                        echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
                        docker push ${BACKEND_IMAGE}:latest
                        docker push ${FRONTEND_IMAGE}:latest
                        docker logout
                    '''
                }
            }
        }

        /* 4️⃣ Deploy to Hostinger VM using Docker Compose */
        stage('Deploy Containers') {
            steps {
                withCredentials([
                    file(credentialsId: 'backend-env', variable: 'BACKEND_ENV'),
                    file(credentialsId: 'frontend-env', variable: 'FRONTEND_ENV')
                ]) {
                    sh '''
                        echo "🧩 Deploying containers..."

                        # Ensure the workspace & env files are writable
                        mkdir -p /app/lms || sudo mkdir -p /app/lms

                        # Copy environment files with safe fallback
                        cp $BACKEND_ENV backend/.env 2>/dev/null || sudo cp $BACKEND_ENV backend/.env
                        cp $FRONTEND_ENV frontend/.env 2>/dev/null || sudo cp $FRONTEND_ENV frontend/.env

                        echo "♻️ Restarting containers via Docker Compose..."
                        docker compose -f ${COMPOSE_FILE} down || true
                        docker compose -f ${COMPOSE_FILE} up -d --force-recreate --remove-orphans

                        echo "✅ Deployment completed successfully!"
                    '''
                }
            }
        }
    }

    /* 🪶 Post-build notifications */
    post {
        success {
            echo "✅ Build & Deployment Successful!"
            echo "Frontend → ${FRONTEND_IMAGE}:latest"
            echo "Backend  → ${BACKEND_IMAGE}:latest"
        }
        failure {
            echo "❌ Build Failed — Check Jenkins Logs."
        }
    }
}

