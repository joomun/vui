# Middlesex University Mauritius Campus Assistant

The Middlesex University Mauritius Campus Assistant is an AI-powered chatbot designed to provide information and assistance to users regarding Middlesex University Mauritius Campus. It offers features such as voice-controlled navigation, appointment scheduling, course and fee inquiries, and a virtual campus tour.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
  - [Step-by-Step Guide to Adding API Keys](#step-by-step-guide-to-adding-api-keys)
- [Usage](#usage)
- [Contributing](#contributing)

## Introduction

The Middlesex University Mauritius Campus Assistant is an innovative AI-driven tool that serves as a virtual guide and helper for students and visitors of the Middlesex University Mauritius Campus. Through voice commands, users can easily navigate campus services, find course information, and much more.

## Features

- **Voice-Controlled Navigation**: Get directions to various locations on campus using simple voice commands.
- **Appointment Scheduling**: Book appointments with academic and administrative staff via an integrated calendar system.
- **Course and Fees Information**: Access up-to-date information about courses, including tuition fees and other related costs.
- **Virtual Campus Tour**: Explore the campus virtually with a guided tour, accessible through the assistant.
- **Integrated APIs**: Utilizes Google Maps for navigation, Google Calendar for scheduling, and OpenAI for dynamic responses to queries.

## Installation

To get the Middlesex University Mauritius Campus Assistant up and running locally, follow these instructions:

1. Clone the repository: `git clone <repository-url>`
2. Navigate to the project directory: `cd <project-directory>`
3. Install dependencies: `npm install`
4. Set up your environment variables by creating a `.env` file in the project's root directory and adding your API keys:

GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GOOGLE_CALENDAR_API_KEY=your-google-calendar-api-key
OPENAI_API_KEY=your-openai-api-key
Replace placeholders with your actual API keys.
5. Start the server: `node server.js`
6. Access the assistant in your browser at `http://localhost:3000`

### Step-by-Step Guide to Adding API Keys

1. **Google Maps API Key**:
- Go to the [Google Cloud Console](https://console.cloud.google.com/).
- Create or select a project.
- Enable Maps JavaScript API and create an API key.
- Restrict the API key to your application URLs.

2. **Google Calendar API Key**:
- Follow similar steps to enable the Google Calendar API for your project and generate an API key.

3. **OpenAI API Key**:
- Register at [OpenAI](https://openai.com/).
- Follow the process to obtain an API key for API access.

## Usage

- Open the web interface in a browser.
- Use the microphone icon to start voice interaction or type queries directly into the chat interface.
- Follow prompts and interact with the assistant as needed.

## Contributing

Contributions are welcome to enhance the features and functionality of the Middlesex University Mauritius Campus Assistant:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -am 'Add some feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Create a new Pull Request with a description of your changes.
