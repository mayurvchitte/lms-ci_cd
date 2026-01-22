pipeline {
    agent any

    tools {
        jdk 'java21'
        nodejs 'NodeJS'
    }

    environment {
        DOCKER_HUB_USER = 'mahesh1925'
        BACKEND_IMAGE  = 'mahesh1925/lms-backend'
        FRONTEND_IMAGE = 'mahesh1925/lms-frontend'
        COMPOSE_FILE   = 'docker-compose.yml'
    }

    stages {

        /* 1️⃣ Checkout Source Code */
        stage('Checkout Code') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/maheshpalakonda/lms-ci_cd.git',
                    credentialsId: 'github-pat'
            }
        }

        /* 2️⃣ Build Docker Images */
        stage('Build Docker Images') {
            steps {
                sh '''
                    echo "🏗️ Building Docker images..."
                    docker build -t ${BACKEND_IMAGE}:latest -f backend/Dockerfile.backend backend
                    docker build -t ${FRONTEND_IMAGE}:latest -f frontend/Dockerfile.frontend frontend
                '''
            }
        }

        /* 3️⃣ Push Images to Docker Hub */
        stage('Push to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        echo "🔑 Logging into Docker Hub..."
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

                        echo "⬆️ Pushing backend image..."
                        docker push ${BACKEND_IMAGE}:latest

                        echo "⬆️ Pushing frontend image..."
                        docker push ${FRONTEND_IMAGE}:latest

                        docker logout
                    '''
                }
            }
        }

        /* 4️⃣ Deploy Containers (OPTION 3 – NO sudo, NO env copy) */
        stage('Deploy Containers') {
            steps {
                withCredentials([
                    file(credentialsId: 'backend-env', variable: 'BACKEND_ENV'),
                    file(credentialsId: 'frontend-env', variable: 'FRONTEND_ENV')
                ]) {
                    sh '''
                        echo "🧩 Deploying containers using Docker Compose (Option 3)..."

                        # Export env file paths for docker-compose
                        export BACKEND_ENV=$BACKEND_ENV
                        export FRONTEND_ENV=$FRONTEND_ENV

                        echo "♻️ Stopping old containers..."
                        docker compose -f ${COMPOSE_FILE} down || true

                        echo "🚀 Starting new containers..."
                        docker compose -f ${COMPOSE_FILE} up -d --force-recreate --remove-orphans

                        echo "✅ Deployment completed successfully!"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD Pipeline completed successfully!"
            echo "Backend Image: ${BACKEND_IMAGE}:latest"
            echo "Frontend Image: ${FRONTEND_IMAGE}:latest"
        }
        failure {
            echo "❌ Pipeline failed. Check Jenkins logs."
        }
    }
}

