import store from './store/index';


export const githubEventTypes = [
    { name: 'Commits', type: 'commit' }, { name: 'Issues', type: 'issue' }, { name: 'Pull Requests', type: 'pullRequest' }, { name: 'Issue Comments', type: 'issueComment' }
];

export const colors = [
    '#025557', '#36AFB3', '#DB793B', '#632905', '#67898A'
];

export const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export const accountTypes = [
    {
        id: 1,
        name: "Taiga",
    },
    {
        id: 2,
        name: "Github",
    },
    {
        id: 3,
        name: "Mattermost",
    },
];

export const eventTypeColor = (type) => {
    const eventTypesFound = store.getters["assessment/events/types"];
    return colors[eventTypesFound.findIndex((eventType) => eventType === type)]
};
