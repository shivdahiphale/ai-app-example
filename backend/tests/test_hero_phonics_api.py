"""
Hero Phonics API Backend Tests
Tests for: auth, phonics, words, stories, progress, TTS, admin CRUD
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@hero.com"
ADMIN_PASSWORD = "admin123"
KID_EMAIL = "kid@hero.com"
KID_PASSWORD = "hero123"


class TestHealth:
    """Health endpoint tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns 200 ok"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print("✓ Health endpoint returns 200 ok")


class TestAuth:
    """Authentication endpoint tests"""
    
    def test_login_admin(self):
        """Test admin login with admin@hero.com/admin123"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        print(f"✓ Admin login successful, role={data['user']['role']}")
    
    def test_login_kid(self):
        """Test kid login with kid@hero.com/hero123"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": KID_EMAIL,
            "password": KID_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == KID_EMAIL
        assert data["user"]["role"] == "user"
        print(f"✓ Kid login successful, role={data['user']['role']}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials returns 401")
    
    def test_signup_new_user(self):
        """Test signup creates new user and returns token"""
        import uuid
        test_email = f"test_{uuid.uuid4().hex[:8]}@hero.com"
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": "Test Hero",
            "email": test_email,
            "password": "test1234"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == test_email.lower()
        assert data["user"]["role"] == "user"
        assert data["user"]["stars"] == 0
        print(f"✓ Signup successful for {test_email}")
    
    def test_signup_duplicate_email(self):
        """Test signup with existing email returns 400"""
        response = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": "Duplicate",
            "email": KID_EMAIL,
            "password": "test1234"
        })
        assert response.status_code == 400
        print("✓ Duplicate email signup returns 400")
    
    def test_auth_me_with_token(self):
        """Test /api/auth/me returns current user with valid token"""
        # First login to get token
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": KID_EMAIL,
            "password": KID_PASSWORD
        })
        token = login_res.json()["token"]
        
        # Then call /auth/me
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == KID_EMAIL
        print(f"✓ /auth/me returns user: {data['name']}")
    
    def test_auth_me_without_token(self):
        """Test /api/auth/me without token returns 403"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 403
        print("✓ /auth/me without token returns 403")


class TestPhonics:
    """Phonics endpoint tests"""
    
    def test_get_phonics_returns_26_items(self):
        """Test GET /api/phonics returns 26 phonics items"""
        response = requests.get(f"{BASE_URL}/api/phonics")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 26, f"Expected 26 phonics, got {len(data)}"
        # Verify structure
        for item in data:
            assert "id" in item
            assert "letter" in item
            assert "sound" in item
            assert "hero_name" in item
            assert "example_word" in item
        print(f"✓ GET /phonics returns {len(data)} items with correct structure")
    
    def test_phonics_sorted_alphabetically(self):
        """Test phonics are sorted A-Z"""
        response = requests.get(f"{BASE_URL}/api/phonics")
        data = response.json()
        letters = [p["letter"] for p in data]
        assert letters == sorted(letters), "Phonics not sorted alphabetically"
        print("✓ Phonics sorted A-Z")


class TestWords:
    """Words endpoint tests"""
    
    def test_get_words_returns_16_items(self):
        """Test GET /api/words returns 16 words"""
        response = requests.get(f"{BASE_URL}/api/words")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 16, f"Expected 16 words, got {len(data)}"
        # Verify structure
        for item in data:
            assert "id" in item
            assert "word" in item
            assert "meaning" in item
            assert "emoji" in item
        print(f"✓ GET /words returns {len(data)} items with correct structure")


class TestStories:
    """Stories endpoint tests"""
    
    def test_get_stories_returns_4_items(self):
        """Test GET /api/stories returns 4 stories"""
        response = requests.get(f"{BASE_URL}/api/stories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 4, f"Expected 4 stories, got {len(data)}"
        # Verify structure
        for item in data:
            assert "id" in item
            assert "title" in item
            assert "content" in item
            assert "emoji" in item
        print(f"✓ GET /stories returns {len(data)} items with correct structure")
    
    def test_get_single_story(self):
        """Test GET /api/stories/{id} returns single story"""
        # First get all stories
        stories_res = requests.get(f"{BASE_URL}/api/stories")
        stories = stories_res.json()
        story_id = stories[0]["id"]
        
        # Get single story
        response = requests.get(f"{BASE_URL}/api/stories/{story_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == story_id
        assert "title" in data
        assert "content" in data
        print(f"✓ GET /stories/{story_id} returns story: {data['title']}")


class TestTTS:
    """TTS endpoint tests"""
    
    def test_tts_requires_auth(self):
        """Test POST /api/tts requires authentication"""
        response = requests.post(f"{BASE_URL}/api/tts", json={
            "text": "Hello"
        })
        assert response.status_code == 403
        print("✓ TTS requires authentication (403 without token)")
    
    def test_tts_generates_audio(self):
        """Test POST /api/tts generates audio_base64 mp3"""
        # Login first
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": KID_EMAIL,
            "password": KID_PASSWORD
        })
        token = login_res.json()["token"]
        
        # Call TTS
        response = requests.post(f"{BASE_URL}/api/tts", 
            json={"text": "Hello hero", "voice": "nova"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "audio_base64" in data
        assert "format" in data
        assert data["format"] == "mp3"
        assert len(data["audio_base64"]) > 100  # Should have actual audio data
        print(f"✓ TTS generates audio_base64 (length: {len(data['audio_base64'])})")


class TestProgress:
    """Progress tracking endpoint tests"""
    
    def test_progress_requires_auth(self):
        """Test progress endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/progress")
        assert response.status_code == 403
        print("✓ GET /progress requires auth")
        
        response = requests.post(f"{BASE_URL}/api/progress", json={
            "type": "phonic",
            "item_id": "test"
        })
        assert response.status_code == 403
        print("✓ POST /progress requires auth")
    
    def test_get_progress(self):
        """Test GET /api/progress returns user progress"""
        # Login
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": KID_EMAIL,
            "password": KID_PASSWORD
        })
        token = login_res.json()["token"]
        
        response = requests.get(f"{BASE_URL}/api/progress", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "stars" in data
        assert "phonics_learned" in data
        assert "words_learned" in data
        assert "stories_read" in data
        print(f"✓ GET /progress returns: stars={data['stars']}")
    
    def test_post_progress_increments_stars(self):
        """Test POST /api/progress tracks progress and increments stars"""
        # Create a new user to test fresh progress
        import uuid
        test_email = f"progress_test_{uuid.uuid4().hex[:8]}@hero.com"
        signup_res = requests.post(f"{BASE_URL}/api/auth/signup", json={
            "name": "Progress Tester",
            "email": test_email,
            "password": "test1234"
        })
        token = signup_res.json()["token"]
        initial_stars = signup_res.json()["user"]["stars"]
        
        # Get a phonic ID
        phonics_res = requests.get(f"{BASE_URL}/api/phonics")
        phonic_id = phonics_res.json()[0]["id"]
        
        # Track progress
        response = requests.post(f"{BASE_URL}/api/progress",
            json={"type": "phonic", "item_id": phonic_id},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["stars"] == initial_stars + 1
        assert phonic_id in data["phonics_learned"]
        print(f"✓ POST /progress increments stars: {initial_stars} -> {data['stars']}")
        
        # Track same item again - should NOT increment
        response2 = requests.post(f"{BASE_URL}/api/progress",
            json={"type": "phonic", "item_id": phonic_id},
            headers={"Authorization": f"Bearer {token}"}
        )
        data2 = response2.json()
        assert data2["stars"] == data["stars"], "Stars should not increment for same item"
        print("✓ Duplicate progress does not increment stars")


class TestAdminCRUD:
    """Admin CRUD operations tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return login_res.json()["token"]
    
    @pytest.fixture
    def kid_token(self):
        """Get kid (non-admin) token"""
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": KID_EMAIL,
            "password": KID_PASSWORD
        })
        return login_res.json()["token"]
    
    def test_create_phonic_requires_admin(self, kid_token):
        """Test POST /api/phonics requires admin role"""
        response = requests.post(f"{BASE_URL}/api/phonics",
            json={"letter": "X", "sound": "ks", "hero_name": "Test", "example_word": "Test"},
            headers={"Authorization": f"Bearer {kid_token}"}
        )
        assert response.status_code == 403
        print("✓ POST /phonics returns 403 for non-admin")
    
    def test_update_phonic_requires_admin(self, kid_token):
        """Test PUT /api/phonics/{id} requires admin role"""
        # Get a phonic ID
        phonics = requests.get(f"{BASE_URL}/api/phonics").json()
        phonic_id = phonics[0]["id"]
        
        response = requests.put(f"{BASE_URL}/api/phonics/{phonic_id}",
            json={"sound": "test"},
            headers={"Authorization": f"Bearer {kid_token}"}
        )
        assert response.status_code == 403
        print("✓ PUT /phonics returns 403 for non-admin")
    
    def test_delete_phonic_requires_admin(self, kid_token):
        """Test DELETE /api/phonics/{id} requires admin role"""
        phonics = requests.get(f"{BASE_URL}/api/phonics").json()
        phonic_id = phonics[0]["id"]
        
        response = requests.delete(f"{BASE_URL}/api/phonics/{phonic_id}",
            headers={"Authorization": f"Bearer {kid_token}"}
        )
        assert response.status_code == 403
        print("✓ DELETE /phonics returns 403 for non-admin")
    
    def test_create_word_requires_admin(self, kid_token):
        """Test POST /api/words requires admin role"""
        response = requests.post(f"{BASE_URL}/api/words",
            json={"word": "Test", "meaning": "Test meaning"},
            headers={"Authorization": f"Bearer {kid_token}"}
        )
        assert response.status_code == 403
        print("✓ POST /words returns 403 for non-admin")
    
    def test_create_story_requires_admin(self, kid_token):
        """Test POST /api/stories requires admin role"""
        response = requests.post(f"{BASE_URL}/api/stories",
            json={"title": "Test", "content": "Test content"},
            headers={"Authorization": f"Bearer {kid_token}"}
        )
        assert response.status_code == 403
        print("✓ POST /stories returns 403 for non-admin")
    
    def test_admin_can_create_word(self, admin_token):
        """Test admin can create a word"""
        response = requests.post(f"{BASE_URL}/api/words",
            json={"word": "TEST_AdminWord", "meaning": "Test meaning", "emoji": "🧪", "category": "test"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["word"] == "TEST_AdminWord"
        print(f"✓ Admin created word: {data['word']}")
        
        # Cleanup - delete the test word
        requests.delete(f"{BASE_URL}/api/words/{data['id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_admin_can_update_word(self, admin_token):
        """Test admin can update a word"""
        # Create a test word first
        create_res = requests.post(f"{BASE_URL}/api/words",
            json={"word": "TEST_UpdateWord", "meaning": "Original meaning"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        word_id = create_res.json()["id"]
        
        # Update it
        response = requests.put(f"{BASE_URL}/api/words/{word_id}",
            json={"meaning": "Updated meaning"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["meaning"] == "Updated meaning"
        print(f"✓ Admin updated word meaning")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/words/{word_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
    
    def test_admin_can_delete_word(self, admin_token):
        """Test admin can delete a word"""
        # Create a test word first
        create_res = requests.post(f"{BASE_URL}/api/words",
            json={"word": "TEST_DeleteWord", "meaning": "To be deleted"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        word_id = create_res.json()["id"]
        
        # Delete it
        response = requests.delete(f"{BASE_URL}/api/words/{word_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert response.json()["ok"] == True
        print(f"✓ Admin deleted word")
        
        # Verify it's gone
        words = requests.get(f"{BASE_URL}/api/words").json()
        word_ids = [w["id"] for w in words]
        assert word_id not in word_ids


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
