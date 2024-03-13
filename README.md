# Middlesex University Mauritius Campus Assistant

The Middlesex University Mauritius Campus Assistant is an AI-powered chatbot designed to provide information and assistance to users regarding Middlesex University Mauritius Campus. It offers features such as providing information about international fees, available courses, specific locations on campus, and even allows users to take a virtual tour of the campus.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
  - [Step-by-Step Guide to Adding API Keys](#step-by-step-guide-to-adding-api-keys)
- [Usage](#usage)
- [Contributing](#contributing)


## Introduction

The Middlesex University Mauritius Campus Assistant is an AI-driven assistant that aims to provide users with quick and accurate information about various aspects of the Middlesex University Mauritius Campus. Whether users have questions about tuition fees, available courses, campus locations, or want to take a virtual tour, the assistant is there to help.

## Features

- **International Fees Information**: Users can inquire about international tuition fees for different programs offered at Middlesex University Mauritius Campus.
- **Available Courses**: Users can get a list of available courses at the university.
- **Location Information**: Users can ask about specific locations on campus and receive relevant information.
- **Virtual Campus Tour**: Users can take a virtual tour of the campus to explore its facilities and surroundings.
- **Voice Recognition**: The assistant supports voice input, allowing users to interact with it using speech.
- **Responsive Design**: The assistant's interface is designed to work seamlessly across different devices and screen sizes.

## Installation

To run the Middlesex University Mauritius Campus Assistant locally, follow these steps:

1. Clone the repository: `git clone <repository-url>`
2. Navigate to the project directory: `cd <project-directory>`
3. Install dependencies: `npm install`
4. Create a `.env` file in the root directory of the project:
   - On Windows, you can use the following command in the project directory to create the file: `echo > .env`
   - On Unix-based systems (Linux, macOS), you can use: `touch .env`
5. Open the `.env` file in a text editor and add your API keys:
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   OPENAI_API_KEY=your-openai-api-key
   Replace `your-google-maps-api-key` and `your-openai-api-key` with your actual API keys.
6. Save the `.env` file.
7. Start the server: `npm start`
8. Access the application in your browser at `http://localhost:3000`

### Step-by-Step Guide to Adding API Keys

1. **Create a Google Maps API Key**:
- Visit the [Google Cloud Console](https://console.cloud.google.com/).
- Create a new project or select an existing one.
- Enable the Maps JavaScript API for your project.
- Create an API key and restrict it to work only with your project's URL.

2. **Create an OpenAI API Key**:
- Sign up for an account on the [OpenAI website](https://openai.com/).
- Create a new API key in your account settings.
- Copy the generated API key.

## Usage

1. Open the application in your web browser.
2. Type your question or inquiry into the chat interface.
3. Alternatively, click the microphone icon and speak your question.
4. The assistant will respond with relevant information or instructions.

## Contributing

Contributions to the Middlesex University Mauritius Campus Assistant are welcome! If you'd like to contribute to the project, please follow these guidelines:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request detailing your changes.



