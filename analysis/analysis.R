# ---- 1. configuration ---------------------------------------------------
data_dir <- "C:/Users/박지윤/Documents/GitHub/sceneCP_transfer2026/analysis" 

transfer_cutoff <- 0.65
#21
rounds_session1 <- c(27, 27, 26)
rounds_session2 <- c(23, 23, 23)
rounds_session3 <- c(23, 23, 23)
rounds_session4 <- c(24)
#17
rounds_session1 <- c(26, 26)
rounds_session2 <- c(19, 18)
rounds_session3 <- c(19, 18)
rounds_session4 <- c(24)

filename_session1 <- "session1_21.*\\.csv$"
filename_session2 <- "session2_21.*\\.csv$"
filename_session3 <- "session3_21.*\\.csv$"
filename_session4 <- "session4_21.*\\.csv$"

extract_subject_id <- function(filepath) {
  fname <- basename(filepath)
  id <- str_extract(fname, "(?<=21_)[0-9]+(?=\\.csv$)")
  if (is.na(id)) id <- "1"
  id
}


# ---- 2. helper functions -------------------------------------------------

read_session_files <- function(dir, pattern) {
  files <- list.files(dir, pattern = pattern, full.names = TRUE, recursive = TRUE)
  if (length(files) == 0) stop("No files matched pattern: ", pattern, " in ", dir)
  purrr::map_dfr(files, function(f) {
    df <- read_csv(f, show_col_types = FALSE)
    df$subject <- extract_subject_id(f)
    df
  })
}

#표준오차 계산 
se <- function(x) if (length(x) > 1) sd(x) / sqrt(length(x)) else 0

#라운드 나누기 
assign_round_by_counts <- function(df, counts) {
  df %>%
    group_by(subject) %>%
    group_modify(function(sub_df, key) {
      if (nrow(sub_df) != sum(counts)) {
        stop(sprintf(
          "Subject %s has %d trials, but expected %d (= %s). Check the raw data / rounds_* config.",
          key$subject, nrow(sub_df), sum(counts), paste(counts, collapse = "+")
        ))
      }
      sub_df$round <- rep(seq_along(counts), times = counts)
      sub_df
    }) %>%
    ungroup()
}

#자극스페이스 계산 
get_grid_size <- function(space_size_str) {
  as.numeric(str_extract(space_size_str, "^[0-9]+"))
}

# =============================================================================
# Learning performance
# =============================================================================
library(tidyr)
library(readr)
library(dplyr)
library(stringr)
library(purrr)
library(ggplot2)

## ---- A1. read & prep session1  ----
sess1 <- read_session_files(data_dir, filename_session1) %>%
  mutate(acc = as.numeric(correct == "correct")) %>%
  separate(stim_coord, into = c("g_stim_x", "g_stim_y"), sep = "_", 
           convert = TRUE, remove = FALSE) %>%
  assign_round_by_counts(rounds_session1)

## ---- A2. learning curve (rounds) ----
learning_curve <- sess1 %>%
  filter(correct != "late") %>%
  group_by(subject, round) %>%   #참가자별, 라운드별 
  summarise(acc = mean(acc), rt = median(rt), .groups = "drop") %>%  #정확도는 평균, rt는 중앙값 
  group_by(round) %>%  #다시 라운드별
  summarise(
    mean_acc = mean(acc), se_acc = se(acc),
    mean_rt  = mean(rt),  se_rt  = se(rt),
    n_subj   = n(),
    .groups = "drop"
  )

#정확도 그래프 
p_acc_round <- ggplot(learning_curve, aes(round, mean_acc)) +  #aes(x축,y축)
  geom_ribbon(aes(   #표준오차 그림자 영역 생성 
    ymin = mean_acc - se_acc, 
    ymax = mean_acc + se_acc), 
    alpha = .2) +  #투명도 0(투명)~1(불투명) 
  geom_line() + geom_point() +
  labs(x = "round", y = "Accuracy", title = "Learning curve accuracy") +
  theme_minimal()

#RT그래프 
p_rt_round <- ggplot(learning_curve, aes(round, mean_rt)) +
  geom_ribbon(aes(
    ymin = mean_rt - se_rt, 
    ymax = mean_rt + se_rt), 
    alpha = .2) +
  geom_line() + geom_point() +
  labs(x = "round", y = "median RT(ms)", title = "Learning curve RT") +
  theme_minimal()

## ---- A3. learning curve (distance from category boundary) ----
boundary_curve <- sess1 %>%
  filter(correct != "late") %>%
  group_by(subject, g_stim_x) %>%  #category-relevant한 x축을 사용 
  summarise(acc = mean(acc), rt = median(rt), .groups = "drop") %>%
  group_by(g_stim_x) %>%
  summarise(
    mean_acc = mean(acc), se_acc = se(acc),
    mean_rt  = mean(rt),  se_rt  = se(rt),
    n_subj   = n(),
    .groups = "drop"
  )

p_acc_boundary <- ggplot(boundary_curve, aes(g_stim_x, mean_acc)) +
  geom_ribbon(aes(
    ymin = mean_acc - se_acc, 
    ymax = mean_acc + se_acc), 
    alpha = .2) +
  geom_line() + geom_point() +
  geom_vline(                  #vertical line 범주경계
    xintercept = 0, 
    linetype = "dashed",       #점선으로 
    color = "red") +
  labs(x = "g_stim_x", y = "Accuracy", title = "Accuracy with category boundary") +
  theme_minimal()

p_rt_boundary <- ggplot(boundary_curve, aes(g_stim_x, mean_rt)) +
  geom_ribbon(aes(
    ymin = mean_rt - se_rt, 
    ymax = mean_rt + se_rt), 
    alpha = .2) +
  geom_line() + geom_point() +
  geom_vline(
    xintercept = 0, 
    linetype = "dashed", 
    color = "red") +
  labs(x = "g_stim_x", y = "median RT(ms)", title = "RT with category boundary") +
  theme_minimal()


## ---- A4. transfer-learning session success rate ----
sess4 <- read_session_files(data_dir, filename_session4) %>%
  mutate(acc = as.numeric(correct == "correct"))

#전이 성공한 참가자만 추출 
transfer_success <- sess4 %>%
  filter(correct != "late") %>%
  group_by(subject) %>%
  summarise(acc = mean(acc), .groups = "drop") %>%
  mutate(success = acc >= transfer_cutoff)

n_success <- sum(transfer_success$success)
n_total   <- nrow(transfer_success)
cat(sprintf(
  "Transfer learning: %d out of %d subject(s) successfully transferred",
  n_success, n_total
))

#데모 1개일 때 사용 
if (n_total == 1) {
  cat("  -> n = 1: reporting this subject's own pass/fail only, no good/bad group is formed.\n")
}


# =============================================================================
# Reconstruction error patterns (averaged across subjects)
# =============================================================================

prep_reconstruction <- function(df, rounds) {
  df %>%
    separate(answer_coord, into = c("ans_x", "ans_y"), sep = "_",
             convert = TRUE, remove = FALSE) %>%
    separate(response_coord, into = c("resp_x", "resp_y"), sep = "_",
             convert = TRUE, remove = FALSE) %>%  #answer,response_coord 둘다 좌표 분리
    assign_round_by_counts(rounds) %>%
    #좌표계 통일 
    mutate(
      grid_size   = get_grid_size(space_size),
      grid_center = (grid_size - 1) / 2,
      resp_x_conv = resp_x - grid_center,
      resp_y_conv = resp_y - grid_center,
      err_x = resp_x_conv - ans_x,
      err_y = resp_y_conv - ans_y,
      error_theta = atan2(err_y, err_x)   #오차벡터 각도, range -pi..pi
    )
}

sess2 <- read_session_files(data_dir, filename_session2) %>%
  prep_reconstruction(rounds_session2) %>%
  mutate(set = "Original learning set")

sess3 <- read_session_files(data_dir, filename_session3) %>%
  prep_reconstruction(rounds_session3) %>%
  mutate(set = "Transfer learning set")

recon_all <- bind_rows(sess2, sess3)

recon_avg <- recon_all %>%
  group_by(set, ans_x, ans_y) %>%
  summarise(
    err_x = mean(err_x),
    err_y = mean(err_y),
    error_theta = atan2(mean(err_y), mean(err_x)),
    grid_center = mean(grid_center),
    .groups = "drop"
  )

#그래프 만들기 
p_recon <- ggplot(recon_avg, aes(x = ans_x, y = ans_y)) +
  geom_segment(
    aes(xend = ans_x + err_x, yend = ans_y + err_y, color = error_theta),
    arrow = arrow(length = unit(0.15, "cm")), linewidth = 0.6
  ) +
  geom_vline(xintercept = 0, linetype = "dashed", color = "red", linewidth = 1) +
  scale_color_gradient2(
    low = "#3B8FC7", mid = "white", high = "#F0A93B",
    midpoint = 0, limits = c(-pi, pi), name = "error_theta"
  ) +
  facet_wrap(~set) +
  coord_fixed() +
  labs(x = "Category-relevant",
       y = "Category-irrelevant") +
  theme_minimal() +
  theme(
    panel.background = element_rect(fill = "grey40"),
    panel.grid = element_blank()
  )


# ---- 3. save & display outputs ------------------------------------------
out_dir <- "C:/Users/박지윤/Documents/GitHub/sceneCP_transfer2026/figures"
if (!dir.exists(out_dir)) dir.create(out_dir)

ggsave(file.path(out_dir, "learning_curve_accuracy_21.png"), p_acc_round, width = 5, height = 4)
ggsave(file.path(out_dir, "learning_curve_rt_21.png"),       p_rt_round,  width = 5, height = 4)
ggsave(file.path(out_dir, "boundary_accuracy_21.png"),       p_acc_boundary, width = 5, height = 4)
ggsave(file.path(out_dir, "boundary_rt_21.png"),             p_rt_boundary,  width = 5, height = 4)
ggsave(file.path(out_dir, "reconstruction_error_vectors_21.png"), p_recon, width = 9, height = 5)

print(p_acc_round)
print(p_rt_round)
print(p_acc_boundary)
print(p_rt_boundary)
print(p_recon)

