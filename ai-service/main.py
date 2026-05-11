from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import cv2
import dlib
import numpy as np
import io
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dlib models
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

CLINICAL_LANDMARKS = {
    "menton": 8,
    "pogonion": 8,
    "left_gonion": 4,
    "right_gonion": 12,
    "nasion": 27,
    "pronasale": 30,
    "subnasale": 33,
    "labrale_superius": 51,
    "stomion": 62,
    "labrale_inferius": 57,
    "left_eye_outer": 36,
    "left_eye_inner": 39,
    "right_eye_inner": 42,
    "right_eye_outer": 45,
    "left_eyebrow_peak": 19,
    "right_eyebrow_peak": 24,
    "glabella": 27,
}

def shape_to_list(shape):
    coords = []
    for i in range(68):
        coords.append((shape.part(i).x, shape.part(i).y))
    return coords

def calculate_symmetry(landmarks):
    def pt(idx):
        return np.array(landmarks[idx], dtype=float)

    # ── Core reference points ──
    nasion      = pt(27)   # top of nose bridge
    subnasale   = pt(33)   # base of nose
    menton      = pt(8)    # chin bottom
    glabella    = pt(27)   # between eyebrows (same as nasion in 68pt model)

    # Hairline approximation (above nasion)
    # dlib 68 doesn't detect hairline, so we estimate it
    left_brow_top  = pt(19)
    right_brow_top = pt(24)
    brow_mid_y = (left_brow_top[1] + right_brow_top[1]) / 2
    # Estimate hairline as same distance above brows as brows are above nasion
    brow_to_nasion = nasion[1] - brow_mid_y
    hairline_y = brow_mid_y - brow_to_nasion

    # ── HORIZONTAL THIRDS ──
    upper_third  = abs(nasion[1]    - hairline_y)   # hairline → nasion
    middle_third = abs(subnasale[1] - nasion[1])    # nasion → subnasale
    lower_third  = abs(menton[1]    - subnasale[1]) # subnasale → menton
    total_height = upper_third + middle_thirds if False else upper_third + middle_third + lower_third

    upper_pct  = round(upper_third  / total_height * 100, 1)
    middle_pct = round(middle_third / total_height * 100, 1)
    lower_pct  = round(lower_third  / total_height * 100, 1)

    # Lower third subdivision (upper lip : lower lip+chin = 1:2)
    stomion       = pt(62)   # mouth center
    upper_lip_h   = abs(stomion[1]  - subnasale[1])
    lower_lip_h   = abs(menton[1]   - stomion[1])
    lower_third_upper_pct = round(upper_lip_h / lower_third * 100, 1)
    lower_third_lower_pct = round(lower_lip_h / lower_third * 100, 1)

    # ── VERTICAL FIFTHS ──
    # Five zones: outer_left | left_eye | nose | right_eye | outer_right
    left_ear_x    = landmarks[0][0]    # leftmost jaw point (approx ear)
    right_ear_x   = landmarks[16][0]   # rightmost jaw point (approx ear)
    left_eye_inner  = pt(39)[0]        # inner left eye corner
    right_eye_inner = pt(42)[0]        # inner right eye corner
    left_eye_outer  = pt(36)[0]        # outer left eye corner
    right_eye_outer = pt(45)[0]        # outer right eye corner
    nose_left_x   = landmarks[31][0]   # left nose base
    nose_right_x  = landmarks[35][0]   # right nose base

    face_width = right_ear_x - left_ear_x

    first_fifth  = abs(left_eye_outer  - left_ear_x)    # outer left
    second_fifth = abs(left_eye_inner  - left_eye_outer) # left eye width
    third_fifth  = abs(right_eye_inner - left_eye_inner) # nose/central zone
    fourth_fifth = abs(right_eye_outer - right_eye_inner)# right eye width
    fifth_fifth  = abs(right_ear_x     - right_eye_outer)# outer right

    f1 = round(first_fifth  / face_width * 100, 1)
    f2 = round(second_fifth / face_width * 100, 1)
    f3 = round(third_fifth  / face_width * 100, 1)
    f4 = round(fourth_fifth / face_width * 100, 1)
    f5 = round(fifth_fifth  / face_width * 100, 1)

    # Nose width vs eye width comparison (ideal: nose width ≈ eye width)
    nose_width      = abs(nose_right_x - nose_left_x)
    left_eye_width  = abs(left_eye_outer  - left_eye_inner)
    right_eye_width = abs(right_eye_outer - right_eye_inner)
    avg_eye_width   = (left_eye_width + right_eye_width) / 2
    nose_eye_ratio  = round(nose_width / avg_eye_width * 100, 1)

    # ── EXISTING SYMMETRY METRICS ──
    midline_x = (nasion[0] + menton[0]) / 2

    left_eye  = pt(36)
    right_eye = pt(45)
    eye_dx = right_eye[0] - left_eye[0]
    eye_dy = right_eye[1] - left_eye[1]
    eye_canting = abs(np.degrees(np.arctan2(eye_dy, eye_dx)))

    left_lip  = pt(48)
    right_lip = pt(54)
    lip_dx = right_lip[0] - left_lip[0]
    lip_dy = right_lip[1] - left_lip[1]
    lip_canting = abs(np.degrees(np.arctan2(lip_dy, lip_dx)))

    chin           = pt(8)
    chin_deviation = abs(chin[0] - midline_x)
    nose           = pt(30)
    nose_deviation = abs(nose[0] - midline_x)
    face_width_eyes = abs(right_eye[0] - left_eye[0]) * 2

    left_brow  = pt(19)
    right_brow = pt(24)
    brow_height_diff = abs(left_brow[1] - right_brow[1])

    # ── SYMMETRY SCORE ──
    score = 100
    score -= eye_canting * 2
    score -= lip_canting * 2
    score -= (chin_deviation / face_width_eyes * 100) * 3
    score -= (nose_deviation / face_width_eyes * 100) * 2
    score -= (brow_height_diff / face_width_eyes * 100) * 1.5
    # Penalise unequal thirds
    thirds_ideal = 33.3
    score -= abs(upper_pct  - thirds_ideal) * 0.3
    score -= abs(middle_pct - thirds_ideal) * 0.3
    score -= abs(lower_pct  - thirds_ideal) * 0.3
    score = max(0, min(100, score))

    return {
        # Symmetry
        "eyeCanting":           round(eye_canting, 2),
        "lipCanting":           round(lip_canting, 2),
        "chinDeviation":        round(chin_deviation / face_width_eyes * 100, 2),
        "noseDeviation":        round(nose_deviation / face_width_eyes * 100, 2),
        "browHeightDifference": round(brow_height_diff / face_width_eyes * 100, 2),
        "symmetryScore":        round(score, 1),
        "midlineX":             midline_x,
        "faceWidth":            face_width_eyes,

        # Horizontal thirds
        "horizontalThirds": {
            "upperThird":           upper_pct,
            "middleThird":          middle_pct,
            "lowerThird":           lower_pct,
            "lowerThirdUpperLip":   lower_third_upper_pct,
            "lowerThirdLowerLip":   lower_third_lower_pct,
            "assessment": (
                "Balanced" if all(abs(x - 33.3) < 4 for x in [upper_pct, middle_pct, lower_pct])
                else "Imbalanced"
            )
        },

        # Vertical fifths
        "verticalFifths": {
            "firstFifth":   f1,
            "secondFifth":  f2,
            "thirdFifth":   f3,
            "fourthFifth":  f4,
            "fifthFifth":   f5,
            "noseEyeRatio": nose_eye_ratio,
            "assessment": (
                "Balanced" if abs(f2 - f4) < 3 and abs(f1 - f5) < 3
                else "Asymmetric"
            )
        }
    }
def draw_overlay(img_bgr, landmarks, metrics):
    img_out = img_bgr.copy()
    h, w = img_out.shape[:2]

    for i, (x, y) in enumerate(landmarks):
        cv2.circle(img_out, (x, y), 3, (0, 255, 255), -1)

    mid_x = int(metrics["midlineX"])
    cv2.line(img_out, (mid_x, 0), (mid_x, h), (0, 255, 0), 2)
    cv2.line(img_out, landmarks[36], landmarks[45], (255, 255, 0), 2)
    cv2.line(img_out, landmarks[48], landmarks[54], (255, 0, 255), 2)

    for i in range(0, 16):
        cv2.line(img_out, landmarks[i], landmarks[i+1], (100, 200, 255), 1)

    clinical_labels = {
        27: "Na", 30: "Prn", 33: "Sn",
        8: "Me", 51: "Ls", 57: "Li"
    }
    for idx, label in clinical_labels.items():
        x, y = landmarks[idx]
        cv2.putText(img_out, label, (x+5, y-5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

    return img_out

@app.post("/analyze")
async def analyze_face(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        # Save temp file — dlib works most reliably reading from disk
        temp_path = "temp_upload.jpg"
        with open(temp_path, "wb") as f:
            f.write(contents)

        # Load using dlib directly — most compatible method
        img_rgb = dlib.load_rgb_image(temp_path)

        # Also load with OpenCV for drawing overlay later
        img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)

        # Resize if too large
        max_size = 1200
        h, w = img_rgb.shape[:2]
        if max(h, w) > max_size:
            scale = max_size / max(h, w)
            new_w, new_h = int(w * scale), int(h * scale)
            img_rgb = cv2.resize(img_rgb, (new_w, new_h))
            img_bgr = cv2.resize(img_bgr, (new_w, new_h))

        # Detect faces — pass RGB directly to dlib
        faces = detector(img_rgb, 1)
        if len(faces) == 0:
            faces = detector(img_rgb, 2)
        if len(faces) == 0:
            return {"error": "No face detected. Please upload a clear frontal photo."}

        # Get grayscale for predictor
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

        # Get landmarks
        shape = predictor(gray, faces[0])
        landmarks = shape_to_list(shape)

        # Calculate metrics
        metrics = calculate_symmetry(landmarks)

        # Draw overlay
        annotated = draw_overlay(img_bgr, landmarks, metrics)

        # Encode result
        _, buffer = cv2.imencode(".jpg", annotated)
        img_b64 = base64.b64encode(buffer).decode("utf-8")

        return {
            "metrics": metrics,
            "landmarks": landmarks,
            "annotatedImage": f"data:image/jpeg;base64,{img_b64}",
            "imageSize": {"width": img_bgr.shape[1], "height": img_bgr.shape[0]}
        }

    except Exception as e:
        return {"error": f"Processing failed: {str(e)}"}
@app.post("/recalculate")
async def recalculate(data: dict):
    landmarks = [tuple(pt) for pt in data["landmarks"]]
    metrics = calculate_symmetry(landmarks)
    return {"metrics": metrics}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/debug")
async def debug_image(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img_bgr is None:
        return {"error": "cv2 could not decode image"}
    
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gray = np.ascontiguousarray(gray, dtype=np.uint8)
    
    return {
        "img_bgr_shape": list(img_bgr.shape),
        "img_bgr_dtype": str(img_bgr.dtype),
        "gray_shape": list(gray.shape),
        "gray_dtype": str(gray.dtype),
        "gray_contiguous": bool(gray.flags['C_CONTIGUOUS']),
        "gray_min": int(gray.min()),
        "gray_max": int(gray.max()),
        "dlib_version": dlib.__version__
    }