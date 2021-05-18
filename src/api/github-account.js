import {
    Octokit
} from "@octokit/rest";
import {
    graphql
} from "@octokit/graphql";
import { DateTime } from "luxon";
import store from '../store/index';

export default class GithubAccount {
    username;
    timeZone;
    #userId;
    #repositoriesContributedTo = [];

    constructor(account) {
        this.username = account.username;
        this.timeZone = store.getters.timeZone;

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

    async *loadRepositoriesContributedTo() {
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
            if (!this.#userId) {
                this.#userId = response.user.id;
            }
            this.#repositoriesContributedTo.push(...repos);
            yield {
                totalCount,
                loadedCount
            };
        }
    }

    async *loadCommits(since, until) {
        const sinceDate = DateTime.fromISO(since).setZone(this.timeZone);
        const untilDate = DateTime.fromISO(until).setZone(this.timeZone);
        for (let i = 0; i < this.#repositoriesContributedTo.length; i++) {
            let repo = this.#repositoriesContributedTo[i];
            let foundCount = 0;
            for await (const repoCommitsPage of this.repoCommits(
                repo.owner.login,
                repo.name,
                sinceDate.toISO(),
                untilDate.toISO(),
            )) {
                store.commit('addUserInteractions', repoCommitsPage);
                foundCount += repoCommitsPage.length;
                yield {
                    foundCount, repo: repo.nameWithOwner
                }
                
            }
        }
    }

    /**
     * 
     * @param {*} owner 
     * @param {*} name 
     * @param {string} since 
     * @param {string} until
     * @returns 
     */
    async *repoCommits(owner, name, since, until) {
        let hasNextPage = true;
        let afterCursor = null;
        while (hasNextPage) {
            let response = await this.graphql(
                `
                query repoCommits($owner: String!, $name: String!, $userId: String!, $since: GitTimestamp!, $until: GitTimestamp!, $after: String) {
                    repository(owner: $owner, name:$name) {
                        name
                        defaultBranchRef {
                            target {
                                ... on Commit {
                                    history (after: $after, first: 100, author: {id: $userId}, since: $since, until: $until) {
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
                                            authoredDate
                                            pushedDate
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                `, {
                name,
                owner,
                userId: this.#userId,
                since,
                until,
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
            yield response.repository.defaultBranchRef.target.history.nodes.map((commit) => (Object.freeze({
                tool: 'Github',
                type: 'commit',
                timestamp: DateTime.fromISO(commit.committedDate).setZone(this.timeZone).toISO(),
                message: commit.message,
                repo: `${owner}/${name}`
            })));
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
}