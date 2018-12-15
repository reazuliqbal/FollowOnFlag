const Datastore = require('nedb');
const {
  Asset,
  Client,
  PrivateKey,
  getVestingSharePrice,
  getVests,
} = require('dsteem');
const {
  CATEGORIES,
  DOWNVOTE_WEIGHT,
  FLAG_AT_100,
  MAX_SP,
  MIN_PAYOUT,
  NODES,
} = require('./config');

let RPC_NODE = NODES ? NODES[0] : 'https://api.steemit.com';
let client = new Client(RPC_NODE, { timeout: 100 * 1000 });

// Initializing and loasind database
const db = new Datastore({ filename: 'database.db', autoload: true });

// Getting steem username and WIF from node environment
const { STEEM_ACCOUNT, WIF } = process.env;

// Node switching helper function
const failover = () => {
  try {
    if (NODES && NODES.length > 1) {
      let index = NODES.indexOf(RPC_NODE) + 1;

      if (index === NODES.length) index = 0;

      RPC_NODE = NODES[index];

      client = new Client(RPC_NODE, { timeout: 100 * 1000 });

      console.log(`RPC node has been changed to ${RPC_NODE}`);
    }
  } catch (e) {
    console.log(e);
  }
};

// Broadcasting downvote and commenting under SFR comment
const sendDownvote = async (content) => {
  const commentPermlink = `re-${content.author.replace(/\./g, '')}-${content.permlink.replace(/(-\d{8}t\d{9}z)/g, '')}-${new Date().toISOString().replace(/[^a-zA-Z0-9]+/g, '').toLowerCase()}`;

  const ops = [
    ['vote', {
      voter: STEEM_ACCOUNT,
      author: content.root_author,
      permlink: content.root_permlink,
      weight: DOWNVOTE_WEIGHT,
    }],
    ['comment', {
      parent_author: content.author,
      parent_permlink: content.permlink,
      author: STEEM_ACCOUNT,
      permlink: commentPermlink,
      title: '',
      body: `Follow on flag for ${content.category} @steemflagrewards.`,
      json_metadata: JSON.stringify({ app: 'followonflag/0.1' }),
    }],
  ];

  client.broadcast.sendOperations(ops, PrivateKey.from(WIF))
    .then(() => {
      console.log(`@${STEEM_ACCOUNT} downvoted @${content.root_author}/${content.root_permlink}`);

      db.remove({
        root_author: content.root_author,
        root_permlink: content.root_permlink,
      });
    })
    .catch((e) => {
      console.log(e.message);
    });
};

// Looping function
const downVote = async () => {
  const account = await client.rc.getVPMana(STEEM_ACCOUNT);

  if (account.percentage >= 10000) {
    db.find({}).limit(1).exec(async (err, [content]) => {
      if (content) {
        const root = await client.database.call('get_content', [content.root_author, content.root_permlink]);

        if ((Asset.fromString(root.pending_payout_value)).amount > MIN_PAYOUT
        && !root.active_votes.some(v => v.voter === STEEM_ACCOUNT)
        ) {
          // Post has pending payout more than MIN_PAYOUT and was not flagged by the account
          await sendDownvote(content);
        } else {
          // Post was flagged or has pending payout less than MIN_PAYOUT
          db.remove({
            root_author: content.root_author,
            root_permlink: content.root_permlink,
          });
        }
      }
    });
  }
};

(async () => {
  // If Steem username and/or WIF was not set throwing error.
  if (!STEEM_ACCOUNT || !WIF) {
    throw new Error('Steem username and WIF is required');
  }

  try {
  // Loading blockchain's dynamic global properties
    const globalProps = await client.database.getDynamicGlobalProperties();

    // Calculating VESTS from MAX SP to flag
    const maxVests = getVestingSharePrice(globalProps).convert({ amount: MAX_SP, symbol: 'STEEM' });

    const stream = await client.blockchain.getOperationsStream({ from: 28547665, to: 28547680 });

    stream.on('data', async (chunk) => {
      const op = chunk.op[0];
      const data = chunk.op[1];

      if (op === 'comment' && data.parent_author !== '') {
        const { author, permlink, body } = data;

        const sfrText = 'Steem Flag Rewards mention comment has been approved';

        // Checking if the author is SFR and approval text is present
        if (author === 'steemflagrewards' && (new RegExp(sfrText)).test(body)) {
          const content = await client.database.call('get_content', [author, permlink]);

          // Finding flag category
          const category = CATEGORIES.filter(c => new RegExp(c, 'i').test(content.body));

          // If the flagged content was a root post
          if (content.depth === 2) {
            const root = await client.database.call('get_content', [content.root_author, content.root_permlink]);
            const [abuser] = await client.database.getAccounts([content.root_author]);

            const pendingPayout = Asset.fromString(root.pending_payout_value);

            if (
            // If above min payout set in config
              pendingPayout.amount >= MIN_PAYOUT

            // If SP is below specified SP in config
            && getVests(abuser) <= maxVests.amount

            // Checkes if already downvoted
            && !root.active_votes.some(v => v.voter === STEEM_ACCOUNT)
            ) {
              if (FLAG_AT_100) {
                // Saving to databsse for flagging at 100% VM
                db.insert({
                  author,
                  permlink,
                  root_author: content.root_author,
                  root_permlink: content.root_permlink,
                  category: category[0],
                });
              } else {
              // Downvoting right away
                await sendDownvote({
                  author,
                  permlink,
                  root_author: content.root_author,
                  root_permlink: content.root_permlink,
                  category: category[0],
                });
              }
            }
          }
        }
      }
    });

    stream.on('error', (error) => {
      console.log(error);
      failover();
    });
  } catch (e) {
    console.log(e);
    failover();
  }

  if (FLAG_AT_100) {
    setInterval(downVote, 5 * 60 * 1000);
  }
})();
