// [호출 예시] 
// var cond21 = make_condition_flexible(21, 'view', ['A','B'], 'set1', 5, 'set2');
// var cond19 = make_condition_flexible(19, 'view', ['A','B'], 'set1', 5, 'set2');
// var cond17 = make_condition_flexible(17, 'view', ['A','B'], 'set1', 5, 'set2');

function make_condition_flexible(grid_size, relevant_ftr, random_cat_label, learning_set, n_round, transfer_set) {
    
    // 1. 격자 크기에 따른 좌표 한계값 계산
    var grid_limit = Math.floor(grid_size / 2);
    
    var cell_coord = [];  
    for(var y = -grid_limit; y <= grid_limit; y++){
        for(var x = -grid_limit; x <= grid_limit; x++){
            cell_coord.push(x + "_" + y);
        }        
    }

    // 2. 격자 크기별 최적의 반지름 자동 산출 (자극 밀도 보존용)
    // 21일 때 9.5, 19일 때 8.5, 17일 때 7.5로 비례 제어
    var LEARNING_RADIUS = grid_limit - 0.5; 
    var TRANSFER_RADIUS = LEARNING_RADIUS - 2.0; // 기존 스케일 격차 유지
    var TEST_RADIUS     = LEARNING_RADIUS - 1.0;

    // 3. 동적 원형 좌표 추출기
    function getCircularIrrelevantFeatures(relevant_indices, max_radius) {
        return relevant_indices.map(function(val) {
            var max_opposite = Math.sqrt(Math.pow(max_radius, 2) - Math.pow(val, 2));
            var limit = Math.floor(max_opposite);
            
            // 격자 내 홀수/짝수 일관성 유지 (2씩 건너뛰기)
            var start = (val % 2 === 0) ? -Math.floor(limit / 2) * 2 : -Math.floor((limit - 1) / 2) * 2 - 1;
            
            var arr = [];
            for (var i = start; i <= limit; i += 2) {
                if (i >= -limit) arr.push(i);
            }
            return arr;
        });
    }

    // Learning condition -------------------------------------------------------------- //

    // 시작점 자동 계산 (21이면 -9부터, 19&17이면 -7부터 시작)
    var start_idx = (grid_size === 21) ? -9 : -7;

    var relevant_ftr_idx = { 
        group1: _.range(start_idx, 0, 2), 
        group2: _.range(-start_idx, 0, -2)
    }; 

    var irrelevant_ftr_idx = {  
        group1: getCircularIrrelevantFeatures(relevant_ftr_idx.group1, LEARNING_RADIUS),
        group2: getCircularIrrelevantFeatures(relevant_ftr_idx.group2, LEARNING_RADIUS)        
    };    
    
    var learning_stim = {
        group1: Array.from({length: relevant_ftr_idx.group1.length}, () => []), 
        group2: Array.from({length: relevant_ftr_idx.group2.length}, () => [])
    };

    if(relevant_ftr == 'view'){   
        for(var i=0; i<relevant_ftr_idx.group1.length; i++){
            for(var j=0; j<irrelevant_ftr_idx.group1[i].length; j++){
                learning_stim.group1[i].push(relevant_ftr_idx.group1[i]+'_'+irrelevant_ftr_idx.group1[i][j])
            }            
        }
        for(var i=0; i<relevant_ftr_idx.group2.length; i++){
            for(var j=0; j<irrelevant_ftr_idx.group2[i].length; j++){
                learning_stim.group2[i].push(relevant_ftr_idx.group2[i]+'_'+irrelevant_ftr_idx.group2[i][j])
            }
        }
    } else if(relevant_ftr == 'wood'){ 
        for(var i=0; i<relevant_ftr_idx.group1.length; i++){
            for(var j=0; j<irrelevant_ftr_idx.group1[i].length; j++){
                learning_stim.group1[i].push(irrelevant_ftr_idx.group1[i][j]+'_'+relevant_ftr_idx.group1[i]) 
            }
        }
        for(var i=0; i<relevant_ftr_idx.group2.length; i++){
            for(var j=0; j<irrelevant_ftr_idx.group2[i].length; j++){
                learning_stim.group2[i].push(irrelevant_ftr_idx.group2[i][j]+'_'+relevant_ftr_idx.group2[i])
            }
        }
    }

    var rounded_learning_stim = {
        group1: {r1:[], r2:[], r3:[], r4:[], r5:[]}, 
        group2: {r1:[], r2:[], r3:[], r4:[], r5:[]}
    };
    var group_type = ['group1','group2'];    
    var dist_range = _.range(learning_stim.group1.length);
    var round_num = _.range(n_round);

    for (var g of group_type){
        var remain_learning_stim = [];
        for(var d of dist_range){
            var n_sample_perDist = Math.floor(learning_stim[g][d].length/n_round);
            var shuffled_stim_perDist = _.shuffle(learning_stim[g][d]);     
            var chunked_stim_perDist = _.chunk(shuffled_stim_perDist, n_sample_perDist);
            for(var r of round_num){
                rounded_learning_stim[g]['r'+(r+1)].push(chunked_stim_perDist[r]);
            }
            remain_learning_stim.push(chunked_stim_perDist.slice(r+1, chunked_stim_perDist.length));
        }
        remain_learning_stim = _.shuffle(remain_learning_stim.flat(Infinity))
        var chunked_remain_stim = _.chunk(remain_learning_stim, 2);
        for(var r of round_num){
            rounded_learning_stim[g]['r'+(r+1)].push(chunked_remain_stim[r]);
            rounded_learning_stim[g]['r'+(r+1)] = rounded_learning_stim[g]['r'+(r+1)].flat();      
        }
    }
        
    var learning_cond = { r1:[], r2:[], r3:[], r4:[], r5:[] };
    var current_key_ftr = (typeof key_feature !== 'undefined') ? key_feature : relevant_ftr;

    for (var r of round_num){
        for(var g of group_type){
            for(var i=0; i<rounded_learning_stim[g]['r'+(r+1)].length; i++){
                var coord = rounded_learning_stim[g]['r'+(r+1)][i];
                var idx = cell_coord.indexOf(coord);
                if(idx === -1) continue;

                learning_cond['r'+(r+1)].push({
                    key_feature: current_key_ftr,     
                    position: g,
                    label: random_cat_label[_.indexOf(group_type, g)],
                    stim_coord: coord,
                    stim_idx: idx,
                    img_path: 'stimuli/'+learning_set+'/'+('000000'+idx).slice(-6)+'.webp'
                });
            }
        }
    }

    // Transfer learning condition ---------------------------------------------------------------------- //

    // 스페이스 축소에 따른 전이 자극 범위 자동 비례 축소
    var trans_start = (grid_size === 21) ? -7 : -7; // 기존 설계 스케일 매칭
    var trans_end = (grid_size === 21) ? -2 : -2;

    var relevant_ftr_idx_trans = { 
        group1: _.range(trans_start, trans_end, 2), 
        group2: _.range(-trans_start, -trans_end, -2)   
    }; 
    
    var irrelevant_ftr_idx_trans = { 
        group1: getCircularIrrelevantFeatures(relevant_ftr_idx_trans.group1, TRANSFER_RADIUS),
        group2: getCircularIrrelevantFeatures(relevant_ftr_idx_trans.group2, TRANSFER_RADIUS) 
    };

    var transfer_stim = { group1: [], group2: [] };
    if(relevant_ftr == 'view'){ 
        for(var i=0; i<relevant_ftr_idx_trans.group1.length; i++){
            for(var j=0; j<irrelevant_ftr_idx_trans.group1[i].length; j++){
                transfer_stim.group1.push(relevant_ftr_idx_trans.group1[i]+'_'+irrelevant_ftr_idx_trans.group1[i][j])
            }            
        }
        for(var i=0; i<relevant_ftr_idx_trans.group2.length; i++){
            for(var j=0; j<irrelevant_ftr_idx_trans.group2[i].length; j++){
                transfer_stim.group2.push(relevant_ftr_idx_trans.group2[i]+'_'+irrelevant_ftr_idx_trans.group2[i][j])
            }
        }
    } else if(relevant_ftr == 'wood'){
        for(var i=0; i<relevant_ftr_idx_trans.group1.length; i++){
            for(var j=0; j<irrelevant_ftr_idx_trans.group1[i].length; j++){
                transfer_stim.group1.push(irrelevant_ftr_idx_trans.group1[i][j]+'_'+relevant_ftr_idx_trans.group1[i])
            }
        }
        for(var i=0; i<relevant_ftr_idx_trans.group2.length; i++){
            for(var j=0; j<irrelevant_ftr_idx_trans.group2[i].length; j++){
                transfer_stim.group2.push(irrelevant_ftr_idx_trans.group2[i][j]+'_'+relevant_ftr_idx_trans.group2[i])
            }
        }
    }

    var trans_learning_cond = [];
    var max_trans_len = Math.max(transfer_stim.group1.length, transfer_stim.group2.length);
    for(var i=0; i<max_trans_len; i++){       
        if (transfer_stim.group1[i]) {
            var idx1 = cell_coord.indexOf(transfer_stim.group1[i]);
            if(idx1 !== -1) {
                trans_learning_cond.push({
                    key_feature: current_key_ftr,
                    position: 'group1',
                    label: random_cat_label[0],
                    stim_coord: transfer_stim.group1[i],
                    stim_idx: idx1,
                    img_path: 'stimuli/'+transfer_set+'/'+('000000'+idx1).slice(-6)+'.webp'
                });
            }
        }
        if (transfer_stim.group2[i]) {
            var idx2 = cell_coord.indexOf(transfer_stim.group2[i]);
            if(idx2 !== -1) {
                trans_learning_cond.push({
                    key_feature: current_key_ftr,
                    position: 'group2',
                    label: random_cat_label[1],
                    stim_coord: transfer_stim.group2[i],
                    stim_idx: idx2,
                    img_path: 'stimuli/'+transfer_set+'/'+('000000'+idx2).slice(-6)+'.webp'
                });
            }
        }
    }

    // Test condition ----------------------------------------------------------------------------------- //

    // 격자 크기에 맞춰 테스트용 한계값 자동 스케일링
    var test_limit = (grid_size === 21) ? 10 : 8;

    var nkf_testing_idx = {  
        group1: _.range(-test_limit, test_limit + 1, 2), 
        boundary: _.range(-8, 9, 4), 
        group2: _.range(-test_limit, test_limit + 1, 2)
    };

    var kf_testing_idx = {
        group1: getCircularIrrelevantFeatures(nkf_testing_idx.group1, TEST_RADIUS),
        boundary: nkf_testing_idx.boundary.map(() => [0]), 
        group2: getCircularIrrelevantFeatures(nkf_testing_idx.group2, TEST_RADIUS)
    };

    var testing_stim = {group1: [], boundary: [], group2: []};    
    for (var i=0; i<nkf_testing_idx.group1.length; i++){
        for (var j=0; j<kf_testing_idx.group1[i].length; j++){
            if(current_key_ftr == 'view'){
                testing_stim.group1.push(kf_testing_idx.group1[i][j]+'_'+nkf_testing_idx.group1[i])
            } else if(current_key_ftr == 'wood'){
                testing_stim.group1.push(nkf_testing_idx.group1[i]+'_'+kf_testing_idx.group1[i][j])
            }            
        }       
        for (var j=0; j<kf_testing_idx.group2[i].length; j++){
            if(current_key_ftr == 'view'){
                testing_stim.group2.push(kf_testing_idx.group2[i][j]+'_'+nkf_testing_idx.group2[i])
            } else if(current_key_ftr == 'wood'){
                testing_stim.group2.push(nkf_testing_idx.group2[i]+'_'+kf_testing_idx.group2[i][j])
            }            
        }
    }
    for(var i=0; i<nkf_testing_idx.boundary.length; i++){
        for (var j=0; j<kf_testing_idx.boundary[i].length; j++){
            if(current_key_ftr == 'view'){
                testing_stim.boundary.push(kf_testing_idx.boundary[i][j]+'_'+nkf_testing_idx.boundary[i])
            } else if(current_key_ftr == 'wood'){
                testing_stim.boundary.push(nkf_testing_idx.boundary[i]+'_'+kf_testing_idx.boundary[i][j])
            }            
        }
    }
    
    var current_cat_label = (typeof cat_label !== 'undefined') ? cat_label : random_cat_label;
    var testing_cond = [];    

    // 일괄적인 매핑 자동화 (오류 방지)
    var target_types = ['group1', 'group2', 'boundary'];
    target_types.forEach(function(type, t_idx) {
        var current_label = (type === 'boundary') ? 'boundary' : current_cat_label[t_idx];
        for(var i=0; i<testing_stim[type].length; i++){
            var idx = cell_coord.indexOf(testing_stim[type][i]);
            if(idx === -1) continue;
            testing_cond.push({
                key_feature: current_key_ftr,
                position: type,
                label: current_label,
                stim_coord: testing_stim[type][i],
                stim_idx: idx,
                space_path: 'stimuli/'+learning_set+'/',
                img_path: 'stimuli/'+learning_set+'/'+('000000'+idx).slice(-6)+'.webp'
            });
        }
    });
    testing_cond = testing_cond.concat(testing_cond, testing_cond);
    
    var transfer_cond = [];    
    target_types.forEach(function(type, t_idx) {
        var current_label = (type === 'boundary') ? 'boundary' : current_cat_label[t_idx];
        for(var i=0; i<testing_stim[type].length; i++){
            var idx = cell_coord.indexOf(testing_stim[type][i]);
            if(idx === -1) continue;
            transfer_cond.push({
                key_feature: current_key_ftr,
                position: type,
                label: current_label,
                stim_coord: testing_stim[type][i],
                stim_idx: idx,
                space_path: 'stimuli/'+transfer_set+'/', 
                img_path: 'stimuli/'+transfer_set+'/'+('000000'+idx).slice(-6)+'.webp'
            });
        }
    });
    transfer_cond = transfer_cond.concat(transfer_cond, transfer_cond);

    return {
        learning: learning_cond,
        memory: testing_cond,
        transfer_learning: trans_learning_cond,
        transfer_memory: transfer_cond
    };
}