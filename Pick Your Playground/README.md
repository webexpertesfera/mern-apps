# Socket Chat Server

This project provides a socket-based chat system for users and owners with functionality for real-time messaging, chat creation, user authentication, and connection management. It uses **Socket.IO** for real-time communication and **MongoDB** for data storage. The backend is built using **Node.js** with **Express**.

## Features

- **Real-time Chat**: Users can send and receive messages instantly.
- **User Authentication**: Each connection is authenticated via JWT tokens.
- **Dynamic Chat Creation**: Chats are dynamically created between users and owners.
- **Message Persistence**: All messages are saved in the database.
- **User Connection Management**: Tracks whether users are online or offline, and sends notifications accordingly.
- **Notification System**: Sends notifications to users when a new message is received.
- **Chat List Retrieval**: Retrieves all chats related to a user and displays relevant information.
- **Message History**: Allows fetching the full list of messages for a particular chat.

## Technologies Used

- **Node.js**: Backend JavaScript runtime.
- **Express**: Web framework for Node.js.
- **Socket.IO**: Real-time bidirectional event-based communication.
- **MongoDB**: NoSQL database used to store chat data and user information.
- **JWT**: Used for authenticating users via tokens.
- **Mongoose**: MongoDB object modeling for Node.js.

## Installation

### Prerequisites

- Node.js
- MongoDB (either locally or using a cloud service like MongoDB Atlas)

### Steps to Install

1. Clone this repository:
   ```bash
   git clone <repository_url>
