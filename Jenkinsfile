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

        /* 1️⃣ Checkout Code */
        stage('Checkout Code') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/maheshpalakonda/LMS.git',
                    credentialsId: 'github-pat'
            }
        }

        /* 2️⃣ SonarQube Analysis */
        stage('Code Quality Scan - SonarQube') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_AUTH_TOKEN')]) {
                        sh '''
                            echo "🔍 Running SonarQube Analysis..."
                            sonar-scanner \
                                -Dsonar.projectKey=lms-pipeline \
                                -Dsonar.sources=./backend,./frontend \
                                -Dsonar.host.url=http://72.60.219.208:9000 \
                                -Dsonar.login=${SONAR_AUTH_TOKEN}
                        '''
                    }
                }
            }
        }

        /* 3️⃣ Build Docker Images */
        stage('Build Docker Images') {
            steps {
                sh '''
                    echo "🏗️ Building Docker images..."
                    docker build -t ${BACKEND_IMAGE}:latest -f Dockerfile.backend .
                    docker build -t ${FRONTEND_IMAGE}:latest -f frontend/Dockerfile.frontend frontend
                '''
            }
        }

        /* 4️⃣ Push to Docker Hub */
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
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

        /* 5️⃣ Deploy Containers */
        stage('Deploy Containers') {
            steps {
                withCredentials([
                    file(credentialsId: 'backend-env', variable: 'BACKEND_ENV'),
                    file(credentialsId: 'frontend-env', variable: 'FRONTEND_ENV')
                ]) {
                    sh '''
                        echo "🧩 Re-deploying containers..."
                        docker compose down || true
                        cp "$BACKEND_ENV" backend/.env
                        cp "$FRONTEND_ENV" frontend/.env
                        docker compose up -d --force-recreate --remove-orphans
                        echo "✅ Deployment completed!"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Build & deployment succeeded!"
            echo "Frontend: ${FRONTEND_IMAGE}:latest"
            echo "Backend: ${BACKEND_IMAGE}:latest"
        }
        failure {
            echo "❌ Build failed — check Jenkins logs."
        }
    }
}

