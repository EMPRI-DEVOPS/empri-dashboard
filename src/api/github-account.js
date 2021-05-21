import {
    Octokit
} from "@octokit/rest";
import {
    graphql
} from "@octokit/graphql";
import { DateTime, Interval } from "luxon";
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


    async *userIssues(from, to) {
        let totalCount = 1;

        let loadedCount = 0;
        let endCursor = "";

        const since = DateTime.fromISO(from).toISO();
        const interval = Interval.fromDateTimes(
            DateTime.fromISO(from, { zone: this.timeZone }),
            DateTime.fromISO(to, { zone: this.timeZone })
        );
        while (loadedCount < totalCount) {
            let response = await this.graphql(
                `
                query userIssues($username: String!, $afterCursor: String="", $since: GitTimestamp!) {
                    user(login: $username) {
                        issues(first:100, after: $afterCursor, filterBy: {since: $since, createdBy: $username}) {
                            totalCount
                            pageInfo {
                                endCursor
                            }
                            nodes {
                                author {
                                    login
                                }
                                title
                                createdAt
                                lastEditedAt
                                publishedAt
                                repository {
                                    nameWithOwner
                                }
                            }
                        }
                    }
                }
                `, {
                username: this.username,
                afterCursor: endCursor ? endCursor : null,
                since
            }
            );
            totalCount = response.user.issues.totalCount;
            endCursor = response.user.issues.pageInfo.endCursor;
            let issues = response.user.issues.nodes;
            let issueObjects = issues
                .filter((issue) =>
                    interval.contains(DateTime.fromISO(issue.publishedAt, { zone: this.timeZone }))
                )
                .map((issue) => (Object.freeze({
                    tool: 'Github',
                    type: 'issue',
                    timestamp: DateTime.fromISO(issue.publishedAt, { zone: this.timeZone }).toISO(),
                    title: issue.title,
                    repo: issue.repository.nameWithOwner
                })));
            store.commit('addUserInteractions', issueObjects);
            loadedCount += issues.length;
            yield {
                totalCount,
                loadedCount
            };
        }
    }

    async *issueComments(from, to) {
        let totalCount = 1;

        let loadedCount = 0;
        let endCursor = "";

        const since = DateTime.fromISO(from).toISO();
        const interval = Interval.fromDateTimes(
            DateTime.fromISO(from, { zone: this.timeZone }),
            DateTime.fromISO(to, { zone: this.timeZone })
        );
        while (loadedCount < totalCount) {
            let response = await this.graphql(
                `
                query userIssues($username: String!, $afterCursor: String="") {
                    user(login: $username) {
                        issueComments(first:100, after: $afterCursor) {
                            totalCount
                            pageInfo {
                                endCursor
                            }
                            nodes {
                                author {
                                    login
                                }
                                publishedAt
                                repository {
                                    nameWithOwner
                                }
                            }
                        }
                    }
                }
                `, {
                username: this.username,
                afterCursor: endCursor ? endCursor : null,
                since
            }
            );
            totalCount = response.user.issueComments.totalCount;
            endCursor = response.user.issueComments.pageInfo.endCursor;
            let issueComments = response.user.issueComments.nodes;
            let issueCommentObjects = issueComments
                .filter((issue) =>
                    interval.contains(DateTime.fromISO(issue.publishedAt, { zone: this.timeZone }))
                )
                .map((issue) => (Object.freeze({
                    tool: 'Github',
                    type: 'issueComment',
                    timestamp: DateTime.fromISO(issue.publishedAt, { zone: this.timeZone }).toISO(),
                    title: issue.title,
                    repo: issue.repository.nameWithOwner
                })));
            console.log(issueCommentObjects);
            store.commit('addUserInteractions', issueCommentObjects);
            loadedCount += issueComments.length;
            yield {
                totalCount,
                loadedCount
            };
        }
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
                timestamp: DateTime.fromISO(commit.committedDate, { zone: this.timeZone }).toISO(),
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