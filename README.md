
# Personal Fitness & AI Coach

A self-hosted personal fitness tracking and AI coaching application.

## Features

- **Daily Check-ins**: Log weight, body fat, and daily notes.
- **Food Logging**: Track calories, protein, carbs, and fats. Custom presets and "Complete Day" summary.
- **Workout Logging**: Log structured weight training (Templates A/B/C) or cardio sessions.
- **AI Coach**: Get personalized daily advice based on your logs and goals.
- **Data Management**: Export/Import data as CSV.
- **Dashboard**: Visual progress tracking with charts.

## Deployment on Synology NAS (Docker)

This guide assumes you have a Synology NAS (e.g., 920+) with Container Manager (Docker) installed.

### Prerequisites

1.  **Container Manager** installed on your Synology NAS.
2.  **SSH Access** enabled (optional but recommended for easier setup) OR use the Synology UI.

### Method 1: Using Docker Compose (Recommended)

1.  **Prepare the Folder**:
    *   Open File Station on your NAS.
    *   Create a folder named `fitness-tracker` in your `docker` shared folder.
    *   Upload the `docker-compose.yml` and `Dockerfile` (and the rest of the source code if building locally) to this folder.
    *   *Note*: Since this is a custom build, it's easier to build the image on your computer first and push it to a registry, or build it directly on the NAS if you have the tools.
    *   **Simpler Approach for NAS**:
        1.  Build the image on your computer: `docker build -t your-username/fitness-tracker:latest .`
        2.  Push to Docker Hub: `docker push your-username/fitness-tracker:latest`
        3.  Update `docker-compose.yml` on your NAS to use `image: your-username/fitness-tracker:latest` instead of `build: .`.

2.  **Deploy via Container Manager**:
    *   Open **Container Manager**.
    *   Go to **Project**.
    *   Click **Create**.
    *   Name: `fitness-tracker`.
    *   Path: Select the `/docker/fitness-tracker` folder you created.
    *   Source: Select "Create docker-compose.yml" and paste the content of the `docker-compose.yml` file (ensure you update the image name if you pushed to Docker Hub).
    *   **Environment Variables**: Make sure to set your `OPENROUTER_API_KEY` in the environment variables section or `.env` file.

3.  **Access the App**:
    *   Once running, access the app at `http://<YOUR_NAS_IP>:3000`.

### Method 2: Manual Build & Run (SSH)

1.  SSH into your Synology NAS.
2.  Navigate to the directory where you uploaded the files.
3.  Run `docker-compose up -d --build`.

## Next Idea Features

- [ ] **Mobile App Interface**: Optimize further for mobile PWA experience.
- [ ] **Barcode Scanner**: Integrate a barcode scanner for easier food logging.
- [ ] **Micro-cycle Planning**: AI Coach to suggest weight increases based on performance (Progressive Overload).
- [ ] **Social Features**: Share milestones with friends (optional).
- [ ] **Wearable Integration**: Sync data from Apple Health or Google Fit.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite (with Prisma ORM)
- **Styling**: Tailwind CSS
- **AI**: OpenRouter API
