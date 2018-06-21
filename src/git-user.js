const { spawn } = require('child_process');

function runCommand(cmd, params) {
    return new Promise((resolve, reject) => {
        const command = spawn(cmd, params);
        let result = '';

        command.stdout.on('data', (data) => {
            result += data.toString();
        });

        command.on('close', function(exitCode) {
            if (exitCode === 0) {
                return resolve(result.split('\n')[0]);
            }

            return reject(new Error(`Command exited with: ${result}`));
        });
    });
}

module.exports = function getCurrentGitUser() {
    return new Promise(async (resolve, reject) => {
        try {
            const email = await runCommand('git', ['config', 'user.email'])
            const name = await runCommand('git', ['config', 'user.name']);

            resolve({ name, email });
        } catch (err) {
            reject(err);
        }
    });
}
