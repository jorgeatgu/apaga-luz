const client = require('@mailchimp/mailchimp_marketing');
client.setConfig({
  apiKey: '901dadc53e8b6541766f70eb5bceac3c-us20',
  server: 'us20',
});

const run = async() => {
  const response = await client.campaigns.setContent("6ced8c52dd", {
    template: {
      id : 10435808,
      sections: {
        table_content: "<h2>testing content</h2>"
      }
    }
  });
  console.log(response);
};
run();
