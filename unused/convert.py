from PIL import Image

def convert_single_to_webp(image_path, target_quality=50):
    new_path = image_path.rsplit('.', 1)[0] + '.webp'
    
    with Image.open(image_path) as img:
        img.save(new_path, "webp", quality=target_quality, method=6)
    
    print(f"✅ 변환 완료: {new_path}")

# --- 경로 설정 ---
image1 = r'C:\Users\박지윤\Documents\GitHub\sceneCP_transfer2026\stimuli\practice_bedroom1.jpeg'
image2 = r'C:\Users\박지윤\Documents\GitHub\sceneCP_transfer2026\stimuli\practice_bedroom2.jpeg'

# 실행
convert_single_to_webp(image1, target_quality=50)
convert_single_to_webp(image2, target_quality=50)