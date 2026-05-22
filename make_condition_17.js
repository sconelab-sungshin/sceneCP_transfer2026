function make_condition(relevant_ftr, random_cat_label, learning_set, n_round, transfer_set) {

    /**
     * This script makes the experiment conditions for learning & test sessions.
     * (See stimulus configuration in Methods.)
     * Two category groups were divided either by horizontal or vertical linear boundary.
     * Category labels (left or right wings) were randomly assigned to those groups.
     */  
       

    var cell_coord = [];  
    for(var y=-8; y<=8; y++){
        for(x=-8; x<=8; x++){
            cell_coord.push(x+"_"+y);
        }        
    };


    // Learning condition -------------------------------------------------------------- //

    // simuli coordinate in each feature dimension 
    var relevant_ftr_idx = { //relevant feature index 
        group1: _.range(-7,0,2), // -7,-5,-3,-1
        group2: _.range(7,0,-2)  // 7,5,3,1
    }; 
    var irrelevant_ftr_idx = {  //irrelevant feature index 
        group1:[
            _.range(-3, 4, 2), _.range(-5, 6, 2), _.range(-7, 8, 2),
            _.range(-7, 8, 2)
        ],
        group2:[
            _.range(-3, 4, 2), _.range(-5, 6, 2), _.range(-7, 8, 2),
            _.range(-7, 8, 2)
        ]        
    };    
    
    // combining 
    var learning_stim = {
        group1: [[],[],[],[]], // # of sub-array = distance ragne (-11,-9,-7,-5,-3,-1)
        group2: [[],[],[],[]]
    };
    if(relevant_ftr == 'view'){   
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
    }else if(relevant_ftr == 'wood'){ 
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
    var learning_cond = {
        r1:[], r2:[], r3:[], r4:[], r5:[]
    };
    for (r of round_num){
        for(g of group_type){
            for(i=0; i<rounded_learning_stim[g]['r'+(r+1)].length; i++){
                learning_cond['r'+(r+1)].push({
                    key_feature: key_feature,     
                    position: g,                 //group1 or 2
                    label: random_cat_label[_.indexOf(group_type, g)],
                    stim_coord: rounded_learning_stim[g]['r'+(r+1)][i],
                    stim_idx: cell_coord.indexOf(rounded_learning_stim[g]['r'+(r+1)][i]),
                    img_path: 'stimuli/'+learning_set+'/'+('000000'+cell_coord.indexOf(rounded_learning_stim[g]['r'+(r+1)][i])).slice(-6)+'.webp'
                });

            }
        }
    }

    // Transfer learning condition ---------------------------------------------------------------------- //

    var relevant_ftr_idx = { // relevant feature index
        group1: _.range(-7,-2,2),
        group2: _.range(7,2,-2)
    }; 
    var irrelevant_ftr_idx = { // irrelvant feature index
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
    //boundary위의 자극도 해당 
    var kf_testing_idx = {
        group1: [[-4,-2],[-6,-4],[-6,-4],[-6,-4],[-6,-4],[-6,-4],[-6,-4],[-6,-4],[-4,-2]],
        boundary: [[0],[0],[0],[0],[0]],
        group2: [[2,4],[4,6],[4,6],[4,6],[4,6],[4,6],[4,6],[4,6],[2,4]]
    };
    var nkf_testing_idx = {
        group1:   _.range(-8, 9, 2),  
        boundary: _.range(-8, 9, 4),  
        group2:   _.range(-8, 9, 2)
    };

    // combine coords
    var testing_stim = {group1: [], boundary: [], group2: []};    
    for (i=0; i<nkf_testing_idx.group1.length; i++){
        // group1
        for (j=0; j<kf_testing_idx.group1[i].length; j++){
            //수정1: group1, 2 lighting -> view
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
            if(key_feature == 'view'){
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