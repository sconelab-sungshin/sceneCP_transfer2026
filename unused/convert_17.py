import os
import glob

def delete_png_if_webp_exists(folder_path):
    png_files = glob.glob(os.path.join(folder_path, '*.png')) + \
                glob.glob(os.path.join(folder_path, '*.PNG'))

    deleted = 0
    skipped = 0
    for png_path in png_files:
        webp_path = png_path.rsplit('.', 1)[0] + '.webp'
        if os.path.exists(webp_path):
            os.remove(png_path)
            deleted += 1
        else:
            print(f"⚠️ webp 없음, 삭제 건너뜀: {os.path.basename(png_path)}")
            skipped += 1

    print(f"🗑️ {folder_path}\n   삭제: {deleted}개 / 건너뜀: {skipped}개\n")

# --- 실행 ---
folder_path = r'C:\Users\박지윤\Documents\GitHub\sceneCP_transfer2026\stimuli\final_lighting7_set1_21x21'
delete_png_if_webp_exists(folder_path)