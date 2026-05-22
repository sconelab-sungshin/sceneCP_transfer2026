import os
import shutil

# ------------------------------------------------------------------ #
input_folders = [
    'stimuli/fix_bedroom_lighting13_set1',
    'stimuli/fix_bedroom_lighting13_set2',
    'stimuli/practice_bedroom_set2'
]
output_suffix = '_17x17'  #new folder name -> name_suffix
# ------------------------------------------------------------------ #

#25×25 cell_coord
cell_coord_25 = []
for y in range(-12, 13):
    for x in range(-12, 13):
        cell_coord_25.append(f"{x}_{y}")

#new cell_coord -> 21x21: (-10, 11), 19x19: (-9, 10), 17x17: (-8, 9)
cell_coord_new = []
for y in range(-8, 9):
    for x in range(-8, 9):
        cell_coord_new.append(f"{x}_{y}")

print(f"25x25 total: {len(cell_coord_25)}, new grid total: {len(cell_coord_new)}")

#mapping table 
mapping = {}
for new_idx, coord in enumerate(cell_coord_new):
    old_idx = cell_coord_25.index(coord)
    mapping[new_idx] = old_idx

mid = len(cell_coord_new) // 2
print(f"total mappings: {len(mapping)}")
print(f"ex: new index 0 ({cell_coord_new[0]}) → original index {mapping[0]}")
print(f"ex: new index {mid}({cell_coord_new[mid]}) → original index {mapping[mid]}")

for input_folder in input_folders:
    output_folder = input_folder + output_suffix
    os.makedirs(output_folder, exist_ok=True)
    print(f"\n processing: {input_folder} → {output_folder}")

    copied = 0
    missing = 0
    for new_idx, old_idx in mapping.items():
        old_filename = str(old_idx).zfill(6) + '.webp'
        new_filename = str(new_idx).zfill(6) + '.webp'
        old_path = os.path.join(input_folder, old_filename)
        new_path = os.path.join(output_folder, new_filename)

        if os.path.exists(old_path):
            shutil.copy2(old_path, new_path)
            copied += 1
        else:
            print(f"  missing file: {old_path}")
            missing += 1

    # 999999.webp copy 
    grey_src = os.path.join(input_folder, '999999.webp')
    grey_dst = os.path.join(output_folder, '999999.webp')
    if os.path.exists(grey_src):
        shutil.copy2(grey_src, grey_dst)
        print(f"  999999.webp copied")

    print(f"  completed: {copied}copied, {missing}missing")

print("\n all folders processed!")
