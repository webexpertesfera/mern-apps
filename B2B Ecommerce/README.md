# Module: Help & Support (Admin Panel)

## Description:
This module allows administrators to manage user support tickets efficiently. Admins can view all raised tickets, read detailed information, communicate with users, and close resolved tickets.

## Features:

### 1. **List of All Raised Tickets**
   - Display a list of all raised tickets with key information
   - Include search and filter options for

### 2. **View Ticket Details**
   - Clicking on a ticket should open a detailed view containing:
   - Admins can add internal notes that won't be visible to the user.

### 3. **Chat with Users (Without Socket)**
   - Admins can communicate with users through a message system within the ticket.
   - Admin messages and user responses are stored with timestamps.
   - Full message history should be displayed for admins to view past interactions.

### 4. **Close Ticket**
   - Admins can mark a ticket as "Closed" once the issue is resolved.
   - Upon closure, users can no longer respond to the ticket.
   - Optionally, admins can add a resolution note when closing the ticket, explaining the solution to the issue.

## User Interface:

### Dashboard Overview:
- Display key metrics like:
  - Number of open tickets
  - Number of pending tickets
  - Number of closed tickets

### Ticket Management Interface:
- A list view of tickets with

### Ticket Detail View:
- Ticket details should include:
  - **User Information**
  - **Ticket Description**
  - **Ticket Status & Priority**
  - **Message History**
  - **Reply Box** for Admins to respond
  - **Close Ticket Button**

## Database Structure:

### `tickets` Table
| Column         | Description                                           |
|----------------|-------------------------------------------------------|
| ticket_id      | Unique identifier for the ticket                      |
| user_id        | Reference to the user who raised the ticket          |
| status         | Ticket status (Open, Pending, Closed)                 |
| priority       | Priority level (Low, Medium, High)                    |
| created_at     | Date and time when the ticket was created             |
| closed_at      | Date and time when the ticket was closed (if applicable)|
| resolution_note| Optional note describing the resolution of the issue  |

### `ticket_messages` Table
| Column         | Description                                           |
|----------------|-------------------------------------------------------|
| message_id     | Unique identifier for each message                    |
| ticket_id      | Reference to the associated ticket                    |
| sender         | Identifies who sent the message (Admin or User)       |
| message        | Content of the message                                 |
| created_at     | Date and time when the message was sent               |

## APIs:
### 1. **Get All Tickets**
   - **Method**: GET
   - **Description**: Retrieve a list of all tickets.
   - **Query Parameters**:
     - `status`: Filter by ticket status (Optional)
     - `priority`: Filter by priority (Optional)
     - `user`: Filter by user (Optional)

### 2. **Get Ticket Details**
   - **Method**: GET
   - **Description**: Retrieve the details of a specific ticket.
   - **Response**:
     - Ticket information (ID, status, priority, user details)
     - Message history (Admin <-> User)

### 3. **Send Message**
   - **Method**: POST
   - **Description**: Send a message in a specific ticket.
   - **Request Body**:
     - `sender`: Identifies whether the message is from an Admin or User
     - `message`: The message content

### 4. **Close Ticket**
   - **Method**: PATCH
   - **Description**: Close a specific ticket.
   - **Request Body**:
     - `resolution_note`: (Optional) A note detailing the resolution of the ticket

## Security and Permissions:
- Only authorized admin users should be able to access the admin panel, view tickets, send messages, and close tickets.
- Access to certain functions may be restricted based on the admin's role or privileges.

## Conclusion:
The Help & Support Admin Panel module provides administrators with the necessary tools to manage and resolve user support tickets efficiently. It offers a user-friendly interface for tracking tickets, communicating with users, and closing resolved issues.
