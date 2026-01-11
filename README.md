# GitHub Readme Widget

A high-performance, customizable, and secure Next.js widget to display your GitHub stats, streaks, and top languages dynamically on your profile.

![Demo](https://gh-widget.vercel.app/api/widget?user=rushikeshg25&theme=dark)

## Quick Setup

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/gh-readme-widgets.git
cd gh-readme-widgets
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:

```bash
# Your GitHub Personal Access Token (PAT)
# Generate here: https://github.com/settings/tokens (Scopes: read:user, repo)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxx

# Your GitHub Username (Security restriction)
GITHUB_USERNAME=your_github_username
```

### 3. Run Locally
```bash
npm run dev
# Visit http://localhost:3000/api/widget?user=your_github_username&theme=dark
```

## Deployment (Vercel)

1.  Push this repository to your GitHub.
2.  Import the project into [Vercel](https://vercel.com/new).
3.  Add the **Environment Variables** (`GITHUB_TOKEN`, `GITHUB_USERNAME`) in the Vercel Project Settings.
4.  Deploy!

## Usage in GitHub Profile

Once deployed, add the following Markdown to your `README.md`:

```markdown
![My Stats](https://<your-vercel-domain>/api/widget?user=<your-username>&theme=dark)
```

### Options
| Parameter | Default | Description |
| :--- | :--- | :--- |
| `user` | Required | Your GitHub username (must verify against `GITHUB_USERNAME` env) |
| `theme` | `dark` | `dark` or `light` |


