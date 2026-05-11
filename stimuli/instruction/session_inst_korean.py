import os
from PIL import Image, ImageDraw, ImageFont

def create_kor_instruction_with_bed():
    # 1. 배경 설정
    width, height = 1000, 667
    img = Image.new('RGB', (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # 2. 폰트 설정(기본 폰트)
    try:
        font_title = ImageFont.truetype("malgun.ttf", 40)  # 대제목
        font_sub = ImageFont.truetype("malgun.ttf", 22)    # 소제목
        font_main = ImageFont.truetype("malgun.ttf", 18)   # 일반 본문
        font_red = ImageFont.truetype("malgunbd.ttf", 20)  # 강조 (Bold)
    except:
        print("폰트를 찾을 수 없어 기본 폰트를 사용합니다.")
        font_title = font_sub = font_main = font_red = ImageFont.load_default()

    # 3. 텍스트 작성 (내용 전문) - 위치를 위쪽으로 약간 조정
    # [제목]
    draw.text((width//2, 20), "세션 1", fill=(0, 0, 0), font=font_title, anchor="mt")
    
    # [시나리오]
    draw.text((40, 80), "이어지는 시나리오:", fill=(0, 0, 0), font=font_sub)
    
    scenario_text = (
        "어제 저녁, 촬영 팀이 침실 사진들을 여러분의 팀으로 보냈습니다. 업무 효율을 높이기 위해,\n"
        "여러분의 팀에서는 해당 쇼룸 사진들을 2개의 세트로 나누어 2명의 디자이너가 동시에 보정 작업을 진행하기로 했습니다.\n"
        "여러분의 임무는 디자이너들에게 보낼 사진들을 2세트로 분류하는 것입니다."
    )
    draw.text((40, 115), scenario_text, fill=(0, 0, 0), font=font_main, spacing=8)

    # [중앙 샘플 이미지 삽입]
    sample_bed_path = r"C:\Users\박지윤\Documents\25-2 수업 자료\NeuroPsychLab\2026_sceneCP_transfer-main\sceneCP_transfer-main\stimuli\fix_bedroom_lighting13_set1\000313.png"
    
    try:
        # 이미지 열기
        bed_img = Image.open(sample_bed_path)
        
        # 원본 비율 유지하면서 크기 조절 (가로 250픽셀 정도로 설정)
        w_percent = (250 / float(bed_img.size[0]))
        h_size = int((float(bed_img.size[1]) * float(w_percent)))
        bed_img_resized = bed_img.resize((250, h_size), Image.Resampling.LANCZOS)
        
        # 이미지 붙여넣기 (중앙 위치 계산)
        img_x = (width // 2) - (bed_img_resized.size[0] // 2)
        img_y = 260 # 텍스트 아래 적절한 위치
        img.paste(bed_img_resized, (img_x, img_y))
        
        # 이미지 아래 안내 문구
        guide_text = "Set 1은 'e' 키를, Set 2는 'i' 키를 누르세요."
        draw.text((width//2, img_y + h_size + 15), guide_text, fill=(0, 0, 0), font=font_main, anchor="mt")
        
    except FileNotFoundError:
        print(f"이미지를 찾을 수 없습니다: {sample_bed_path}")
        # 이미지가 없으면 빈 박스 그리기
        draw.rectangle([375, 260, 625, 410], outline=(200, 200, 200), width=2)
    except Exception as e:
        print(f"이미지 로드 중 에러 발생: {e}")

    # [하단 설명] - 이미지 아래로 배치
    desc_text = "본 세션에서는 여러 장의 이미지가 하나씩 제시됩니다.\n각 이미지가 어떤 세트에 속하는지 결정해 주세요."
    draw.text((width//2, 480), desc_text, fill=(0, 0, 0), font=font_main, anchor="mm", align="center", spacing=8)

    # [빨간색 강조 텍스트]
    red_text = "최대한 빠르고 정확하게 응답해 주세요.\n2초 안에 응답하지 않으면 다음 이미지로 넘어갑니다."
    draw.text((width//2, 550), red_text, fill=(180, 0, 0), font=font_red, anchor="mm", align="center", spacing=6)

    # [마지막 문구]
    last_text = "총 5라운드 동안 120장의 이미지에 대해 과제를 수행하게 됩니다."
    draw.text((width//2, 610), last_text, fill=(0, 0, 0), font=font_main, anchor="mm")

    # 4. 저장
    save_path = "session1_kor_with_bed.png"
    img.save(save_path)
    print(f"한국어 안내문 생성이 완료되었습니다: {os.path.abspath(save_path)}")

if __name__ == "__main__":
    create_kor_instruction_with_bed()