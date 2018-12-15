module.exports = {
  MAX_SP: 3000, // In SP and must be a number
  MIN_PAYOUT: 0.03, // In STU and must be a number
  FLAG_AT_100: true,
  DOWNVOTE_WEIGHT: -10000, // Desired downvoting percentage * 100 and must be a negative value
  // Taken from https://github.com/anthonyadavisii/steemflagrewards/blob/1b008e81122ca4f03b1096b5f708036b9671e376/sfr_config.py#L26
  CATEGORIES: [
    'bid bot abuse',
    'collusive voting',
    'comment self-vote violation',
    'comment spam',
    'copy/paste',
    'failure to tag nsfw',
    'identity theft',
    'manipulation',
    'phishing',
    'plagiarism',
    'scam',
    'spam',
    'tag abuse',
    'tag misuse',
    'testing for rewards',
    'threat',
    'vote abuse',
    'vote farming',
  ],
  NODES: [
    'https://api.steemit.com',
    'https://rpc.buildteam.io',
    'https://api-int.steemit.com',
  ],
};
