# Privacy Self-Assessment Dashboard for DevOps Tools

## What is this project about?

The EMPRI (Employee Privacy) Dashboard is intended to inform about the privacy sensitivity of interaction metadata collected by collaborative DevOps software.
The dashboard is designed to support multiple data sources (DevOps tools) which are combined to provide a complete picture.
Various visualisations and statistics inform users about the density, distribution and sensitivity of their traces on those tools.

Our dashboard is design for self-assessment and will therefore only collect data for authenticated users.
It is _not_ intended for monitoring and assessing other users.

_Note_: Please be aware that this is (still) an academic demonstrator with a lot of unfinished edges.


### Features

- Pure client-side collection and processing of interaction data
- Various visualisations of temporal distributions of interactions
- Simulation of data minimisation effects for interaction timestamps

### DevOps Tool Support

Currently supported sources:

- GitHub

Planned further sources:

- Mattermost
- … (open for contributions)

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

### Deployment

**Warning:** This has not been thoroughly tested. Please treat it with caution!

1. Install dependencies
    ```
    npm ci
    pip install -r requirements.txt
    ```
2. Create a `.env` file from the `.env.example` template
    1. Set the settings module to production
        ```
        DJANGO_SETTINGS_MODULE="dashboard_backend.settings.production"
        ```
    2. Set `SECRET_KEY`
3. Adapt allowed hosts under `dashboard_backend/settings/production.py`
4. Run `python manage.py migrate`
5. `npm run build`
6. Configure Django to be run via gunicorn
7. Configure the server to serve `/static` directly under `{url}/static`
8. Go through Django's [deployment checklist](https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/)

## Contributing

We welcome contributions to this project.
We are especially looking forward to contributions of additional source adapters for further DevOps tools.
A contribution guide for such adapters will follow soon.

## Acknowledgement

This is based on the Bachelor thesis project by Daniel Panayi at University of Hamburg.
