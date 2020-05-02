const request = require('request-promise-native');
const querystring = require('querystring');
const gitUser = require('./git-user');

const SLACK_ENDPOINT_POST_MESSAGE = 'https://slack.com/api/chat.postMessage';
const SLACK_ENDPOINT_USERS_LIST = 'https://slack.com/api/users.list';

class Slack {
    /**
     * Initialize Slack class.
     *
     * @param {string} token
     */
    constructor(token) {
        if (!token) {
            throw new Error('Slack integration requires token key.');
        }

        this._token = token;
        this._users = [];
    }

    /**
     * Send Slack message.
     * See https://api.slack.com/methods/chat.postMessage
     *
     * @param {object} message
     */
    send(message = {}) {
        return new Promise(async (resolve, reject) => {
            if (!message.text) {
                return reject(new Error('No message specififed.'));
            }

            if (!message.channel) {
                return reject(new Error('No channel specified.'));
            }

            const payload = this.getNormalizedPayload(message);
            const url = this.getUrlWithPayload(SLACK_ENDPOINT_POST_MESSAGE, payload);

            try {
                const result = await request.post({url, json: true});

                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Resolves current repository Git user if exists
     */
    getCurrentGitUser() {
        return new Promise((resolve, reject) => {
            gitUser()
                .then((user) => {
                    if (!(user.name || user.email)) {
                        return reject(new Error('Could not find git user.'));
                    }

                    resolve(user);
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * Returns a list of Slack workspace users.
     *
     * See https://api.slack.com/methods/users.list
     */
    getUsers() {
        return new Promise(async (resolve, reject) => {
            if (this._users.length > 0) {
                return resolve(this._users);
            }

            try {
                const payload = this.getNormalizedPayload();
                const url = this.getUrlWithPayload(SLACK_ENDPOINT_USERS_LIST, payload);

                const result = await request.get({url, json: true});

                if (!result.members || result.members.length === 0) {
                    return reject(new Error('No users found.'));
                }

                this._users = result.members;

                return resolve(this._users);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Find user by either email or name.
     *
     * @param {Object} searchProperties
     */
    findUser(searchProperties = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.getUsers();

                if (searchProperties.email) {
                    const match = this._users.find((user) => user.profile.email === searchProperties.email);

                    if (match) {
                        return resolve(match);
                    }
                }

                if (searchProperties.name) {
                    const match = this._users.find((user) => user.profile.real_name.toLowerCase() === searchProperties.name.toLowerCase());

                    if (match) {
                        return resolve(match);
                    }
                }

                reject(new Error('No user found.'));
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Returns URL for POST request.
     *
     * @param {string} endpoint
     * @param {object} payload
     */
    getUrlWithPayload(endpoint, payload = {}) {
        return `${endpoint}?${querystring.stringify(payload)}`;
    }

    /**
     * Returns payload with token attached to the object.
     *
     * @param {object} payload
     */
    getNormalizedPayload(payload = {}) {
        return Object.assign({}, payload, {
            token: this._token,
        });
    }
}

module.exports = Slack;
