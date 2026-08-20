import os
import shutil

def crop_and_reindex(source_folder, output_base, source_ext='.png'):
    """
    25x25 space 2개(총 1250장)를 21x21, 17x17로 center-crop 하고
    set1_21x21 / set1_17x17 / set2_21x21 / set2_17x17 폴더에 재인덱싱하여 저장.
    """
    ORIGINAL_SIZE = 25
    TARGET_SIZES = [21, 17]
    SPACES = {
        'set1': 0,        # space1: index 0 ~ 624
        'set2': ORIGINAL_SIZE * ORIGINAL_SIZE  # space2: index 625 ~ 1249
    }

    for set_name, base_offset in SPACES.items():
        for target_size in TARGET_SIZES:
            # 25x25 중심 기준 크롭 offset (예: 21이면 2, 17이면 4)
            crop_offset = (ORIGINAL_SIZE - target_size) // 2

            out_folder = os.path.join(output_base, f'{set_name}_{target_size}x{target_size}')
            os.makedirs(out_folder, exist_ok=True)

            copied = 0
            for row in range(target_size):
                for col in range(target_size):
                    # 원본 25x25 좌표계에서의 row, col
                    orig_row = row + crop_offset
                    orig_col = col + crop_offset
                    orig_index = base_offset + orig_row * ORIGINAL_SIZE + orig_col

                    src_filename = f"{orig_index:06d}{source_ext}"
                    src_path = os.path.join(source_folder, src_filename)

                    if not os.path.exists(src_path):
                        print(f"⚠️ 원본 파일 없음: {src_path}")
                        continue

                    # 새 grid 기준 재인덱싱 (0 ~ target_size*target_size - 1)
                    new_index = row * target_size + col
                    dst_filename = f"{new_index:06d}{source_ext}"
                    dst_path = os.path.join(out_folder, dst_filename)

                    shutil.copy2(src_path, dst_path)
                    copied += 1

            print(f"✅ {set_name}_{target_size}x{target_size}: {copied}/{target_size*target_size}장 저장 완료 → {out_folder}")

# --- 경로 설정 ---
source_folder = r'C:\Users\박지윤\Documents\GitHub\sceneCP_transfer2026\stimuli\final_lighting7_-0.6to0.4'
output_base   = r'C:\Users\박지윤\Documents\GitHub\sceneCP_transfer2026\stimuli'

# 실행
crop_and_reindex(source_folder, output_base, source_ext='.png')