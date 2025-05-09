# Hood Women's Ice Hockey Visualization & Analysis (HWIHVA)

**Last Updated:** May 9, 2025

**Team Information:**

* Sarah Setiawan - \[[sarah.setiawan@example.com](mailto:sarah.setiawan@example.com)]
* Don Ngo - \[[don.ngo@example.com](mailto:don.ngo@example.com)] 
* Sam Lawrence - \[[sam.lawrence@example.com](mailto:sam.lawrence@example.com)]
* Jeremias Argueta - \[[jeremias.argueta@example.com](mailto:jeremias.argueta@example.com)]

**Repository URL:**

* [https://github.com/sarahsetiawan/Hood-Hockey.git](https://github.com/sarahsetiawan/Hood-Hockey.git)

## Description

Hood Women's Ice Hockey Visualization & Analysis (HWIHVA) is a standalone web application designed to provide tailored visualizations and predictive analytics for Hood College Women’s Ice Hockey. It leverages modern web development frameworks and integrates with a specialized dataset to offer actionable insights.

HWIHVA will offer several key features, including dynamic visualizations of Hood Ice Hockey data such as player performance trends and heatmaps. Users will be able to interact with visualizations and filter/compare data subsets to gain deeper insights. The application will also include predictive analytics tools to forecast player and team performance. The application will keep the data secure, requiring a login. Lastly, it will be built with a user-friendly interface tailored to the needs of coaches, analysts, and organizations.

## Tech Stack

* **Python:** Pandas, Scikit-learn (SK Learn), Plotly
* **Backend:** Django
* **Frontend:** React (with Vite)
* **Database:** PostgreSQL
* **Data Analysis/Exploration:** Jupyter Notebooks

## Directory Structure

The project follows this general directory structure (some files/folders omitted for brevity):

```
Hood-Hockey/
|-- LICENSE
|-- LinearReg.ipynb
|-- Presentations/
|   |-- CS475_MidtermPresentation.pdf
|   |-- CS475_MidtermPresentation.pptx
|-- README.md
|-- capstone/
|   |-- capstone/
|   |   |-- __init__.py
|   |   |-- asgi.py
|   |   |-- settings.py
|   |   |-- urls.py
|   |   |-- wsgi.py
|   |-- hood_hockey_app/
|   |   |-- __init__.py
|   |   |-- admin.py
|   |   |-- apps.py
|   |   |-- management/
|   |   |   |-- commands/
|   |   |       |-- list_tables.py
|   |   |-- migrations/
|   |   |-- models.py
|   |   |-- populateDB.py
|   |   |-- serializers.py
|   |   |-- tests.py
|   |   |-- urls.py
|   |   |-- views.py
|   |-- manage.py
|   |-- media/
|   |-- run_tests.bat
|   |-- server_log.txt
|-- frontend/
|   |-- README.md
|   |-- eslint.config.js
|   |-- index.html
|   |-- package-lock.json
|   |-- package.json
|   |-- public/
|   |-- src/
|   |   |-- App.jsx
|   |   |-- api.js
|   |   |-- components/
|   |   |-- constants.js
|   |   |-- context/
|   |   |-- main.jsx
|   |   |-- pages/
|   |   |-- styles/
|   |-- vite.config.js
|-- notebooks/
|   |-- DataAnalysis/
|   |-- DataCleaning/
|   |-- DataExploration/
|-- package-lock.json
|-- package.json
|-- requirements.txt
```

## Developer Documentation

### 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

* Python >= 3.8
* pip
* Node.js (LTS)
* npm
* PostgreSQL
* Git

### 2. Clone the Repository

```bash
git clone https://github.com/sarahsetiawan/Hood-Hockey.git
cd Hood-Hockey
```

### 3. Backend Setup (Django)

```bash
cd capstone
python -m venv env
# On Windows:
env\Scripts\activate
# On macOS/Linux:
source env/bin/activate
pip install -r ../requirements.txt
```

Update `capstone/settings.py` with your PostgreSQL credentials:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_hwihva_db_name',
        'USER': 'your_postgres_user',
        'PASSWORD': 'your_postgres_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

Apply migrations and create a superuser:

```bash
python manage.py migrate
python manage.py createsuperuser
```

To populate the database (if using `populateDB.py`):

```bash
python hood_hockey_app/populateDB.py
```

### 4. Frontend Setup (React)

```bash
cd ../frontend
npm install
```

### 5. Running the Application

Backend:

```bash
cd capstone
source env/bin/activate
python manage.py runserver
```

Frontend:

```bash
cd frontend
npm run dev
```

### 6. Running Tests

Backend:

```bash
python manage.py test hood_hockey_app
```

Windows (optional):

```bash
run_tests.bat
```

Frontend:

```bash
npm test
```

## User Documentation

### 1. Introduction

This guide is intended for coaches, team analysts, Hood Women’s Ice Hockey players, and anyone interested in exploring performance analytics for the team.

### 2. Getting Started

Upon launching the application, users are presented with a login screen. After entering a valid username and password, users are directed to the main dashboard. This page provides a summary of key metrics and links to different sections of the application.

### 3. Core Features

**Dynamic Visualizations**
Users can explore charts and graphs that reveal trends and insights within player and team data. These charts support interactions like hovering to display tooltips, clicking to isolate data segments, and zooming/panning on supported views. Visualization types include line charts for player trends, bar/radar charts for team comparisons, and charts illustrating possession metrics such as Corsi.

**Filtering and Comparison**
Users can refine views using filters for player selection, game type (regular season, playoffs, etc.), and game situations (power play, even strength, etc.). Multiple filters may be applied to enable side-by-side comparisons within visualizations.

**Predictive Analytics**
Users may engage with forecast tools to predict stats like goal scoring and win probabilities. These predictions come with confidence intervals and probability indicators derived from historical data. While useful, such forecasts are statistical in nature and should complement, not replace, coaching strategies.

**Navigation**
Users can move through different sections via the main navigation bar and interact with standard UI elements such as buttons, dropdowns, and forms.

### 4. Data Security

HWIHVA uses a secure login system to protect access. All data is considered confidential and should not be shared beyond authorized users. The system is built with safeguards to ensure data integrity and security.
