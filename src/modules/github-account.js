import {
    Octokit
} from "@octokit/rest";
import {
    graphql
} from "@octokit/graphql";

class GithubAccount {
    constructor(account) {
        this.username = account.username;

        const accessToken = account.credentials.access_token;

        this.rest = new Octokit({
            auth: accessToken,
            userAgent: 'PSAD',
        });

        this.graphql = graphql.defaults({
            headers: {
                authorization: `Bearer ${accessToken}`
            }
        });

    }

    async commits(repo) {
        let response = await this.restClient(`repos/${this.username}/${repo}/commits`);
        console.log(response.headers);

        console.log(response.data);
        return response.data;
    }

    async pullRepos() {
        const repoNames = await this.rest.paginate(
            "GET /users/{username}/repos", {
                username: this.username
            },
            (response) => response.data.map((repo) => repo.name)
        );

        this.repos = {};
        repoNames.forEach(async (repoName) => {
            this.repos[repoName] = {
                commits: await this.rest.paginate(
                    "GET /repos/{owner}/{repo}/commits", {
                        owner: this.username,
                        repo: repoName
                    }
                ),
                issues: await this.rest.paginate(
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

    async getUserId() {

    }

    async *repositoriesContributedTo() {
        let totalCount = 1;

        let loadedCount = 0;
        let endCursor = "";

        while (loadedCount < totalCount) {
            let response = await this.graphql(
                `
                query contribRepos($username: String!, $afterCursor: String="") {
                    user(login: $username) {
                        id
                        repositoriesContributedTo(includeUserRepositories: true, first:100, after: $afterCursor) {
                            totalCount
                            pageInfo {
                                endCursor
                            }
                            nodes {
                                name
                                nameWithOwner
                                owner {
                                    login
                                }
                            }
                        }
                    }
                }
                `, {
                    username: this.username,
                    afterCursor: endCursor ? endCursor : null
                }
            );
            totalCount = response.user.repositoriesContributedTo.totalCount;
            endCursor = response.user.repositoriesContributedTo.pageInfo.endCursor;
            let repos = response.user.repositoriesContributedTo.nodes;
            loadedCount += repos.length;
            yield {
                userId: response.user.id,
                totalCount: totalCount,
                repos: repos
            };
        }
    }

    /**
     * 
     * @param {*} owner 
     * @param {*} name 
     * @param {*} userId 
     * @param {Date} since 
     * @returns 
     */
    async *repoCommits(owner, name, userId, since) {
        let hasNextPage = true;
        let afterCursor = null;
        while (hasNextPage) {
            let response = await this.graphql(
                `
                query repoCommits($owner: String!, $name: String!, $userId: String!, $since: GitTimestamp!, $after: String) {
                    repository(owner: $owner, name:$name) {
                        name
                        defaultBranchRef {
                            target {
                                ... on Commit {
                                    history (after: $after, first: 100, author: {id: $userId}, since: $since) {
                                        totalCount
                                        pageInfo {
                                            endCursor
                                            hasNextPage
                                        }
                                        nodes {
                                            author {
                                                name
                                                email
                                                user {
                                                    login
                                                }
                                            }
                                            message
                                            committedDate
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                `, {
                    name: name,
                    owner: owner,
                    userId: userId,
                    since: since.toISOString(),
                    after: afterCursor
                }
            );
            if (!response.repository.defaultBranchRef) {
                hasNextPage = false;
                yield [];
                break;
            }
            hasNextPage = response.repository.defaultBranchRef.target.history.pageInfo.hasNextPage;
            afterCursor = response.repository.defaultBranchRef.target.history.pageInfo.endCursor;
            yield response.repository.defaultBranchRef.target.history.nodes.map((commit) => ({
                timestamp: commit.committedDate,
                message: commit.message,
                repo: `${owner}/${name}`
            }));
        }
    }

    async *getEvents() {
        this.rest.hook.error("request", async (error) => {
            if (error.status === 404) {
                throw `User ${this.username} not found!`;
            }

            throw error;
        });

        for await (const response of this.rest.paginate.iterator(
            "GET /users/{username}/events", {
                username: this.username,
                per_page: 50
            })) {
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

        const events = await this.rest
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
    }
}

export {
    GithubAccount
}