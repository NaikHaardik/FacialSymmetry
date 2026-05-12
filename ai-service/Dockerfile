FROM python:3.11-slim

# Install system dependencies for dlib
RUN apt-get update && apt-get install -y \
    cmake \
    build-essential \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    libgtk-3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download the landmark model
RUN python -c "import urllib.request; urllib.request.urlretrieve('http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2', 'shape_predictor_68_face_landmarks.dat.bz2')"
RUN python -c "import bz2; open('shape_predictor_68_face_landmarks.dat', 'wb').write(bz2.open('shape_predictor_68_face_landmarks.dat.bz2').read())"

# Copy app
COPY main.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]