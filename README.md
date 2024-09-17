# SPMG5T5


## Table of Contents
### Backend
1. [Installation](#installation)
2. [Running the Flask Server](#running-the-flask-server)

---

## Installation

### 1. Clone the Repository

First, clone this repository to your local machine. Once done, navigate to the `backend` directory.

```bash
cd your-repo/backend
```

### 2. Create a Virtual Environment

Create a Python virtual environment to isolate the project dependencies:
```bash
python -m venv venv
```
Activate the virtual environment:

- On Linux/macOS: 
```bash
source venv/bin/activate
```

- On Windows: 
```bash
"venv\Scripts\activate"
```

### 3. Install Dependencies

Install the required dependencies from requirements.txt:
```bash
pip install -r requirements.txt
```

### 4. Set up Firebase

To use Firebase, you need to obtain the Firebase credentials.

Go to the [Firebase Console](https://console.firebase.google.com/) and select SPM-G5T5 from the project list. Under Project Overview, click on the gear icon and select Project Settings.

In the Project Settings page, click on the Service Accounts tab and generate a new private key.

Rename the downloaded file to `firebase.key.json` and place it in the `/backend` directory.

This file should already be excluded from the commit by the `.gitignore` file. If not, do **not** commit this file to the repository.

## Running the Flask Server

Once the dependencies are installed, you can run the Flask server by doing 

```bash
flask run
```
or
```bash
python app.py
```

The server should be running on http://127.0.0.1:5000/ by default.