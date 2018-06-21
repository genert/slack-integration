# Slack integration for NodeJS

Package for sending slack messages and retrieving Git repository's user info.

> This package is not compiled to ES5 and therefore requires Promise, and async/await support.

## Installation
```
npm i slack-integration
```

## Setup
**Do not share Slack token in public code repositories.**

Generate legacy API token here for your Slack team: https://api.slack.com/custom-integrations/legacy-tokens

Then initialize this package's exported class with generated token as first argument:
```javascript
import Slack from 'slack-integration';

const token = 'XXXXXX';
const slackIntegration = new Slack(token);
```

Once initialized, you can access following methods:

### send(message: Object): Promise
This methods allows you send a message in your Slack workspace.

See https://api.slack.com/methods/chat.postMessage for arguments and result response.

Example:
```javascript
slackIntegration.send({
    channel: 'channel id here',
    as_user: false,
    username: 'Your Slack',
    text: 'Hello, its me!',
})
    .then((result) => console.log(result))
    .catch((err) => console.error(err));
```

### getCurrentGitUser(): Promise
This methods returns Promise, when resolved, an object with keys: "name", and "email" are returned.

On error, it will be rejected.

It runs following commands in the working directory:
```bash
git config user.name
git config user.email
```

Example:
```javascript
slackIntegration.getCurrentGitUser()
    .then((result) => console.log(result)) // { name: 'Git user name', email: 'Git user email' }
    .catch((err) => console.error(err));
```

### getUsers(): Promise
This methods returns a list of found users in your Slack workspace.

See https://api.slack.com/methods/users.list for more information on response.

Example:
```javascript
slackIntegration.getUsers()
    .then((result) => console.log(result))
    .catch((err) => console.error(err));
```

### findUser(properties: Object): Promise
You can search your Slack workspack users by following properties object:
```json
{
    "email": "search-this-email@email.com",
    "name": "or find this user with such name"
}
```

It tries to search by both, whatever it finds first, will be user that will be resolved.

Example:
```javascript
slackIntegration.findUser({
    email: 'some-slace-workspace-user@email.com',
})
    .then((result) => console.log(result))
    .catch((err) => console.error(err));
```

## Contributions & Issues
Contributions are welcome. Please clearly explain the purpose of the PR and follow the current style.

Issues can be resolved quickest if they are descriptive and include both a reduced test case and a set of steps to reproduce.

## Licence
The `slack-integration` library is copyright © [Genert Org](http://genert.org) and licensed for use under the MIT License (MIT).

Please see [MIT License](LICENSE) for more information.