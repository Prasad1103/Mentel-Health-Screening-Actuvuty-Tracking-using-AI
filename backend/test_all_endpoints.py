"""
Comprehensive Backend Test Script for MindCare AI
Tests ALL API endpoints with actual inputs.
"""

import requests
import json
import time
import os
import sys
import wave
import struct
import random
import numpy as np
from PIL import Image

BASE_URL = "http://127.0.0.1:8000"
API = f"{BASE_URL}/api"

# Track results
results = []
token = None
user_id = None
history_ids = []

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def log_result(test_name, passed, detail=""):
    status = "[PASS]" if passed else "[FAIL]"
    results.append((test_name, passed, detail))
    print(f"\n{'='*60}")
    print(f"  {status} | {test_name}")
    if detail:
        # Truncate long details
        detail_str = str(detail)
        if len(detail_str) > 500:
            detail_str = detail_str[:500] + "..."
        print(f"  Detail: {detail_str}")
    print(f"{'='*60}")


def auth_headers():
    return {"Authorization": f"Bearer {token}"}


def generate_test_audio(filename="test_audio.wav", duration=3, sample_rate=22050):
    """Generate a test WAV file with a simple sine wave."""
    n_samples = int(duration * sample_rate)
    # Generate a mix of frequencies for more realistic audio
    t = np.linspace(0, duration, n_samples, dtype=np.float32)
    # Mix of frequencies to simulate speech-like content
    signal = (
        0.3 * np.sin(2 * np.pi * 200 * t) +  # low tone
        0.2 * np.sin(2 * np.pi * 400 * t) +  # mid tone  
        0.1 * np.sin(2 * np.pi * 800 * t) +  # high tone
        0.05 * np.random.randn(n_samples)      # noise
    )
    # Normalize to 16-bit range
    signal = np.clip(signal, -1.0, 1.0)
    signal_int16 = (signal * 32767).astype(np.int16)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(signal_int16.tobytes())
    
    return filename


def generate_test_face_image(filename="test_face.jpg"):
    """Generate a test face-like image (simple oval shape)."""
    img = Image.new('RGB', (224, 224), color=(200, 180, 160))
    pixels = img.load()
    
    # Draw a simple face-like oval
    cx, cy = 112, 112
    for x in range(224):
        for y in range(224):
            dx = (x - cx) / 80
            dy = (y - cy) / 100
            if dx*dx + dy*dy < 1:
                pixels[x, y] = (220, 200, 180)
            # Eyes
            if abs(x - 85) < 8 and abs(y - 90) < 5:
                pixels[x, y] = (50, 40, 30)
            if abs(x - 139) < 8 and abs(y - 90) < 5:
                pixels[x, y] = (50, 40, 30)
            # Mouth
            if abs(y - 145) < 3 and abs(x - 112) < 25:
                pixels[x, y] = (180, 100, 100)
    
    img.save(filename, 'JPEG')
    return filename


# ─────────────────────────────────────────────
# TEST 1: ROOT / HEALTH
# ─────────────────────────────────────────────

def test_root():
    try:
        r = requests.get(f"{BASE_URL}/", timeout=10)
        data = r.json()
        passed = r.status_code == 200 and data.get("status") == "ok"
        log_result("1. Root Endpoint (GET /)", passed, data)
    except Exception as e:
        log_result("1. Root Endpoint (GET /)", False, str(e))


def test_health():
    try:
        r = requests.get(f"{API}/health", timeout=10)
        data = r.json()
        passed = r.status_code == 200 and data.get("status") == "ok"
        log_result("2. Health Check (GET /api/health)", passed, data)
    except Exception as e:
        log_result("2. Health Check (GET /api/health)", False, str(e))


# ─────────────────────────────────────────────
# TEST 3: REGISTER
# ─────────────────────────────────────────────

def test_register():
    global token, user_id
    try:
        timestamp = int(time.time())
        payload = {
            "name": "Test User",
            "email": f"testuser_{timestamp}@test.com",
            "password": "TestPass123!"
        }
        r = requests.post(f"{API}/register", json=payload, timeout=15)
        data = r.json()
        
        if r.status_code == 200:
            token = data.get("token") or data.get("access_token")
            user_id = data.get("id")
            passed = token is not None and user_id is not None
            log_result("3. Register (POST /api/register)", passed, 
                       f"user_id={user_id}, token={'present' if token else 'missing'}, name={data.get('name')}")
        else:
            log_result("3. Register (POST /api/register)", False, data)
    except Exception as e:
        log_result("3. Register (POST /api/register)", False, str(e))


# ─────────────────────────────────────────────
# TEST 4: LOGIN
# ─────────────────────────────────────────────

def test_login():
    global token
    try:
        # Register a fresh user, then login
        timestamp = int(time.time())
        email = f"logintest_{timestamp}@test.com"
        password = "LoginPass123!"
        
        # Register
        requests.post(f"{API}/register", json={
            "name": "Login Tester",
            "email": email,
            "password": password
        }, timeout=15)
        
        # Login
        r = requests.post(f"{API}/login", json={
            "email": email,
            "password": password
        }, timeout=15)
        data = r.json()
        
        passed = r.status_code == 200 and data.get("token") is not None
        if passed:
            token = data.get("token")  # Use fresh token
            log_result("4. Login (POST /api/login)", True, 
                       f"message={data.get('message')}, name={data.get('name')}")
        else:
            log_result("4. Login (POST /api/login)", False, data)
    except Exception as e:
        log_result("4. Login (POST /api/login)", False, str(e))


# ─────────────────────────────────────────────
# TEST 5: LOGIN WITH WRONG PASSWORD
# ─────────────────────────────────────────────

def test_login_wrong_password():
    try:
        r = requests.post(f"{API}/login", json={
            "email": "nonexistent@fake.com",
            "password": "wrongpassword"
        }, timeout=10)
        passed = r.status_code == 401
        log_result("5. Login Wrong Password (401 expected)", passed, r.json())
    except Exception as e:
        log_result("5. Login Wrong Password", False, str(e))


# ─────────────────────────────────────────────
# TEST 6: TEXT ANALYSIS
# ─────────────────────────────────────────────

def test_text_analysis():
    try:
        test_texts = [
            ("I am feeling so happy and grateful today!", "positive"),
            ("I feel very stressed and overwhelmed with work deadlines", "stress"),
            ("Everything feels hopeless and I can't see a way out", "negative/depression"),
        ]
        
        for text, expected_category in test_texts:
            r = requests.post(
                f"{API}/analyze-text",
                params={"text": text},
                headers=auth_headers(),
                timeout=30
            )
            data = r.json()
            
            if r.status_code == 200:
                emotion = data.get("emotion", "Unknown")
                confidence = data.get("confidence", 0)
                concern = data.get("concern", "Unknown")
                rid = data.get("id")
                if rid:
                    history_ids.append(rid)
                
                log_result(
                    f"6. Text Analysis ({expected_category})",
                    True,
                    f"Input: '{text[:50]}...' -> Emotion: {emotion}, "
                    f"Confidence: {confidence:.1f}%, Concern: {concern}, ID: {rid}"
                )
            else:
                log_result(f"6. Text Analysis ({expected_category})", False, data)
                return
                
    except Exception as e:
        log_result("6. Text Analysis", False, str(e))


# ─────────────────────────────────────────────
# TEST 7: AUDIO ANALYSIS
# ─────────────────────────────────────────────

def test_audio_analysis():
    audio_file = None
    try:
        audio_file = generate_test_audio("test_audio.wav")
        
        with open(audio_file, "rb") as f:
            r = requests.post(
                f"{API}/analyze-audio",
                files={"audio": ("test_audio.wav", f, "audio/wav")},
                headers=auth_headers(),
                timeout=30
            )
        
        data = r.json()
        if r.status_code == 200:
            emotion = data.get("emotion", "Unknown")
            confidence = data.get("confidence", 0)
            rid = data.get("id")
            if rid:
                history_ids.append(rid)
            log_result("7. Audio Analysis (POST /api/analyze-audio)", True,
                       f"Emotion: {emotion}, Confidence: {confidence:.1f}%, ID: {rid}")
        else:
            log_result("7. Audio Analysis", False, data)
    except Exception as e:
        log_result("7. Audio Analysis", False, str(e))
    finally:
        if audio_file and os.path.exists(audio_file):
            os.remove(audio_file)


# ─────────────────────────────────────────────
# TEST 8: FACE ANALYSIS
# ─────────────────────────────────────────────

def test_face_analysis():
    face_file = None
    try:
        face_file = generate_test_face_image("test_face.jpg")
        
        with open(face_file, "rb") as f:
            r = requests.post(
                f"{API}/analyze-face",
                files={"image": ("test_face.jpg", f, "image/jpeg")},
                headers=auth_headers(),
                timeout=30
            )
        
        data = r.json()
        if r.status_code == 200:
            emotion = data.get("emotion", "Unknown")
            confidence = data.get("confidence", 0)
            rid = data.get("id")
            if rid:
                history_ids.append(rid)
            log_result("8. Face Analysis (POST /api/analyze-face)", True,
                       f"Emotion: {emotion}, Confidence: {confidence:.1f}%, ID: {rid}")
        else:
            log_result("8. Face Analysis", False, data)
    except Exception as e:
        log_result("8. Face Analysis", False, str(e))
    finally:
        if face_file and os.path.exists(face_file):
            os.remove(face_file)


# ─────────────────────────────────────────────
# TEST 9: FUSION ANALYSIS (Text + Audio + Face)
# ─────────────────────────────────────────────

def test_fusion_analysis():
    audio_file = None
    face_file = None
    try:
        audio_file = generate_test_audio("test_fusion_audio.wav")
        face_file = generate_test_face_image("test_fusion_face.jpg")
        
        with open(audio_file, "rb") as af, open(face_file, "rb") as ff:
            r = requests.post(
                f"{API}/analyze-fusion",
                data={"text": "I am feeling anxious about my upcoming exam and can't sleep well"},
                files={
                    "audio": ("test_audio.wav", af, "audio/wav"),
                    "face": ("test_face.jpg", ff, "image/jpeg"),
                },
                headers=auth_headers(),
                timeout=60
            )
        
        data = r.json()
        if r.status_code == 200:
            emotion = data.get("emotion", "Unknown")
            confidence = data.get("confidence", 0)
            modalities = data.get("modalities", {})
            weights = data.get("weights", {})
            rid = data.get("id")
            if rid:
                history_ids.append(rid)
            
            mod_summary = ", ".join([
                f"{k}: {v.get('emotion', '?')}" for k, v in modalities.items()
            ])
            
            log_result("9. Fusion Analysis (POST /api/analyze-fusion)", True,
                       f"Final Emotion: {emotion}, Confidence: {confidence:.1f}%, "
                       f"Modalities: [{mod_summary}], Weights: {weights}, ID: {rid}")
        else:
            log_result("9. Fusion Analysis", False, data)
    except Exception as e:
        log_result("9. Fusion Analysis", False, str(e))
    finally:
        for f in [audio_file, face_file]:
            if f and os.path.exists(f):
                os.remove(f)


# ─────────────────────────────────────────────
# TEST 10: CHAT ANALYSIS (text-only)
# ─────────────────────────────────────────────

def test_chat_analysis():
    try:
        payload = {
            "message": "I've been feeling quite anxious lately about my job situation",
            "transcript": [
                {"role": "user", "content": "Hello, I need someone to talk to"},
                {"role": "assistant", "content": "I'm here for you. How are you feeling today?"},
            ],
            "audio_summary": None,
            "facial_emotion": None
        }
        
        r = requests.post(
            f"{API}/analyze-chat",
            json=payload,
            headers=auth_headers(),
            timeout=30
        )
        
        data = r.json()
        if r.status_code == 200:
            emotion = data.get("emotion", "Unknown")
            ai_response = data.get("ai_response", "")
            rid = data.get("id")
            if rid:
                history_ids.append(rid)
            log_result("10. Chat Analysis (POST /api/analyze-chat)", True,
                       f"Emotion: {emotion}, AI Response: '{ai_response[:120]}...', ID: {rid}")
        else:
            log_result("10. Chat Analysis", False, data)
    except Exception as e:
        log_result("10. Chat Analysis", False, str(e))


# ─────────────────────────────────────────────
# TEST 11: QUESTIONNAIRE ANALYSIS
# ─────────────────────────────────────────────

def test_questionnaire_analysis():
    try:
        payload = {
            "answers": {
                "morning": {"value": "dread", "label": "I dread getting up"},
                "weekend": {"value": "blank", "label": "Mind goes blank"},
                "music": {"value": "melancholy", "label": "Melancholy music"},
                "messages": {"value": "worry", "label": "I worry about them"},
                "mirror": {"value": "tired", "label": "I look tired"},
                "meals": {"value": "skipped", "label": "I skip meals"},
                "task": {"value": "distract", "label": "I get distracted easily"},
                "stranger": {"value": "avoid", "label": "I avoid interaction"},
                "future": {"value": "anxious", "label": "I feel anxious"},
                "compliment": {"value": "doubt", "label": "I doubt it"},
                "night": {"value": "racing", "label": "Racing thoughts"},
                "hobby": {"value": "rare", "label": "Rarely do hobbies"},
                "criticism": {"value": "spiral", "label": "I spiral down"},
                "body": {"value": "chest", "label": "Chest tightness"},
                "phone": {"value": "tense", "label": "I feel tense"}
            },
            "free_text": "I have been feeling very overwhelmed and anxious lately. My sleep is disturbed and I find it hard to concentrate on anything.",
            "facial_emotion": "Anxiety"
        }
        
        r = requests.post(
            f"{API}/analyze-questionnaire",
            json=payload,
            headers=auth_headers(),
            timeout=30
        )
        
        data = r.json()
        if r.status_code == 200:
            emotion = data.get("emotion", "Unknown")
            confidence = data.get("confidence", 0)
            concern = data.get("concern_level", "Unknown")
            summary = data.get("summary", "")
            rid = data.get("id")
            if rid:
                history_ids.append(rid)
            
            sd = data.get("structured_data", {})
            score = sd.get("score", "N/A")
            
            log_result("11. Questionnaire (POST /api/analyze-questionnaire)", True,
                       f"Emotion: {emotion}, Confidence: {confidence:.1f}%, "
                       f"Concern: {concern}, Wellness Score: {score}/100, ID: {rid}")
        else:
            log_result("11. Questionnaire Analysis", False, data)
    except Exception as e:
        log_result("11. Questionnaire Analysis", False, str(e))


# ─────────────────────────────────────────────
# TEST 12: STREAMING CHAT
# ─────────────────────────────────────────────

def test_streaming_chat():
    try:
        r = requests.post(
            f"{API}/chat/stream",
            data={
                "message": "I feel overwhelmed with everything going on in my life right now",
                "transcript_json": json.dumps([
                    {"role": "user", "content": "I need help"},
                    {"role": "assistant", "content": "I'm here to help. Tell me more."}
                ]),
                "session_emotions_json": "[]"
            },
            headers=auth_headers(),
            stream=True,
            timeout=30
        )
        
        if r.status_code == 200:
            chunks = []
            stream_complete = None
            for line in r.iter_lines(decode_unicode=True):
                if line and line.startswith("data: "):
                    payload = line[6:]
                    if payload == "[DONE]":
                        break
                    try:
                        chunk = json.loads(payload)
                        chunks.append(chunk)
                        if chunk.get("type") == "stream_complete":
                            stream_complete = chunk
                    except json.JSONDecodeError:
                        pass
            
            if stream_complete:
                emotion = stream_complete.get("emotion", "Unknown")
                confidence = stream_complete.get("confidence", 0)
                log_result("12. Streaming Chat (POST /api/chat/stream)", True,
                           f"Received {len(chunks)} SSE chunks, "
                           f"Final Emotion: {emotion}, Confidence: {confidence:.1f}%")
            else:
                log_result("12. Streaming Chat", True, 
                           f"Stream completed with {len(chunks)} chunks (no stream_complete event)")
        else:
            log_result("12. Streaming Chat", False, f"Status: {r.status_code}, {r.text[:200]}")
    except Exception as e:
        log_result("12. Streaming Chat", False, str(e))


# ─────────────────────────────────────────────
# TEST 13: MULTIMODAL CHAT ANALYSIS
# ─────────────────────────────────────────────

def test_multimodal_chat():
    audio_file = None
    face_file = None
    try:
        audio_file = generate_test_audio("test_mm_audio.wav")
        face_file = generate_test_face_image("test_mm_face.jpg")
        
        with open(audio_file, "rb") as af, open(face_file, "rb") as ff:
            r = requests.post(
                f"{API}/analyze-chat-multimodal",
                data={
                    "message": "I have been feeling really stressed about my studies and relationships",
                    "transcript_json": json.dumps([
                        {"role": "user", "content": "I need guidance"},
                        {"role": "assistant", "content": "I'm listening. What's on your mind?"}
                    ]),
                    "session_emotions_json": "[]"
                },
                files={
                    "audio": ("test_audio.wav", af, "audio/wav"),
                    "face_image": ("test_face.jpg", ff, "image/jpeg"),
                },
                headers=auth_headers(),
                timeout=60
            )
        
        data = r.json()
        if r.status_code == 200:
            emotion = data.get("emotion", "Unknown")
            confidence = data.get("confidence", 0)
            analysis_type = data.get("type", "Unknown")
            modalities = data.get("modalities", {})
            ai_response = data.get("ai_response", "")
            
            mod_summary = ", ".join([
                f"{k}: {v.get('emotion', '?')}" for k, v in modalities.items()
            ])
            
            log_result("13. Multimodal Chat (POST /api/analyze-chat-multimodal)", True,
                       f"Type: {analysis_type}, Emotion: {emotion}, "
                       f"Confidence: {confidence:.1f}%, Modalities: [{mod_summary}], "
                       f"AI: '{ai_response[:80]}...'")
        else:
            log_result("13. Multimodal Chat", False, data)
    except Exception as e:
        log_result("13. Multimodal Chat", False, str(e))
    finally:
        for f in [audio_file, face_file]:
            if f and os.path.exists(f):
                os.remove(f)


# ─────────────────────────────────────────────
# TEST 14: FINALIZE CHAT
# ─────────────────────────────────────────────

def test_finalize_chat():
    try:
        r = requests.post(
            f"{API}/finalize-chat",
            data={
                "latest_message": "Thank you for the conversation, I feel a bit better now",
                "transcript_json": json.dumps([
                    {"role": "user", "content": "I was feeling anxious"},
                    {"role": "assistant", "content": "Let's work through this together"},
                    {"role": "user", "content": "Thank you for the conversation, I feel a bit better now"}
                ]),
                "audio_summary": "calm voice with slight tremor",
                "facial_emotion": "Neutral"
            },
            headers=auth_headers(),
            timeout=30
        )
        
        data = r.json()
        if r.status_code == 200:
            emotion = data.get("emotion", "Unknown")
            rid = data.get("id")
            if rid:
                history_ids.append(rid)
            log_result("14. Finalize Chat (POST /api/finalize-chat)", True,
                       f"Emotion: {emotion}, ID: {rid}, Type: {data.get('type')}")
        else:
            log_result("14. Finalize Chat", False, data)
    except Exception as e:
        log_result("14. Finalize Chat", False, str(e))


# ─────────────────────────────────────────────
# TEST 15: GET HISTORY
# ─────────────────────────────────────────────

def test_history():
    try:
        r = requests.get(
            f"{API}/history",
            headers=auth_headers(),
            timeout=15
        )
        
        data = r.json()
        if r.status_code == 200:
            total = data.get("total_results", 0)
            results_list = data.get("results", [])
            
            types_found = set()
            for item in results_list:
                types_found.add(item.get("type", "Unknown"))
            
            log_result("15. Get History (GET /api/history)", True,
                       f"Total results: {total}, Types found: {types_found}")
        else:
            log_result("15. Get History", False, data)
    except Exception as e:
        log_result("15. Get History", False, str(e))


# ─────────────────────────────────────────────
# TEST 16: DELETE HISTORY ITEM
# ─────────────────────────────────────────────

def test_delete_history():
    try:
        if not history_ids:
            log_result("16. Delete History", False, "No history IDs to delete")
            return
        
        rid = history_ids[0]
        r = requests.delete(
            f"{API}/history/{rid}",
            headers=auth_headers(),
            timeout=10
        )
        
        data = r.json()
        passed = r.status_code == 200 and data.get("success") == True
        log_result("16. Delete History (DELETE /api/history/{id})", passed,
                   f"Deleted ID: {rid}, Response: {data}")
    except Exception as e:
        log_result("16. Delete History", False, str(e))


# ─────────────────────────────────────────────
# TEST 17: FORGOT PASSWORD
# ─────────────────────────────────────────────

def test_forgot_password():
    try:
        r = requests.post(
            f"{API}/forgot-password",
            json={"email": "nonexistent@test.com"},
            timeout=10
        )
        data = r.json()
        # Should always return 200 (never reveals if email exists)
        passed = r.status_code == 200 and "message" in data
        log_result("17. Forgot Password (POST /api/forgot-password)", passed, data)
    except Exception as e:
        log_result("17. Forgot Password", False, str(e))


# ─────────────────────────────────────────────
# TEST 18: RESET PASSWORD (invalid token)
# ─────────────────────────────────────────────

def test_reset_password_invalid():
    try:
        r = requests.post(
            f"{API}/reset-password",
            json={"token": "invalid_token_here", "password": "NewPass123!"},
            timeout=10
        )
        # Should return 400 for invalid token
        passed = r.status_code == 400
        log_result("18. Reset Password Invalid Token (400 expected)", passed, r.json())
    except Exception as e:
        log_result("18. Reset Password Invalid Token", False, str(e))


# ─────────────────────────────────────────────
# TEST 19: UNAUTHORIZED ACCESS (no token)
# ─────────────────────────────────────────────

def test_unauthorized_access():
    try:
        r = requests.post(
            f"{API}/analyze-text",
            params={"text": "test message for unauthorized access"},
            timeout=10
        )
        passed = r.status_code in [401, 403]
        log_result("19. Unauthorized Access (401/403 expected)", passed,
                   f"Status: {r.status_code}, Response: {r.json()}")
    except Exception as e:
        log_result("19. Unauthorized Access", False, str(e))


# ─────────────────────────────────────────────
# TEST 20: VALIDATION ERRORS
# ─────────────────────────────────────────────

def test_validation_errors():
    try:
        # Text too short
        r = requests.post(
            f"{API}/analyze-text",
            params={"text": "ab"},
            headers=auth_headers(),
            timeout=10
        )
        passed = r.status_code == 400
        log_result("20. Validation - Short Text (400 expected)", passed,
                   f"Status: {r.status_code}")
    except Exception as e:
        log_result("20. Validation Errors", False, str(e))


# ─────────────────────────────────────────────
# MAIN RUNNER
# ─────────────────────────────────────────────

def main():
    print("\n" + "="*60)
    print("   MindCare AI - Comprehensive Backend Test Suite")
    print("="*60)
    print(f"\n  Target: {BASE_URL}")
    print(f"  Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Wait for server to be ready
    print("[...] Waiting for server to be ready...")
    for attempt in range(10):
        try:
            r = requests.get(f"{BASE_URL}/", timeout=5)
            if r.status_code == 200:
                print("[OK] Server is ready!\n")
                break
        except:
            pass
        time.sleep(3)
    else:
        print("[ERROR] Server not reachable after 30 seconds. Aborting.")
        sys.exit(1)
    
    # Run all tests
    test_root()
    test_health()
    test_register()
    test_login()
    test_login_wrong_password()
    test_text_analysis()
    test_audio_analysis()
    test_face_analysis()
    test_fusion_analysis()
    test_chat_analysis()
    test_questionnaire_analysis()
    test_streaming_chat()
    test_multimodal_chat()
    test_finalize_chat()
    test_history()
    test_delete_history()
    test_forgot_password()
    test_reset_password_invalid()
    test_unauthorized_access()
    test_validation_errors()
    
    # Print summary
    print("\n\n" + "=" * 60)
    print("  TEST SUMMARY")
    print("=" * 60)
    
    passed_count = sum(1 for _, p, _ in results if p)
    failed_count = sum(1 for _, p, _ in results if not p)
    total = len(results)
    
    for name, passed, detail in results:
        icon = "[PASS]" if passed else "[FAIL]"
        print(f"  {icon} {name}")
    
    print(f"\n{'=' * 60}")
    print(f"  Total:  {total}")
    print(f"  Passed: {passed_count}")
    print(f"  Failed: {failed_count}")
    pct = (passed_count / total * 100) if total > 0 else 0
    print(f"  Rate:   {pct:.1f}%")
    print(f"{'=' * 60}\n")
    
    if failed_count > 0:
        print("[!] SOME TESTS FAILED - See details above")
    else:
        print("ALL TESTS PASSED!")


if __name__ == "__main__":
    main()
