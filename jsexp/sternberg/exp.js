// sternberg
//
// 短期記憶における検索

DEBUG = false;

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "sternberg";    // 結果データを保存するディレクトリ名に使われる
    var SAVE_STYLE = "summary";         // "verbose"だと詳細形式で保存
    var DELIMITER = "\t";               // 結果データのデリミタ
    var id, sex;        // 参加者情報
    var b = 0;          // 実行中のblock番号(0からblocks.length-1まで)
    var block;          // 実行中のblock
    var t = 0;          // 実行中のtrial番号(0からblock.trials.length-1まで)
    var trial;          // 実行中のtrial
    var start_time;
    var end_time;

    // ***** 実験固有の変数・定数
    var T_FIX = 500;                    // 注視点呈示時間(ms)
    var T_ITI = 1000;                   // 試行間間隔(ms)
    var T_NUMBER = 500;
    var T_ISI = 200;
    var ID_MAIN = "main";               // 表示領域のID
    var MAIN_WIDTH = "800px";           // 表示領域の幅
    var MAIN_HEIGHT = "400px";  // 表示領域の高さ
    var MAIN_PADDING = "40px";  // 表示領域周囲の余白
    var CYAN = "#00FFFF";               // 領域の背景色
    var WHITE = "#FFFFFF";              // 領域の背景色
    var ID_IMAGE = "image";             // 刺激画像のID
    var IMAGE_WIDTH = "80px";   // 刺激画像の幅
    var IMAGE_HEIGHT = "80px";  // 刺激画像の高さ
    var ID_FORM = "form";
    var FORM_HEIGHT = "60px";
    var FORM_WIDTH = "800px";
    var FORM_X = 40;
    var FORM_Y = 380;
    var ID_ANSWER = "answer";
    var ANSWER_SIZE = 20;
    var KEY_YES = IO.KEYCODE.J;
    var KEY_NO = IO.KEYCODE.F;
    var POS = "POS";
    var NEG = "NEG";
    var YES = "yes";
    var NO = "no"; 
    var TYPES = [POS, NEG];
    var SETSIZES = [2, 4, 6];
    var HIT = "Hit";
    var MISS = "Miss";
    var CORRECT_REJECTION = "CR";
    var FALSE_ALARM = "FA";
    var PRACTICE = "practice";
    var EXPERIMENT = "experiment";

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    var AUDIOS = ["chime", "boo"];
    var IMAGES = "0123456789".split("").concat(["fix", "asterisk", 'blank']);

    var make_trials = function (src) {
        var array = [];

        // srcは [[2, POS, 1], [2, POS, 2], ...]
        src.forEach(function (s) {
            var setsize = s[0], type = s[1], pos = s[2], seq = [], target, i, r;

            // 重複しない数字リストを作成
            for (i = 0; i < setsize; i++) {
                do { r = Math.floor(Math.random() * 10); } while (seq.indexOf(r) >= 0);
                seq.push(r);
            }
            // ターゲットを作成
            if (type === POS) { target = seq[pos - 1]; }
            else {
                do { target = Math.floor(Math.random() * 10);
                   } while (seq.indexOf(target) >= 0);
            }
            array.push({ setsize: setsize,
                         type: type, pos: pos, seq: seq, target: target,
                         answer: null, result: null, rt: null });
        });
        return array;
    };

    var blocks = [
        { name: "練習",
          type: PRACTICE,
          trials: make_trials(
              [[2, POS, 1], [2, NEG, 2],
               [4, POS, 3], [4, NEG, 4],
               [6, POS, 5], [6, NEG, 6]] ) },
        { name: "本試行",
          type: EXPERIMENT,
          breakpoint: null,
          trials: make_trials(
              [[2, [POS, NEG], [1, 2]].combine().repeat(12),
               [4, [POS, NEG], [1, 2, 3, 4]].combine().repeat(6),
               [6, [POS, NEG], [1, 2, 3, 4, 5, 6]].combine().repeat(4)
              ].flatten1() ) }
    ];

    // ***** 実験開始に先立って1回だけ実施する処理
    // 実験全体に共通する教示・ブロック実施順の決定など
    // block_prologueを呼ぶこと
    var prologue = function () {
        b = 0;
        IO.clear(ID_MAIN);
        IO.set_element_style(ID_MAIN, "left");
        IO.display_instruction("【短期記憶における検索】",
                               "画面中央に\"＋\"のあと1つずつ数字が呈示されていきます。呈示される個数は2または4または6で、同じ数字が2回現われることはありません。呈示が終わると\"＊\"が表示され、そのあとさらにもう1つ数字が呈示されます。最後に呈示された数字が\"＊\"より前に呈示された数字列の中にあったかなかったかを判断してください。あった場合には右手の人差し指で【J】のキーを，なかった場合は左手の人差し指で【F】のキーを，できるだけ早く押してください。その後，次の課題が呈示されます。",
                               ID_MAIN);
        block_prologue();
    };

    // ***** ブロックごとの開始時に実施する処理
    // ブロックごとの教示・試行実施順の決定など
    // do_first_trialを呼ぶこと
    var block_prologue = function () {
        var msg;
        block = blocks[b];
        block.trials.shuffle();
        t = 0;
        if (block.type === EXPERIMENT) {
            block.breakpoint = Math.floor(block.trials.length / 3);
        }
        IO.append_paragraph("スペースキーを押すと" + block.name + "を開始します。" +
                            "全部で" + block.trials.length + "試行あります。" + 
                            (block.type === EXPERIMENT ?
                             block.breakpoint + "試行ごとに休憩があります。" : ""),
                            ID_MAIN, "center");
        IO.wait_for_key(IO.KEYCODE.SPACE, do_first_trial);
    };

    // ***** ブロック最初の試行に先立って実施する処理
    // 表示領域の準備など
    // do_trialを呼ぶこと
    var do_first_trial = function () {
        var div;
        IO.clear(ID_MAIN);
        IO.set_element_style(ID_MAIN, { backgroundColor: WHITE });
        IO.append_element('img', ID_IMAGE,
                          { width: IMAGE_WIDTH, height: IMAGE_HEIGHT },
                          ID_MAIN, "center");
        IO.clear(ID_IMAGE);
        IO.setTimeout(do_trial, T_ITI);
    };

    // ***** 1試行の実施
    // next_trialを呼ぶこと
    var do_trial = function () {
        var stimuli;
        var setup = function () {
            trial = block.trials[t];
        };

        setup();
        // 刺激列を作成
        if (DEBUG) {
            stimuli = [[IMAGES.fix, -1, ID_IMAGE]];
        } else {
            stimuli = [[IMAGES.fix, T_FIX, ID_IMAGE],
                       [IMAGES.blank, T_ISI, ID_IMAGE]];
            trial.seq.forEach(function (num) {
                stimuli.push([IMAGES[num], T_NUMBER, ID_IMAGE]);
                stimuli.push([IMAGES.blank, T_ISI, ID_IMAGE]);
            });
            stimuli.push([IMAGES.asterisk, T_FIX, ID_IMAGE]);
            stimuli.push([IMAGES.blank, T_ISI, ID_IMAGE]);
            stimuli.push([IMAGES[trial.target], -1, ID_IMAGE]);
        }
        IO.present_stimuli_and_wait_for_key(
            stimuli,
            [KEY_YES, KEY_NO],
            set_result);
    };

    // ***** キー入力があったときに呼ばれる関数
    // next_trialを呼ぶ
    var set_result = function (keycode, rt) {
        if (DEBUG) {
            trial.answer = (keycode === KEY_YES) ? YES : NO;
            if (IO.make_random_number(0,99) < 3) {
                trial.result = (trial.type === POS) ? MISS : FALSE_ALARM;
            } else {
                trial.result = (trial.type === POS) ? HIT : CORRECT_REJECTION;
            }
        } else if (keycode === KEY_YES) {
            trial.answer = YES;
            trial.result = (trial.type === POS) ? HIT : FALSE_ALARM;
        } else if (keycode === KEY_NO) {
            trial.answer = NO;
            trial.result = (trial.type === POS) ? MISS : CORRECT_REJECTION;
        }
        trial.rt = rt;
        next_trial();
    };

    // ***** 次の試行に進む処理
    // ブロックが終わりならblock_epilogue、そうでなければdo_trialを呼ぶ
    var next_trial = function () {
        var advance = function () {
            t = t + 1;
            if (t >= block.trials.length) {
                t = 0;
                b = b + 1;
                IO.setTimeout(block_epilogue, T_ITI);
            } else {
                if (block.type === EXPERIMENT && t % block.breakpoint === 0) {
                    IO.clear(ID_MAIN);
                    IO.set_element_style(ID_MAIN, { backgroundColor: CYAN, textAlign: "center" } );
                    IO.append_paragraph("休憩です。準備ができたらスペースキーを押して続けてください。", ID_MAIN, "center");
                    IO.wait_for_key(IO.KEYCODE.SPACE, do_first_trial);
                } else {
                    IO.setTimeout(do_trial, T_ITI);
                }
            }
        };


        IO.clear(ID_IMAGE);
        if (trial.result === HIT || trial.result === CORRECT_REJECTION) {
            AUDIOS["chime"].play();
        } else {
            AUDIOS["boo"].play();
        }
        advance();
    };

    // ***** ブロック終了時に実施する処理
    // 実験が終わりならblock_prologue、そうでなければepilogueを呼ぶ
    // この関数が呼ばれた時点でbとtは既に進められているので注意
    // (blockとtrialは更新されていない)
    var block_epilogue = function () {
        var score = 0, n = 0, mean_rt = 0;
        var advance = function () {
            if (b < blocks.length) { block_prologue(); }
            else { epilogue(); }
        };

        IO.set_element_style(ID_MAIN, { backgroundColor: CYAN, textAlign: "center" } );
        if (block.type === PRACTICE) {
            block.trials.forEach(function (trial) {
                if (trial.result === HIT || trial.result === CORRECT_REJECTION) {
                    score += 1;
                    mean_rt += trial.rt;
                }
            });
            mean_rt = Math.floor(mean_rt / score);
            score = Math.floor(score / block.trials.length * 100);
            IO.append_paragraph("正答率は" + score + "% " + "平均反応時間は" + mean_rt + "msでした。できるだけ早く、かつ、間違えないように反応してください。", ID_MAIN);
        }
        advance();
    };

    // ***** 全ブロック終了時に1回だけ実施する処理
    // データ保存など
    var epilogue = function () {
        var string = "", trials;

        end_time = new Date();
        if (typeof SAVE_STYLE === 'undefined' || SAVE_STYLE !== 'verbose') {
            // 結果を条件ごとにまとめなおす
            trials = {};
            blocks.forEach(function (block) {
                block.trials.forEach(function (trial) {
                    if (block.type === PRACTICE) { return; }
                    trials.init_property(trial.type, {});
                    trials[trial.type].init_property(trial.setsize, []);
                    trials[trial.type][trial.setsize].push(trial);
                });
            });
            // 出力
            string += [id, sex].join(DELIMITER);
            TYPES.forEach(function (type) {
                SETSIZES.forEach(function (setsize) {
                    trials[type][setsize].forEach(function (trial) {
                        if (trial.result === HIT || trial.result === CORRECT_REJECTION) {
                            string += DELIMITER + trial.rt;
                        } else {
                            string += DELIMITER; // 誤答ならrtを空白にセット
                        }
                    });
                });
            });
            string += "\n";
            IO.save_data(TITLE, "", string, ID_MAIN, "append");
        } else {
            string += "### " + TITLE + "\n";
            string += "### id = " + id + " sex = " + sex + "\n";
            string += "### start: " + start_time + "\n";
            blocks.forEach(function (block) {
                block.trials.forEach(function (trial) {
                    string += [block.name,
                               trial.setsize, trial.seq.join(''),
                               trial.type, trial.pos,
                               trial.answer, trial.result, trial.rt].join() + "\n";
                });
            });
            string += "### end  : " + end_time + "\n";
            IO.save_data(TITLE, id, string, ID_MAIN);
        }
    };

    // ***** EXPオブジェクトの定義 通常は編集不要
    var that = {};
    that.init = function () {
        var load_images = function (i, s) {
            id = i; sex = s;
            if (typeof IMAGES !== 'undefined') { IO.load_images(IMAGES, load_audios); }
            else { return load_audios(); }
        };
        var load_audios = function (obj) {
            if (typeof obj !== 'undefined') { IMAGES = obj; }
            if (typeof AUDIOS !== 'undefined') { IO.load_audios(AUDIOS, start); }
            else { return start(); }
        };
        var start = function (obj) {
            if (typeof obj !== 'undefined') { AUDIOS = obj; }
            IO.clear(ID_MAIN);
            start_time = new Date();
            return prologue();
        };
        IO.append_element("div", ID_MAIN,
                          { width: MAIN_WIDTH, height: MAIN_HEIGHT,
                            padding: MAIN_PADDING, backgroundColor: CYAN },
                          null, "center");
        IO.input_basic_data(ID_MAIN, load_images);
    };
    return that;
}());
