import {
    Octokit
} from "@octokit/rest";

class GithubAccount {
    constructor(account) {
        this.username = account.username;

        const accessToken = account.credentials.access_token;

        this.octokit = new Octokit({
            auth: accessToken,
            userAgent: 'PSAD',
        });
    }

    async commits(repo) {
        let response = await this.restClient(`repos/${this.username}/${repo}/commits`);
        console.log(response.headers);

        console.log(response.data);
        return response.data;
    }

    async pullRepos() {
        const repoNames = await this.octokit.paginate(
            "GET /users/{username}/repos", {
                username: this.username
            },
            (response) => response.data.map((repo) => repo.name)
        );

        this.repos = {};
        repoNames.forEach(async (repoName) => {
            this.repos[repoName] = {
                commits: await this.octokit.paginate(
                    "GET /repos/{owner}/{repo}/commits", {
                        owner: this.username,
                        repo: repoName
                    }
                ),
                issues: await this.octokit.paginate(
                    "GET /repos/{owner}/{repo}/issues", {
                        owner: this.username,
                        repo: repoName
                    }
                ),
            }
        });
    }

    getRepos() {
        return this.repos
    }

    async *getEvents() {
        this.octokit.hook.error("request", async (error) => {
            if (error.status === 404) {
                throw `User ${this.username} not found!`;
            }

            throw error;
        });

        for await (const response of this.octokit.paginate.iterator(
            "GET /users/{username}/events", {
                username: this.username,
                per_page: 50
            })) {
            //console.log(response.headers);
            yield response.data.map((event) => {
                return {
                    id: event.id,
                    type: event.type,
                    timestamp: event.created_at
                }
            })
        }
    }

    async pullData() {



        //"Search text is required when searching commits. Searches that use qualifiers only are not allowed. Were you searching for something else?
        /*
        const searchCommits = await this.octokit.paginate(
            "GET /search/commits", {
                q: `user:${this.username}`,
                mediaType: {
                    previews: ['cloak']
                }
            }
        );
        */

        const events = await this.octokit
            .paginate("GET /users/{username}/events", {
                    username: this.username,
                    per_page: 50
                },
                (response) => response.data.map((event) => {
                    return {
                        id: event.id,
                        type: event.type,
                        timestamp: event.created_at
                    }
                }));

        return events;


        /*
        this.commits = await Promise.all(this.repos.map(async (repo) => {
            return await this.commits(repo.name);
        }));

        console.log(this.commits);
        return;
        */
    }
}

export {
    GithubAccount
}