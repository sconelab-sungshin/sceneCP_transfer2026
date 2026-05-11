//5개의 변수를 만듬. 
//relevant_ftr -> wood, view / random -> 자른 후에 어디를 A, B로 / learning -> 불켜진 거 아닌거 / transfer -> 1에서 런, 2에서 런된게 불꺼진거로 전이되는지 보기(어떤 사람에게는 불켜진게 전이, 불 꺼진게 전이된 자극)
//얼만큼 무선화를 해야 하나 고민해보기

function make_condition(relevant_ftr, random_cat_label, learning_set, n_round, transfer_set) {
//어떤 feature로 category 를 나눌지, 어떤 이미지 세트를 쓸지 결정

    /**
     * This script makes the experiment conditions for learning & test sessions.
     * (See stimulus configuration in Methods.)
     * Two category groups were divided either by horizontal or vertical linear boundary.
     * Category labels (left or right wings) were randomly assigned to those groups.
     */  
       
    
    // Preparing the base cell coord ---------------------------------------------------- //
    // var cell_coord = [];  //coordinate 12인거는 중간부분만 가져온 것, 이미지의 위치(좌표)를 (x+"_"+y)이렇게 문자열로 표헌함.
    // for(var y=-12; y<=12; y++){
    //     for(x=-12; x<=12; x++){
    //         cell_coord.push(x+"_"+y);
    //     }        
    // };

    //20바이20으로 수정 
    var cell_coord = [];  
    for(var y=-12; y<=12; y++){
        for(x=-12; x<=12; x++){
            cell_coord.push(x+"_"+y);
        }        
    };

    //2D공간 좌표 생성, x y가 -12부터 12까지 움직임 > 25x25=625개의 좌표
    //x,y좌표 -> -12_-12, -11_-12, ..., 12_12
    //x축이 lighting, y축이 wood로 해서 이미지 하나를 좌표 하나로 만듦.


    // Learning condition -------------------------------------------------------------- //

    // simuli coordinate in each feature dimension
    var relevant_ftr_idx = { // relevant feature index 얘는 자른 축에 직교하는 축을 말한다, 그래야 두 group사이 차이를 봄.
        group1: _.range(-11,0,2), //-11부터 0까지 2간격 > -11,-9,-7,-5,-3,-1
        group2: _.range(11,0,-2)  //0을 기준으로 양쪽에 그룹이 생성됨 > 11,9,7,5,3,1
    }; 
    var irrelevant_ftr_idx = { // irrelevant feature index > 카테고리랑 상관 없는 축, 원처럼 만듦
        group1:[
            _.range(-5, 6, 2), _.range(-7, 8, 2), _.range(-9, 10,2),
            _.range(-11,12,2), _.range(-11,12,2), _.range(-11,12,2)
        ],
        group2:[
            _.range(-5, 6, 2), _.range(-7, 8,2), _.range(-9,10,2),
            _.range(-11,12,2), _.range(-11,12,2), _.range(-11,12,2)
        ]        
    };    
    
    // combining 
    var learning_stim = {
        group1: [[],[],[],[],[],[]], // # of sub-array = distance ragne (-11,-9,-7,-5,-3,-1)
        group2: [[],[],[],[],[],[]]
    };
    if(relevant_ftr == 'view'){ //여기 view로 바꾸기  
        // group 1
        for(i=0; i<relevant_ftr_idx.group1.length; i++){
            for(j=0; j<irrelevant_ftr_idx.group1[i].length; j++){
                learning_stim.group1[i].push(relevant_ftr_idx.group1[i]+'_'+irrelevant_ftr_idx.group1[i][j]) //X쪽에 relevant red, Y축에 ir
            }            
        }
        // group 2
        for(i=0; i<relevant_ftr_idx.group2.length; i++){
            for(j=0; j<irrelevant_ftr_idx.group2[i].length; j++){
                learning_stim.group2[i].push(relevant_ftr_idx.group2[i]+'_'+irrelevant_ftr_idx.group2[i][j]) //애네도 같음
            }
        }
    }else if(relevant_ftr == 'wood'){ //얘는 가만두기
        // group1
        for(i=0; i<relevant_ftr_idx.group1.length; i++){
            for(j=0; j<irrelevant_ftr_idx.group1[i].length; j++){
                learning_stim.group1[i].push(irrelevant_ftr_idx.group1[i][j]+'_'+relevant_ftr_idx.group1[i]) 
            }
        }
        // group2
        for(i=0; i<relevant_ftr_idx.group2.length; i++){
            for(j=0; j<irrelevant_ftr_idx.group2[i].length; j++){
                learning_stim.group2[i].push(irrelevant_ftr_idx.group2[i][j]+'_'+relevant_ftr_idx.group2[i])
            }
        }
    }

    // assigning coordinate equally to n rounds (based on distance from boundary)    
    var rounded_learning_stim = {
        group1: {r1:[], r2:[], r3:[], r4:[], r5:[]}, 
        group2: {r1:[], r2:[], r3:[], r4:[], r5:[]}
    };
    var group_type = ['group1','group2'];    
    var dist_range = _.range(learning_stim.group1.length);
    var round_num = _.range(n_round);

    //여기서 고민해볼 것 -> 여기서는 자극을 1번씩 보여줌. 지금은 참가자 바꼈으니까 learning performance 보고 고치기 (ex. 10회)
    for (g of group_type){
        // ____ assign stimuli of each distance to the round by equal number
        var remain_learning_stim = []; // array to hold unassigned stimuli before reassigning
        for(d of dist_range){
            var n_sample_perDist = Math.floor(learning_stim[g][d].length/n_round);
            var shuffled_stim_perDist = _.shuffle(learning_stim[g][d]);     
            var chunked_stim_perDist = _.chunk(shuffled_stim_perDist, n_sample_perDist);
            for(r of round_num){
                rounded_learning_stim[g]['r'+(r+1)].push(chunked_stim_perDist[r]);
            }
            remain_learning_stim.push(chunked_stim_perDist.slice(r+1, chunked_stim_perDist.length));
        }
        // ____ assign the remaining stim to the round by 2 (euqual number)
        remain_learning_stim = _.shuffle(remain_learning_stim.flat(Infinity))
        var chunked_remain_stim = _.chunk(remain_learning_stim, 2);
        for(r of round_num){
            rounded_learning_stim[g]['r'+(r+1)].push(chunked_remain_stim[r]);
            rounded_learning_stim[g]['r'+(r+1)] = rounded_learning_stim[g]['r'+(r+1)].flat();      
        }
    }
        
    // write in the list with other conditions 
    //condition matrix -> tag형식 
    var learning_cond = {
        r1:[], r2:[], r3:[], r4:[], r5:[]
    };
    for (r of round_num){
        for(g of group_type){
            for(i=0; i<rounded_learning_stim[g]['r'+(r+1)].length; i++){
                learning_cond['r'+(r+1)].push({
                    key_feature: key_feature,    //핵심 특징 종류 
                    position: g,                 //group1 or 2
                    label: random_cat_label[_.indexOf(group_type, g)],     //실제 정답 라벨(A/B)
                    stim_coord: rounded_learning_stim[g]['r'+(r+1)][i],    //"x_y" 좌표
                    stim_idx: cell_coord.indexOf(rounded_learning_stim[g]['r'+(r+1)][i]),    //전체 625개 중 몇 번째 인덱스인지
                    //img_path: 'stimuli/'+learning_set+'/'+('000000'+cell_coord.indexOf(rounded_learning_stim[g]['r'+(r+1)][i])).slice(-6)+'.webp'  //이미지 파일 경로
                    img_path: 'stimuli/'+
                               ((key_feature == 'lighting' && g == 'group2') ? transfer_set: learning_set) +
                               '/' + ('000000' + cell_coord.indexOf(rounded_learning_stim[g]['r'+(r+1)][i])).slice(-6)+'.webp'
                });

            }
        }
    }

    // Transfer learning condition ---------------------------------------------------------------------- //
    //위랑 같은 작업, 좌표만 다름
    //매우 적은 수 -> range줄음 

    var relevant_ftr_idx = { // relevant feature index
        group1: _.range(-9,-4,2),
        group2: _.range(9,4,-2)
    }; 
    var irrelevant_ftr_idx = { // irf feature index
        group1: _.range(-2,3,2),
        group2: _.range(-2,3,2) 
    };
    var transfer_stim ={
        group1: [], group2: []
    }
    if(relevant_ftr == 'view'){ // combine them into coords
        // group 1
        for(i=0; i<relevant_ftr_idx.group1.length; i++){
            for(j=0; j<irrelevant_ftr_idx.group1.length; j++){
                transfer_stim.group1.push(relevant_ftr_idx.group1[i]+'_'+irrelevant_ftr_idx.group1[j])
            }            
        }
        // group 2
        for(i=0; i<relevant_ftr_idx.group2.length; i++){
            for(j=0; j<irrelevant_ftr_idx.group2.length; j++){
                transfer_stim.group2.push(relevant_ftr_idx.group2[i]+'_'+irrelevant_ftr_idx.group2[j])
            }
        }
    }else if(relevant_ftr == 'wood'){
        // group1
        for(i=0; i<relevant_ftr_idx.group1.length; i++){
            for(j=0; j<irrelevant_ftr_idx.group1.length; j++){
                transfer_stim.group1.push(irrelevant_ftr_idx.group1[j]+'_'+relevant_ftr_idx.group1[i])
            }
        }
        // group2
        for(i=0; i<relevant_ftr_idx.group2.length; i++){
            for(j=0; j<irrelevant_ftr_idx.group2.length; j++){
                transfer_stim.group2.push(irrelevant_ftr_idx.group2[j]+'_'+relevant_ftr_idx.group2[i])
            }
        }
    }
    var trans_learning_cond = [];
    for(i=0; i<transfer_stim.group1.length; i++){       
        trans_learning_cond.push({
            key_feature: key_feature,
            position: 'group1',
            label: random_cat_label[0],
            stim_coord: transfer_stim.group1[i],
            stim_idx: cell_coord.indexOf(transfer_stim.group1[i]),
            img_path: 'stimuli/'+transfer_set+'/'+('000000'+cell_coord.indexOf(transfer_stim.group1[i])).slice(-6)+'.webp'
        });
        trans_learning_cond.push({
            key_feature: key_feature,
            position: 'group2',
            label: random_cat_label[1],
            stim_coord: transfer_stim.group2[i],
            stim_idx: cell_coord.indexOf(transfer_stim.group2[i]),
            img_path: 'stimuli/'+transfer_set+'/'+('000000'+cell_coord.indexOf(transfer_stim.group2[i])).slice(-6)+'.webp'
        });
    }

    // Test condition ----------------------------------------------------------------------------------- //

    // stimulus coordinate in each feature
    //boundary위의 자극도 보려고 함
    var kf_testing_idx = {
        group1: [[-6,-2],[-8,-4],[-10,-6,-2],[-8,-4],[-10,-6,-2],[-8,-4],[-10,-6,-2],[-8,-4],[-10,-6,-2],[-8,-4],[-6,-2]],
        boundary: [[0],[0],[0],[0],[0]],
        group2:[[2,6],[4,8],[2,6,10],[4,8],[2,6,10],[4,8],[2,6,10],[4,8],[2,6,10],[4,8],[2,6]]
    };
    var nkf_testing_idx = {
        group1: _.range(-10,11,2), 
        boundary: _.range(-8,9,4), 
        group2: _.range(-10,11,2)
    };

    // combine coords
    var testing_stim = {group1: [], boundary: [], group2: []};    
    for (i=0; i<nkf_testing_idx.group1.length; i++){
        // group1
        for (j=0; j<kf_testing_idx.group1[i].length; j++){
            //수정1: group1, 2 모두 lighting -> view
            if(key_feature == 'view'){
                testing_stim.group1.push(kf_testing_idx.group1[i][j]+'_'+nkf_testing_idx.group1[i])
            } else if(key_feature == 'wood'){
                testing_stim.group1.push(nkf_testing_idx.group1[i]+'_'+kf_testing_idx.group1[i][j])
            }            
        }       
        // group2
        for (j=0; j<kf_testing_idx.group2[i].length; j++){
            if(key_feature == 'view'){
                testing_stim.group2.push(kf_testing_idx.group2[i][j]+'_'+nkf_testing_idx.group2[i])
            } else if(key_feature == 'wood'){
                testing_stim.group2.push(nkf_testing_idx.group2[i]+'_'+kf_testing_idx.group2[i][j])
            }            
        }
    }
    // boundary
    for(i=0; i<nkf_testing_idx.boundary.length; i++){
        for (j=0; j<kf_testing_idx.boundary[i].length; j++){
            if(key_feature == 'lighting'){
                testing_stim.boundary.push(kf_testing_idx.boundary[i][j]+'_'+nkf_testing_idx.boundary[i])
            } else if(key_feature == 'wood'){
                testing_stim.boundary.push(nkf_testing_idx.boundary[i]+'_'+kf_testing_idx.boundary[i][j])
            }            
        }
    }
    
    // write in the list with other conditions
    var testing_cond = [];    
    for(i=0; i<testing_stim.group1.length; i++){
        testing_cond.push({
            key_feature: key_feature,
            position: 'group1',
            label: cat_label[0],
            stim_coord: testing_stim.group1[i],
            stim_idx: cell_coord.indexOf(testing_stim.group1[i]),
            space_path: 'stimuli/'+learning_set+'/',
            img_path: 'stimuli/'+learning_set+'/'+('000000'+cell_coord.indexOf(testing_stim.group1[i])).slice(-6)+'.webp'
        });
    };
    for(i=0; i<testing_stim.group2.length; i++){
        testing_cond.push({
            key_feature: key_feature,
            position: 'group2',
            label: cat_label[1],
            stim_coord: testing_stim.group2[i],
            stim_idx: cell_coord.indexOf(testing_stim.group2[i]),
            space_path: 'stimuli/'+learning_set+'/',
            img_path: 'stimuli/'+learning_set+'/'+('000000'+cell_coord.indexOf(testing_stim.group2[i])).slice(-6)+'.webp'
        });
    };
    for(i=0; i<testing_stim.boundary.length; i++){
        testing_cond.push({
            key_feature: key_feature,
            position: 'boundary',
            label: 'boundary',
            stim_coord: testing_stim.boundary[i],
            stim_idx: cell_coord.indexOf(testing_stim.boundary[i]),
            space_path: 'stimuli/'+learning_set+'/',
            img_path: 'stimuli/'+learning_set+'/'+('000000'+cell_coord.indexOf(testing_stim.boundary[i])).slice(-6)+'.webp'
        });
    };
    var testing_cond = testing_cond.concat(testing_cond, testing_cond)
    
    // transfer memory condition
    // (with the same structure to testing_cond but with a different stimuli set)
    var transfer_cond = [];    
    for(i=0; i<testing_stim.group1.length; i++){
        transfer_cond.push({
            key_feature: key_feature,
            position: 'group1',
            label: cat_label[0],
            stim_coord: testing_stim.group1[i],
            stim_idx: cell_coord.indexOf(testing_stim.group1[i]),
            space_path: 'stimuli/'+transfer_set+'/', //위랑 여기 부분 다름 
            img_path: 'stimuli/'+transfer_set+'/'+('000000'+cell_coord.indexOf(testing_stim.group1[i])).slice(-6)+'.webp'
        });
        transfer_cond.push({
            key_feature: key_feature,
            position: 'group2',
            label: cat_label[1],
            stim_coord: testing_stim.group2[i],
            stim_idx: cell_coord.indexOf(testing_stim.group2[i]),
            space_path: 'stimuli/'+transfer_set+'/',
            img_path: 'stimuli/'+transfer_set+'/'+('000000'+cell_coord.indexOf(testing_stim.group2[i])).slice(-6)+'.webp'
        });
    }
    for(i=0; i<testing_stim.boundary.length; i++){
        transfer_cond.push({
            key_feature: key_feature,
            position: 'boundary',
            label: 'boundary',
            stim_coord: testing_stim.boundary[i],
            stim_idx: cell_coord.indexOf(testing_stim.boundary[i]),
            space_path: 'stimuli/'+transfer_set+'/',
            img_path: 'stimuli/'+transfer_set+'/'+('000000'+cell_coord.indexOf(testing_stim.boundary[i])).slice(-6)+'.webp'
        })
    }
    var transfer_cond = transfer_cond.concat(transfer_cond, transfer_cond);

    var condition = {
        learning: learning_cond,
        memory: testing_cond,
        transfer_learning: trans_learning_cond,
        transfer_memory: transfer_cond
    };

    return condition;
}