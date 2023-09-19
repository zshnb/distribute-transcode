module.exports = {
  apps: [{
    name: 'scheduler',
    script: 'npm run scheduler',
  }, {
    name: 'splitter',
    script: 'npm run splitter',
  },
  {
    name: 'transcoder',
    script: 'npm run transcoder',
  },
  {
    name: 'concater',
    script: 'npm run concater',
  }],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
