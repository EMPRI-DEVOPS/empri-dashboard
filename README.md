# Privacy Self-Assessment Dashboard for DevOps Tools

## What is project about?

The EMPRI (Employee Privacy) Dashboard is intended to inform about privacy sensitivity of interaction metadata collected by collaborative DevOps software.
The dashboard is designed to support multiple data sources (DevOps tools) which are aggregated to provide a complete picture.
Various visualisations and statistics inform users about the density and sensitivity of their traces on those tools.

Our dashboard is design for self-assessment and will therefore only collect data for authenticated users.
It is _not_ intended for monitoring and assessing other users.

### Features

- Client-side only collection and processing of interaction data
- Various visualisations of temporal distributions of interactions
- Simulation of data minimisation effects for interaction timestamps

### DevOps Tool Support

Currently supported sources:

- GitHub

Planned further sources:

- Mattermost
- …

For information about how to contribute further source adapters see _Contributing_.

## Installation

### Requirements

- Node.js 
- Vue CLI 3
- Python 3

### Setup

Run in a Python virtual environment:
```
npm ci
pip install -r requirements.txt
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compile and minify for production
```
npm run build
```

## Contributing

We welcome contributions to this project.
We are especially looking forward to contributions of additional source adapters for further DevOps tools.
A contribution guide for such adapters will follow soon.

## Acknowledgement

This is based on the Bachelor thesis project by Daniel Panayi at University of Hamburg.
