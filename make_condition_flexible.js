// [호출 예시] 
// var cond21 = make_condition_flexible(21, 'view', ['A','B'], 'set1', 5, 'set2');
// var cond19 = make_condition_flexible(19, 'view', ['A','B'], 'set1', 5, 'set2');
// var cond17 = make_condition_flexible(17, 'view', ['A','B'], 'set1', 5, 'set2');

function make_condition_flexible(
    space_size, relevant_ftr, random_cat_label, 
    learning_set, transfer_set, circle_on) {
    
    // 최대 스페이스 계산 ***************************************************************** //   
    // ..... 1. 학습 스페이스
    var grid_limit = 12 // (25x25로 고정; 실험 자극 후보군 중 가장 큰 스페이스)

    var learning_space = []
    var learning_limit = grid_limit - 1 // boundary를 빗겨나간 grid
    var learning_range = _.range(-learning_limit, learning_limit+1, 2)
    for(var y of learning_range){
        for(var x of learning_range){
            learning_space.push([x,y]);
        }        
    }
    // ..... 2. 표상 재구성 스페이스
    var recon_space = []
    var recon_limit = grid_limit // boundary 포함 grid
    var recon_range = _.range(-recon_limit, recon_limit+1, 2)
    for(var y of recon_range){
        for(var x of recon_range){
            recon_space.push([x,y]);
        }        
    }
    // ..... 3. 학습전이 확인 스페이스
    var trans_space = []
    var trans_limit = grid_limit - 1 // boundary 빗겨나간 grid(단 grid_limit 자체는 불포함하도록)
    var trans_range = _.range(-trans_limit, trans_limit+1, 2)
    for(var y of trans_range){
        for(var x of trans_range){
            trans_space.push([x,y]);
        }        
    }

    // 자극 좌표 계산 ***************************************************************** //

    // 현재 space_size에 맞게 조정 후, circle_on의 경우, 원 내부의 좌표만 선택
    function isInsideCircle(x, y, radius){
        return x*x + y*y <= radius*radius;
    }

    // 좌표 추출기
    function makeStimulusCoords(
        coord_list,
        coord_limit,
        boundary=0,
        circle_on=true,
        circle_radius,
        relevant_ftr 
    ){
        var out = {
            group1: [],
            group2: [], 
            boundary: []
        };

        var coord_filtered = coord_list.filter(([x, y]) => {
            return Math.abs(x) <= coord_limit && Math.abs(y) <= coord_limit;
        });

        coord_filtered.forEach(([x,y]) => {
            if(circle_on){
                if(!isInsideCircle(x,y,circle_radius)) {
                    return;
                }
            }

            if(relevant_ftr == 'view'){ // vertical boundary
                if(x < boundary){
                    out.group1.push(x+"_"+y);
                }
                else if(x > boundary){
                    out.group2.push(x+"_"+y);
                }
                else if(x == boundary){
                    out.boundary.push(x+"_"+y);
                }
            }
            if(relevant_ftr == 'lighting'){ // horizontal boundary
                if(y < boundary){
                    out.group1.push(x+"_"+y);
                }
                else if(y > boundary){
                    out.group2.push(x+"_"+y);
                }
                else if(y == boundary){
                    out.boundary.push(x+"_"+y);
                }
            }        

        });

        return out;
    }    

    // ..... 1. 전체 자극 스페이스 
    var space_limit = Math.floor(space_size/2)

    var space_coord = [];  
    for(var y = -space_limit; y <= space_limit; y++){
        for(var x = -space_limit; x <= space_limit; x++){
            space_coord.push(x + "_" + y);
        }        
    }

    var learning_coord = makeStimulusCoords(learning_space, space_limit, 0, circle_on, space_limit, relevant_ftr)
    var recon_coord = makeStimulusCoords(recon_space, space_limit-1, 0, circle_on, space_limit-1, relevant_ftr)

    // console.log(space_coord)
    // console.log(learning_coord)
    // console.log(recon_coord)   
    
    
    // cond화 시키기 *************************************************************************** //
    function makeTrialObjects(coord_obj, relevant_ftr, random_cat_label, stim_set_name) {
        var group_type = ["group1", "group2", "boundary"];
        var all_trials = [];

        group_type.forEach(g => {
            coord_obj[g].forEach(coord => {
                var [x, y] = coord.split("_").map(Number);                

                var idx = space_coord.indexOf(coord);

                all_trials.push({
                    key_feature: relevant_ftr,
                    position: g,
                    label: random_cat_label[_.indexOf(group_type, g)],
                    stim_coord: coord,
                    stim_idx: idx,
                    img_path: "stimuli/" + stim_set_name + "/" + ("000000" + idx).slice(-6) + ".webp"
                });
            });
        });

        return all_trials;
    }

    var learning_trials = makeTrialObjects(learning_coord, relevant_ftr, random_cat_label, learning_set)
    var recon_trials = makeTrialObjects(recon_coord, relevant_ftr, random_cat_label, learning_set)
    var trans_recon_trials = makeTrialObjects(recon_coord, relevant_ftr, random_cat_label, transfer_set)    

    // console.log(trans_trials)

    // 블록으로 나누기 *************************************************************************** //
    if(circle_on == true){
        if(space_size == 25){var n_block = 4}
        if(space_size == 21){var n_block = 3}
        if(space_size == 19){var n_block = 2}
        if(space_size == 17){var n_block = 2}
    }
    if(circle_on == false){
        if(space_size == 25){var n_block = 5}
        if(space_size == 21){var n_block = 4}
        if(space_size == 19){var n_block = 4}
        if(space_size == 17){var n_block = 2}
    }

    function splitTrialsByBoundaryDistance(trials, n_block, relevant_ftr, boundary = 0) {
        var by_dist = {};

        trials.forEach(trial => {
            var [x, y] = trial.stim_coord.split("_").map(Number);

            var dist;
            if (relevant_ftr == "view") {
                dist = Math.abs(x - boundary);
            } 
            else if (relevant_ftr == "lighting") {
                dist = Math.abs(y - boundary);
            }

            if (!(dist in by_dist)) {
                by_dist[dist] = [];
            }

            by_dist[dist].push(trial);
        });

        var blocked = {};
        var block_counts = {};

        for (var i = 1; i <= n_block; i++) {
            blocked["b" + i] = [];
            block_counts["b" + i] = 0;
        }

        Object.keys(by_dist)
            .map(Number)
            .sort((a, b) => b - a)
            .forEach(dist => {
                var trials_this_dist = _.shuffle(by_dist[dist]);

                trials_this_dist.forEach(trial => {
                    var min_block = "b1";

                    for (var i = 2; i <= n_block; i++) {
                        var r = "b" + i;
                        if (block_counts[r] < block_counts[min_block]) {
                            min_block = r;
                        }
                    }

                    blocked[min_block].push(trial);
                    block_counts[min_block]++;
                });
            });

        return blocked;
    }

    var learning_cond = splitTrialsByBoundaryDistance(
        learning_trials,
        n_block,
        relevant_ftr,
        0
    );
    var recon_cond = splitTrialsByBoundaryDistance(
        recon_trials,
        n_block,
        relevant_ftr,
        0
    );
    var trans_recon_cond = splitTrialsByBoundaryDistance(
        trans_recon_trials,
        n_block,
        relevant_ftr,
        0
    );    

    // transfer learning ************************************************************************* //
    function makeTransLearningCoord(learning_coord, relevant_ftr) {
        var rel_values = {
            group1: [-7, -5, -3],
            group2: [3, 5, 7]
        };

        var irrel_values = [-3, -1, 1, 3];

        var out = {
            group1: [],
            group2: [],
            boundary: []
        };

        ["group1", "group2"].forEach(g => {
            learning_coord[g].forEach(coord => {
                var [x, y] = coord.split("_").map(Number);

                var relevant_value;
                var irrelevant_value;

                if (relevant_ftr == "view") {
                    relevant_value = x;
                    irrelevant_value = y;
                } 
                else if (relevant_ftr == "lighting") {
                    relevant_value = y;
                    irrelevant_value = x;
                }

                if (
                    rel_values[g].includes(relevant_value) &&
                    irrel_values.includes(irrelevant_value)
                ) {
                    out[g].push(coord);
                }
            });
        });

        return out;
    }
    var trans_learning_coord = makeTransLearningCoord(
        learning_coord,
        relevant_ftr
    );

    var trans_learning_trials = makeTrialObjects(trans_learning_coord, relevant_ftr, random_cat_label, transfer_set)
    var trans_learning_cond = splitTrialsByBoundaryDistance(
        trans_learning_trials,
        1,
        relevant_ftr,
        0
    ); 

    console.log(trans_learning_cond)
    

    return {
        learning: learning_cond,
        memory: recon_cond,
        transfer_learning: trans_learning_cond,
        transfer_memory: trans_recon_cond, 
        n_block: n_block
    };
}