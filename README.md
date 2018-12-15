# FollowOnFlag

Follow Steem Flag Rewards (SFR) approved flags and flag those abusive contents automatically. To know more about SFR join our [Discord](https://discord.gg/aXmdXRs).

## How to Setup

This bot is written in Node JS, so to run the bot you need to have (Node JS)(https://nodejs.org/en/) setup. If you do not know how to do that, please watch [this tutorial](https://www.youtube.com/watch?v=U8XF6AFGqlc) on YouTube. After setting up Node JS, please follow the steps below.

#### Step 1

Clone the repository if you have Git installed or [download](https://github.com/CodeBull/FollowOnFlag/archive/master.zip) the repository and extract on your server or computer.

Install PM2 (http://pm2.io/) globally by running following command on your terminal.

```npm install -g pm2```

PM2 is required to run the bot continuously after you close your terminal. There are other options available but I prefer PM2.

#### Step 2

Open `ecosystem.config.js` file on a text editor and replace `YOUR_STEEM_USERNAME` with your Steem username and `POSTING_WIF` with your private posting key.

Open `config.js` file and make changes according to your needs.

`MAX_SP` - Maximum amount of Steem Power of the abuser you want to flag. This should be a number.
`MIN_PAYOUT` - Minimum pending payout in STU. This should be a number too.
`FLAG_AT_100` - If set to `false`, the bot will flag right away, else will wait for 100% voting mana.
`DOWNVOTE_WEIGHT` - How much weight to use to downvote. Should be in float percentage and a negative number.

#### Step 3

Install bot's dependencies using npm. Run following command on the terminal and wait for it to finish.

```npm install```

#### Step 4

Start the bot using PM2 with the following command.

```pm2 start ecosystem.config.js --env production```

## Technologies

- dSteem (https://jnordberg.github.io/dsteem/)
- NeDB (https://github.com/louischatriot/nedb)

## Contributing

Clone the repo and make chnages you wish to make. If you find any bugs, please create an issue.
