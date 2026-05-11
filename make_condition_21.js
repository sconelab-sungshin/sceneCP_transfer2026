function make_condition(relevant_ftr, random_cat_label, learning_set, n_round, transfer_set) {

    /**
     * This script makes the experiment conditions for learning & test sessions.
     * (See stimulus configuration in Methods.)
     * Two category groups were divided either by horizontal or vertical linear boundary.
     * Category labels (left or right wings) were randomly assigned to those groups.
     */

    // Preparing the base cell coord
    var cell_coord = []; 
    for (var y = -10; y <= 10; y++) {    //수정: 21x21
        for (var x = -10; x <= 10; x++) {
            cell_coord.push(x + "_" + y);
        }
    }
    // x,y 좌표 -> -12_-12 ~ 12_12, 총 625개


    // Learning condition -------------------------------------------------------------- //

    var relevant_ftr_idx = {
        group1: _.range(-9, 0, 2), // -9,-7,-5,-3,-1 (5개)
        group2: _.range(9, 0, -2)  // 9,7,5,3,1 (5개)
    };
    var irrelevant_ftr_idx = {
        group1: [
            _.range(-3, 4, 2),   // dist1
            _.range(-5, 6, 2),   // dist2
            _.range(-7, 8, 2),   // dist3
            _.range(-9, 10, 2),  // dist4
            _.range(-9, 10, 2)   // dist5
        ],
        group2: [
            _.range(-5, 6, 2),
            _.range(-7, 8, 2),
            _.range(-9, 10, 2),
            _.range(-11, 12, 2),
            _.range(-11, 12, 2),
            _.range(-11, 12, 2)
        ]
    };

    var learning_stim = {
        group1: [[], [], [], [], []],
        group2: [[], [], [], [], []]
    };

    if (relevant_ftr == 'view') {
        // group1: relevant(x) + irrelevant(y)
        for (var i = 0; i < relevant_ftr_idx.group1.length; i++) {
            for (var j = 0; j < irrelevant_ftr_idx.group1[i].length; j++) {
                learning_stim.group1[i].push(relevant_ftr_idx.group1[i] + '_' + irrelevant_ftr_idx.group1[i][j]);
            }
        }
        // group2
        for (var i = 0; i < relevant_ftr_idx.group2.length; i++) {
            for (var j = 0; j < irrelevant_ftr_idx.group2[i].length; j++) {
                learning_stim.group2[i].push(relevant_ftr_idx.group2[i] + '_' + irrelevant_ftr_idx.group2[i][j]);
            }
        }
    } else if (relevant_ftr == 'wood') {
        // group1: irrelevant(x) + relevant(y)
        for (var i = 0; i < relevant_ftr_idx.group1.length; i++) {
            for (var j = 0; j < irrelevant_ftr_idx.group1[i].length; j++) {
                learning_stim.group1[i].push(irrelevant_ftr_idx.group1[i][j] + '_' + relevant_ftr_idx.group1[i]);
            }
        }
        // group2
        for (var i = 0; i < relevant_ftr_idx.group2.length; i++) {
            for (var j = 0; j < irrelevant_ftr_idx.group2[i].length; j++) {
                learning_stim.group2[i].push(irrelevant_ftr_idx.group2[i][j] + '_' + relevant_ftr_idx.group2[i]);
            }
        }
    }

    // assigning coordinates equally to n rounds (based on distance from boundary)
    var rounded_learning_stim = {
        group1: { r1: [], r2: [], r3: [], r4: [], r5: [] },
        group2: { r1: [], r2: [], r3: [], r4: [], r5: [] }
    };
    var group_type = ['group1', 'group2'];
    var dist_range = _.range(learning_stim.group1.length);
    var round_num = _.range(n_round);

    for (var g of group_type) {
        var remain_learning_stim = [];
        for (var d of dist_range) {
            var n_sample_perDist = Math.floor(learning_stim[g][d].length / n_round);
            var shuffled_stim_perDist = _.shuffle(learning_stim[g][d]);
            var chunked_stim_perDist = _.chunk(shuffled_stim_perDist, n_sample_perDist);
            for (var r of round_num) {
                rounded_learning_stim[g]['r' + (r + 1)].push(chunked_stim_perDist[r]);
            }
            remain_learning_stim.push(chunked_stim_perDist.slice(r + 1, chunked_stim_perDist.length));
        }
        // assign remaining stim to rounds equally
        remain_learning_stim = _.shuffle(remain_learning_stim.flat(Infinity));
        var chunked_remain_stim = _.chunk(remain_learning_stim, 2);
        for (var r of round_num) {
            rounded_learning_stim[g]['r' + (r + 1)].push(chunked_remain_stim[r]);
            rounded_learning_stim[g]['r' + (r + 1)] = rounded_learning_stim[g]['r' + (r + 1)].flat();
        }
    }

    // write in the list with other conditions
    var learning_cond = { r1: [], r2: [], r3: [], r4: [], r5: [] };
    for (var r of round_num) {
        for (var g of group_type) {
            for (var i = 0; i < rounded_learning_stim[g]['r' + (r + 1)].length; i++) {
                learning_cond['r' + (r + 1)].push({
                    key_feature: key_feature,
                    position: g,
                    label: random_cat_label[_.indexOf(group_type, g)],
                    stim_coord: rounded_learning_stim[g]['r' + (r + 1)][i],
                    stim_idx: cell_coord.indexOf(rounded_learning_stim[g]['r' + (r + 1)][i]),
                    img_path: 'stimuli/' + learning_set + '/' +
                        ('000000' + cell_coord.indexOf(rounded_learning_stim[g]['r' + (r + 1)][i])).slice(-6) + '.webp'
                });
            }
        }
    }


    // Transfer learning condition ---------------------------------------------------------------------- //

    var relevant_ftr_idx = {
        group1: _.range(-7, -5, 2),  // -9,-7,-5
        group2: _.range(7, 2, -2)    // 9,7,5
    };
    var irrelevant_ftr_idx = {
        group1: _.range(-2, 3, 2),   // -2,0,2
        group2: _.range(-2, 3, 2)
    };

    var transfer_stim = { group1: [], group2: [] };

    if (relevant_ftr == 'view') {
        for (var i = 0; i < relevant_ftr_idx.group1.length; i++) {
            for (var j = 0; j < irrelevant_ftr_idx.group1.length; j++) {
                transfer_stim.group1.push(relevant_ftr_idx.group1[i] + '_' + irrelevant_ftr_idx.group1[j]);
            }
        }
        for (var i = 0; i < relevant_ftr_idx.group2.length; i++) {
            for (var j = 0; j < irrelevant_ftr_idx.group2.length; j++) {
                transfer_stim.group2.push(relevant_ftr_idx.group2[i] + '_' + irrelevant_ftr_idx.group2[j]);
            }
        }
    } else if (relevant_ftr == 'wood') {
        for (var i = 0; i < relevant_ftr_idx.group1.length; i++) {
            for (var j = 0; j < irrelevant_ftr_idx.group1.length; j++) {
                transfer_stim.group1.push(irrelevant_ftr_idx.group1[j] + '_' + relevant_ftr_idx.group1[i]);
            }
        }
        for (var i = 0; i < relevant_ftr_idx.group2.length; i++) {
            for (var j = 0; j < irrelevant_ftr_idx.group2.length; j++) {
                transfer_stim.group2.push(irrelevant_ftr_idx.group2[j] + '_' + relevant_ftr_idx.group2[i]);
            }
        }
    }

    var trans_learning_cond = [];
    for (var i = 0; i < transfer_stim.group1.length; i++) {
        trans_learning_cond.push({
            key_feature: key_feature,
            position: 'group1',
            label: random_cat_label[0],
            stim_coord: transfer_stim.group1[i],
            stim_idx: cell_coord.indexOf(transfer_stim.group1[i]),
            img_path: 'stimuli/' + transfer_set + '/' +
                ('000000' + cell_coord.indexOf(transfer_stim.group1[i])).slice(-6) + '.webp'
        });
        trans_learning_cond.push({
            key_feature: key_feature,
            position: 'group2',
            label: random_cat_label[1],
            stim_coord: transfer_stim.group2[i],
            stim_idx: cell_coord.indexOf(transfer_stim.group2[i]),
            img_path: 'stimuli/' + transfer_set + '/' +
                ('000000' + cell_coord.indexOf(transfer_stim.group2[i])).slice(-6) + '.webp'
        });
    }


    // Test condition ----------------------------------------------------------------------------------- //

    var kf_testing_idx = {
        group1: [[-2],[-4,-2],[-6,-4,-2],[-8,-6,-2],[-8,-6,-2],[-8,-6,-2],[-8,-6,-2],[-6,-4,-2],[-6,-4,-2],[-4,-2],[-2]],
        boundary: [[0],     [0],     [0],          [0],     [0]],
        group2: [[2],[2,4],[2,4,6],[2,4,6,8],[2,4,6,8],[2,4,6,8],[2,4,6,8],[2,4,6],[2,4,6],[2,4],[2]]
    };
    var nkf_testing_idx = {
        group1:   _.range(-10, 11, 2),  // 11개
        boundary: _.range(-8, 9, 4),    // 5개
        group2:   _.range(-10, 11, 2)
    };

    var testing_stim = { group1: [], boundary: [], group2: [] };

    for (var i = 0; i < nkf_testing_idx.group1.length; i++) {
        // group1
        for (var j = 0; j < kf_testing_idx.group1[i].length; j++) {
            if (key_feature == 'view') {
                testing_stim.group1.push(kf_testing_idx.group1[i][j] + '_' + nkf_testing_idx.group1[i]);
            } else if (key_feature == 'wood') {
                testing_stim.group1.push(nkf_testing_idx.group1[i] + '_' + kf_testing_idx.group1[i][j]);
            }
        }
        // group2
        for (var j = 0; j < kf_testing_idx.group2[i].length; j++) {
            if (key_feature == 'view') {
                testing_stim.group2.push(kf_testing_idx.group2[i][j] + '_' + nkf_testing_idx.group2[i]);
            } else if (key_feature == 'wood') {
                testing_stim.group2.push(nkf_testing_idx.group2[i] + '_' + kf_testing_idx.group2[i][j]);
            }
        }
    }

    // boundary: 'lighting' → 'view' 로 수정
    for (var i = 0; i < nkf_testing_idx.boundary.length; i++) {
        for (var j = 0; j < kf_testing_idx.boundary[i].length; j++) {
            if (key_feature == 'view') {
                testing_stim.boundary.push(kf_testing_idx.boundary[i][j] + '_' + nkf_testing_idx.boundary[i]);
            } else if (key_feature == 'wood') {
                testing_stim.boundary.push(nkf_testing_idx.boundary[i] + '_' + kf_testing_idx.boundary[i][j]);
            }
        }
    }

    // write in the list with other conditions
    var testing_cond = [];
    for (var i = 0; i < testing_stim.group1.length; i++) {
        testing_cond.push({
            key_feature: key_feature,
            position: 'group1',
            label: cat_label[0],
            stim_coord: testing_stim.group1[i],
            stim_idx: cell_coord.indexOf(testing_stim.group1[i]),
            space_path: 'stimuli/' + learning_set + '/',
            img_path: 'stimuli/' + learning_set + '/' +
                ('000000' + cell_coord.indexOf(testing_stim.group1[i])).slice(-6) + '.webp'
        });
    }
    for (var i = 0; i < testing_stim.group2.length; i++) {
        testing_cond.push({
            key_feature: key_feature,
            position: 'group2',
            label: cat_label[1],
            stim_coord: testing_stim.group2[i],
            stim_idx: cell_coord.indexOf(testing_stim.group2[i]),
            space_path: 'stimuli/' + learning_set + '/',
            img_path: 'stimuli/' + learning_set + '/' +
                ('000000' + cell_coord.indexOf(testing_stim.group2[i])).slice(-6) + '.webp'
        });
    }
    for (var i = 0; i < testing_stim.boundary.length; i++) {
        testing_cond.push({
            key_feature: key_feature,
            position: 'boundary',
            label: 'boundary',
            stim_coord: testing_stim.boundary[i],
            stim_idx: cell_coord.indexOf(testing_stim.boundary[i]),
            space_path: 'stimuli/' + learning_set + '/',
            img_path: 'stimuli/' + learning_set + '/' +
                ('000000' + cell_coord.indexOf(testing_stim.boundary[i])).slice(-6) + '.webp'
        });
    }
    testing_cond = testing_cond.concat(testing_cond, testing_cond);

    // transfer memory condition
    var transfer_cond = [];
    for (var i = 0; i < testing_stim.group1.length; i++) {
        transfer_cond.push({
            key_feature: key_feature,
            position: 'group1',
            label: cat_label[0],
            stim_coord: testing_stim.group1[i],
            stim_idx: cell_coord.indexOf(testing_stim.group1[i]),
            space_path: 'stimuli/' + transfer_set + '/',
            img_path: 'stimuli/' + transfer_set + '/' +
                ('000000' + cell_coord.indexOf(testing_stim.group1[i])).slice(-6) + '.webp'
        });
        transfer_cond.push({
            key_feature: key_feature,
            position: 'group2',
            label: cat_label[1],
            stim_coord: testing_stim.group2[i],
            stim_idx: cell_coord.indexOf(testing_stim.group2[i]),
            space_path: 'stimuli/' + transfer_set + '/',
            img_path: 'stimuli/' + transfer_set + '/' +
                ('000000' + cell_coord.indexOf(testing_stim.group2[i])).slice(-6) + '.webp'
        });
    }
    for (var i = 0; i < testing_stim.boundary.length; i++) {
        transfer_cond.push({
            key_feature: key_feature,
            position: 'boundary',
            label: 'boundary',
            stim_coord: testing_stim.boundary[i],
            stim_idx: cell_coord.indexOf(testing_stim.boundary[i]),
            space_path: 'stimuli/' + transfer_set + '/',
            img_path: 'stimuli/' + transfer_set + '/' +
                ('000000' + cell_coord.indexOf(testing_stim.boundary[i])).slice(-6) + '.webp'
        });
    }
    transfer_cond = transfer_cond.concat(transfer_cond, transfer_cond);

    var condition = {
        learning: learning_cond,
        memory: testing_cond,
        transfer_learning: trans_learning_cond,
        transfer_memory: transfer_cond
    };

    return condition;
}
