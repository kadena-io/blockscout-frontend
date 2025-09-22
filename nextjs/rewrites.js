const createHostname = (cid) => {
  // kadena-evm-$CHAIN.cloud.blockscout.com
  return process.env.BLOCKSCOUT_AUTOSCOUT_HOSTNAME.replace('CHAIN', cid);
};
const proxyToTestnet = (cid) => [
  {
    source: '/socket/:path*',
    destination: `https://${ createHostname(cid) }/socket/:path*`,
  },
  {
    source: '/stats-service/:path*',
    destination: `https://stats-kadena-evm-${ cid }.cloud.blockscout.com/:path*`,
    // https://stats-kadena-evm-20.cloud.blockscout.com/api/v1/pages/main
  },
  {
    source: '/visualizer/:path*',
    destination: `https://${ createHostname(cid) }/visualizer/:path*`,
  },
  {
    source: '/api/:path*',
    destination: `https://${ createHostname(cid) }/api/:path*`,
  },
];

async function rewrites() {
  return [
    { source: '/node-api/proxy/:slug*', destination: '/api/proxy' },
    { source: '/node-api/:slug*', destination: '/api/:slug*' },
    ...(process.env.NODE_ENV === 'development' ?
      proxyToTestnet(process.env.CHAINWEB_CHAIN_ID) :
      []),
  ].filter(Boolean);
}

module.exports = rewrites;
