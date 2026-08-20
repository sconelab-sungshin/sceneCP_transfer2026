from PIL import Image
import os
import glob

def convert_folder_to_webp(folder_path, target_quality=50):
    png_files = glob.glob(os.path.join(folder_path, '*.png')) + \
                glob.glob(os.path.join(folder_path, '*.PNG'))

    if not png_files:
        print(f"⚠️ '{folder_path}' 안에서 png 파일을 찾지 못했습니다.")
        return

    print(f"[{os.path.basename(folder_path)}] 총 {len(png_files)}개의 png 파일을 변환합니다...")

    for image_path in sorted(png_files):
        new_path = image_path.rsplit('.', 1)[0] + '.webp'
        with Image.open(image_path) as img:
            img.save(new_path, "webp", quality=target_quality, method=6)

    print(f"🎉 [{os.path.basename(folder_path)}] 변환 완료!\n")

# --- 경로 설정 ---
output_base = r'C:\Users\박지윤\Documents\GitHub\sceneCP_transfer2026\stimuli'
folder_names = ['final_lighting7_set1_21x21', 'final_lighting7_set2_21x21', 'final_lighting7_set1_17x17','final_lighting7_set2_17x17']

# 실행 - 4개 폴더 순차 변환
for name in folder_names:
    convert_folder_to_webp(os.path.join(output_base, name), target_quality=50)