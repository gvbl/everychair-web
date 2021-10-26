## Maintenance

heroku maintenance:on
heroku maintenance:off

# Environments

## Development

Add required secrets to .env file in root folder and client folder.
Launch with `npm run dev`
In dev environment two separate servers are run for the react client and express server. Endpoints served from the express server must be added to client/src/setupProxy.js. It's possible the root '/' path could replace this process.

The Stripe CLI can be used to forward web hooks with: `stripe listen -f http://localhost:3000/api/stripe/webhook`

## Production

- The engines properties "node" and "npm" in package.json should match the dev environment, found by running "node -v" and "npm -v" from the command line.
- Set the NPM_CONFIG_PRODUCTION environment variable to false, using heroku CLI this is `heroku config:set NPM_CONFIG_PRODUCTION=false`
