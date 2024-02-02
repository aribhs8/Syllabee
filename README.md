# Syllabee
A web app created using React, AWS, SQL and Python. The application uses React for the frontend and uses AWS lambda functions to handle requests to the SQL database. Code for the lambda functions are written in Python and are attached to a REST API gateway. The SQL database is hosted using an AWS RDS instance with Postgres.

## 🤔 Motivation
In today's world, creating a business or a _side-hustle_ is easier than ever. Due to innovations such as ecommerce, crowdfunding and social media platforms, the ability for people to pitch an idea to a large audience is greater than ever before. However, according to the Small Business Administration, around 90% of startups fail. This can be due to a variety of factors, such as the quality of the idea or the nature of the market, but undoubtedly one of the big reasons startups fail is because of a lack of planning from novice entrepreneurs. Syllabee is a platform that aims to improve project management and brainstorming using AI technologies. It is aimed towards University students and young entrpreneurs who require assistance getting organized on new projects or keeping up work assigned to them by others.

### 🏁 Goal
The goal of Syllabee is to first extract tasks from documentation, and then provide suggestions to help users complete and breakdown those tasks. A user can create a project and upload some basic information about what they want the project to do. The app will then scan the data and use GPT to identify what tasks or deliverables need to be completed. Tasks can then be expanded and users will be able to get suggestions on content that can help them complete the task and/or gqin more specifics on what the task requires.

The web app also incorporates collaboration features to allow users to share projects and assign tasks to others. By assessing the work assigned to members and their profiles, the app is able to make intelligent decisions about who to assign work to and who to contact for support.

## 🚀 Quick Start
To use the web app, clone the repository and navigate to the WebApp directory. Then use the below command to setup dependencies:
```
npm i
```

## Usage
See the examples directory for more information on the usage of the app.
