##### 1. pakage loading #####
library(jsonlite)  #JSON -> R dafatrame으로 읽기 위한 패키지
library(dplyr)
library(purr)      #이건 여러 파일 사용할 때 

##### 2. JSON파일 읽기 #####
json <- "C:/Users/박지윤/Documents/GitHub/sceneCP_transfer2026/demo_result_17.json"

json_raw <- fromJSON(json, flatten = TRUE)
#str(json_raw)
df  <- json_raw$data    #trial 기록들은 모두 "data" 항목에 들어있음 

##### 3. session devision #####
#세션1과 2의 경계 -> inst_session2
idx_session2 <- df$trial_index[which(df$disp_type == "inst_session2")]
#세션2와 3의 경계 -> inst_session3
idx_session3 <- df$trial_index[which(df$disp_type == "inst_session3")]
#세션3과 4의 경계 -> inst_session4 
idx_session4 <- df$trial_index[which(df$disp_type == "inst_session4")]
#세션2의 연습시행 3회구분하는 경계  
idx_pract2main <- df$trial_index[which(df$disp_type == "test_pract2main")]


##### 4. table 1 #####
session1 <- df %>%
  filter(disp_type == "learn_display") %>%
  filter(trial_index < idx_session2) %>%
  select(answer, correct, key_feature, position, response, rt, stim_coord, stim_idx)  %>%
  mutate(session = "session1_learning",
         space_size = "17x17") %>%
  mutate(across(where(is.list), ~ sapply(., function(x) if(length(x) == 0) NA else x[[1]])))

##### 5. table 2 #####
session2 <- df %>%
  filter(disp_type == "reconstruction") %>%
  filter(trial_index > idx_pract2main,        #연습시행 포함 안함 
         trial_index < idx_session3) %>%
  select(answer, answer_coord, key_feature, label, position, response, response_coord, search_rt, space_rotation) %>%
  mutate(session = "session2_reconstruction",
         space_size = "17x17") %>%
  mutate(across(where(is.list), ~ sapply(., function(x) if(length(x) == 0) NA else x[[1]])))

##### 6. table 3 #####
session3 <- df %>%
  filter(disp_type == "reconstruction") %>%
  filter(trial_index > idx_session3,
         trial_index < idx_session4) %>%
  select(answer, answer_coord, key_feature, label, position, response, response_coord, search_rt, space_rotation) %>%
  mutate(session = "session3_transfer_reconstruction",
         space_size = "17x17") %>%
  mutate(across(where(is.list), ~ sapply(., function(x) if(length(x) == 0) NA else x[[1]])))

##### 7. table 4 #####
session4 <- df %>%
  filter(disp_type == "learn_display") %>%
  filter(trial_index > idx_session4) %>%
  select(answer, correct, key_feature, position, response, rt, stim_coord, stim_idx) %>%
  mutate(session = "session4_transfer_learning",
         space_size = "17x17") %>%
  mutate(across(where(is.list), ~ sapply(., function(x) if(length(x) == 0) NA else x[[1]])))

##### 8. check #####
cat("session1 학습 시행 수:", nrow(session1), "\n")
cat("session2 재구성 시행 수:", nrow(session2), "\n")
cat("session3 전이재구성 시행 수:", nrow(session3), "\n")
cat("session4 전이학습 시행 수:", nrow(session4), "\n")

##### 9. trial_index 최종 테이블에서는 제거 #####
session1 <- session1 %>% select(-trial_index)
session2 <- session2 %>% select(-trial_index)
session3 <- session3 %>% select(-trial_index)
session4 <- session4 %>% select(-trial_index)

##### 10. save as CSV #####
save_dir <- "C:/Users/박지윤/Documents/GitHub/sceneCP_transfer2026"

write.csv(session1, "demo_session1_17.csv", row.names = FALSE)
write.csv(session2, "demo_session2_17.csv", row.names = FALSE)
write.csv(session3, "demo_session3_17.csv", row.names = FALSE)
write.csv(session4, "demo_session4_17.csv", row.names = FALSE)

##### 11. table check ##### 
View(session1)
View(session2)
View(session3)
View(session4)
