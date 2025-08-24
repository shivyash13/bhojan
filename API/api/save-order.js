// This is a file that runs on a secure back-end server, not in the browser.
// It is responsible for handling your private Sanity API token.

const sanityClient = require('@sanity/client');

// This is the Vercel-specific way to handle serverless functions.
// The `req` object contains the request from the front-end, and the `res` object
// is used to send a response back to the front-end.
module.exports = async (req, res) => {
  // It's crucial that we get the token from a secure environment variable.
  // We will set this up later on Vercel.
  const SANITY_WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN;

  // This is the Sanity client library. It's what allows us to interact with Sanity.
  const client = sanityClient({
      // The project ID and dataset are not secrets, so they are hardcoded.
      projectId: '1c72zgt0',
      dataset: 'production',
      // The token is the secret part; it must be passed here.
      token: SANITY_WRITE_TOKEN,
      // We set `useCdn` to `false` because we are writing data, not just reading it.
      useCdn: false
  });

  // We only want to handle POST requests from our front-end.
  // If someone tries to access this URL with a different method (like GET), we deny them.
  if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
  }

  try {
      // The data sent from the front-end (the order details) is in `req.body`.
      const orderData = req.body;

      // We create a "mutation," which is a command to Sanity to create a new document.
      // The `_type` is `order`, which is what you've likely set up in your Sanity studio.
      const mutations = [{ create: { _type: 'order', ...orderData } }];

      // We use the `client` to send the `mutations` to Sanity.
      const result = await client.mutate(mutations);

      // If everything works, we send a success message back to the front-end.
      res.status(200).json({ message: 'Order saved!', result });
  } catch (error) {
      // If something goes wrong, we log the error and send a failure message.
      console.error('Error saving order to Sanity:', error);
      res.status(500).json({ message: 'Failed to save order.' });
  }
};