---
description: How to deploy the application to Netlify
---

# Deploy to Netlify

This guide explains how to deploy the React application to Netlify using the Netlify CLI.

## Prerequisites

- **Netlify Account**: Sign up at [netlify.com](https://www.netlify.com/).
- **Netlify CLI**: Install globally using `npm install -g netlify-cli`.

## Deployment Steps

1.  **Login to Netlify CLI**
    Run the following command and follow the browser prompts to authenticate:
    ```bash
    netlify login
    ```

2.  **Initialize Site (First Time Only)**
    Link your local folder to a new Netlify site:
    ```bash
    netlify init
    ```
    - Choose "Create & configure a new site".
    - Select your team.
    - Choose a site name (optional).
    - **Build Command**: `npm run build`
    - **Directory to deploy**: `dist`
    - **Netlify functions folder**: (Leave blank / default)

3.  **Deploy to Production**
    Run the deployment command:
    ```bash
    netlify deploy --prod
    ```
    - **Publish directory**: `dist` (Press Enter to confirm default)

## Alternative: Git Deployment

1.  Push your code to GitHub/GitLab/Bitbucket.
2.  Log in to the Netlify Dashboard.
3.  Click "Add new site" > "Import an existing project".
4.  Connect your Git provider and select the repository.
5.  Netlify will detect the `netlify.toml` file and configure the build settings automatically.
6.  Click "Deploy site".
