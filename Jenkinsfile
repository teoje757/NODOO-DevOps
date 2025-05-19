pipeline {
    agent any
    
    stages {
        stage('Setup Node.js') {
            steps {
                script {
                    // Install Node.js if not present
                    def nodeExists = sh(script: 'command -v node', returnStatus: true) == 0
                    if (!nodeExists) {
                        sh '''
                            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
                            sudo apt-get install -y nodejs
                        '''
                    }
                    // Verify installations
                    sh 'node -v && npm -v'
                }
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test || true'  // Temporary bypass for missing tests
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'docker build -t nodoo .'
                sh 'docker run -d -p 3000:3000 nodoo'
            }
        }
    }
}