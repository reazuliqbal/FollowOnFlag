module.exports = {
  apps: [{
    name: 'followonflag',
    script: './app.js',
    watch: true,
    ignore_watch: ['node_modules', '*.db'],
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
      STEEM_ACCOUNT: 'YOUR_STEEM_USERNAME',
      WIF: 'POSTING_WIF',
    },
  }],
};
