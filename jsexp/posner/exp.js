// posner
//
// 文字マッチング課題

DEBUG = false;

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "posner";       // 結果データを保存するディレクトリ名に使われる
    var SAVE_STYLE = "summary"; // "verbose"だと詳細形式で保存
    var DELIMITER = "\t";       // 結果データのデリミタ
    var id, sex;                // 参加者情報
    var b = 0;                  // 実行中のblock番号(0からblocks.length-1まで)
    var block;                  // 実行中のblock
    var t = 0;                  // 実行中のtrial番号(0からblock.trials.length-1まで)
    var trial;                  // 実行中のtrial
    var start_time;
    var end_time;

    // ***** 実験固有の変数・定数
    var T_FIX = 300;            // 注視点呈示時間(ms)
    var T_BLANK = 500;          // 注視点から刺激までのISI(ms)
    var T_T1 = 500;             // 第1文字呈示時間(ms)
    var T_ITI = 1000;           // 試行間間隔(ms)
    var ID_MAIN = "main";       // 表示領域のID
    var MAIN_WIDTH = "800px";   // 表示領域の幅
    var MAIN_HEIGHT = "400px";  // 表示領域の高さ
    var MAIN_PADDING = "40px";  // 表示領域周囲の余白
    var CYAN = "#00FFFF";       // 表示領域の背景色(教示時)
    var WHITE = "#FFFFFF";      // 表示領域の背景色(実行時)
    var IMAGE_WIDTH = "80px";   // 刺激画像の幅
    var IMAGE_HEIGHT = "80px";  // 刺激画像の高さ
    var ID_LEFT = "left";       // 刺激画像のID
    var ID_RIGHT = "right";     // 刺激画像のID
    var LEFT_X = 360;           // 左刺激呈示位置のX座標 (880 / 2 - 80)
    var RIGHT_X = 440;          // 右刺激呈示位置のX座標 (880 / 2)
    var Y = 200;                // 刺激呈示位置のY座標 (480/2 - 80/2)
    var KEY_YES = IO.KEYCODE.J;
    var KEY_NO = IO.KEYCODE.F;
    var PHYSICAL = "P";
    var NAME = "N";
    var DIFFERENT = "D";
    var ERROR = "Error";
    var CORRECT = "Correct";
    var PRACTICE = "practice";
    var EXPERIMENT = "experiment";

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    var AUDIOS = ["chime", "boo"];
    var IMAGES = "ABDEFGabdefg".split("").concat(["fix", "mask", "blank"]);

    var make_trials = function(src) {
        var n = 0, type, array = [];

        // srcは [ [0, "AA"], [500, "AA"], ... ]
        src.forEach(function (s) {
            var isi = s[0];
            var l = s[1].substr(0, 1);
            var r = s[1].substr(1, 1);

            if (l === r) { type = PHYSICAL; }
            else if (l === r.toUpperCase()) { type = NAME; }
            else { type = DIFFERENT; }
            array.push({ n: n++,
                         name: l + r + isi,
                         left: l,
                         right: r,
                         isi: isi,
                         type: type
                       });
        });
        return array;
    };
    var ISIs = [0, 500, 1000, 1500, 2000];
    var blocks = [
        { name: "練習", type: PRACTICE,
          trials: make_trials(
              [
                  [0,    "EE"], [1500, "FF"],
                  [500,  "Gg"], [2000, "Ee"],
                  [500,  "FG"], [2000, "GE"],
                  [0,    "Ef"], [1500, "Fg"]
              ]
          ) },
        { name: "本試行", type: EXPERIMENT,
          trials: make_trials(
              [
                  [ ISIs, ["AA", "BB", "DD"] ].combine(),
                  [ ISIs, ["Aa", "Bb", "Dd"] ].combine(),
                  [ ISIs, ["AE", "Ae", "BF", "Bf", "DG", "Dg"] ].combine()
              ].flatten1()
          ) }
    ];

    // ***** 実験開始に先立って1回だけ実施する処理
    // 実験全体に共通する教示・ブロック実施順の決定など
    // block_prologueを呼ぶこと
    var prologue = function () {
        var setup = function () {
            b = 0;
        };

        setup();
        IO.clear(ID_MAIN);
        IO.display_instruction("【Posnerの実験】",
                               ["アルファベットの2文字が AA, Aa, AB, Ab のように少し時間をあけて左右に呈示されます。それらが AA, Aa のように同じ文字の場合は右手の人差し指で【J】のキーを，AB, Ab のように違う文字の場合は左手の人差し指で【F】のキーを，できるだけ早く押してください。すると次の文字対が呈示されます。"],
                               ID_MAIN);
        block_prologue();
    };

    // ***** ブロックごとの開始時に実施する処理
    // ブロックごとの教示・試行実施順の決定など
    // do_first_trialを呼ぶこと
    var block_prologue = function () {
        var setup = function () {
            block = blocks[b];
            block.trials.shuffle();
            t = 0;
        };

        setup();
        IO.append_paragraph("スペースキーを押すと" + block.name + "を開始します。" +
                            "全部で" + block.trials.length + "試行あります。",
                            ID_MAIN, "center");
        IO.wait_for_key(IO.KEYCODE.SPACE, do_first_trial);
    };

    // ***** ブロック最初の試行に先立って実施する処理
    // 表示領域の準備など
    // do_trialを呼ぶこと
    var do_first_trial = function () {
        var set_screen = function () {
            IO.set_element_style(ID_MAIN, {backgroundColor: WHITE});
            IO.clear(ID_MAIN);
            IO.append_element('img', ID_LEFT, {width: IMAGE_WIDTH, height: IMAGE_HEIGHT},
                              ID_MAIN, LEFT_X, Y);
            IO.append_element('img', ID_RIGHT, {width: IMAGE_WIDTH, height: IMAGE_HEIGHT},
                              ID_MAIN, RIGHT_X, Y);
        };

        set_screen();
        IO.setTimeout(do_trial, T_ITI);
    };

    // ***** 1試行の実施
    // next_trialを呼ぶこと
    var do_trial = function () {
        var setup = function () {
            trial = block.trials[t];
        };

        setup();
        IO.present_stimuli_and_wait_for_key(
            [[IMAGES.fix, 0, ID_LEFT],
             [IMAGES.fix, T_FIX, ID_RIGHT],
             [IMAGES.blank, 0, ID_LEFT],
             [IMAGES.blank, T_BLANK, ID_RIGHT],
             [IMAGES[trial.left], T_T1, ID_LEFT],
             [IMAGES.mask, trial.isi, ID_LEFT],
             [IMAGES[trial.right], -1, ID_RIGHT]],
            [KEY_YES, KEY_NO],
            set_reaction);
    };

    // ***** キー入力があったときに呼ばれる関数
    // next_trialを呼ぶ
    var set_reaction = function (keycode, rt) {
        if (keycode === KEY_YES) {
            trial.ans = "yes";
            trial.result = (trial.type === DIFFERENT) ? ERROR : CORRECT;
        } else if (keycode === KEY_NO) {
            trial.ans = "no";
            trial.result = (trial.type === DIFFERENT) ? CORRECT : ERROR;
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
                t = 0; b = b + 1; IO.setTimeout(block_epilogue, T_ITI);
            } else {
                IO.setTimeout(do_trial, T_ITI);
            }
        };

        IO.clear(ID_LEFT);
        IO.clear(ID_RIGHT);
        if (trial.result === CORRECT) { AUDIOS["chime"].play(); }
        else { AUDIOS["boo"].play(); }
        advance();
    };

    // ***** ブロック終了時に実施する処理
    // 実験が終わりならblock_prologue、そうでなければepilogueを呼ぶ
    // この関数が呼ばれた時点でbとtは既に進められているので注意
    // (blockとtrialは更新されていない)
    var block_epilogue = function () {
        var set_screen = function () {
            IO.clear(ID_MAIN);
            IO.set_element_style(ID_MAIN, {backgroundColor: CYAN, textAlign: "center"});
        };
        var advance = function () {
            if (b < blocks.length) { block_prologue(); }
            else { epilogue(); }
        };
        var score = 0, mean_rt = 0;

        set_screen();
        if (block.type === PRACTICE) {
            block.trials.forEach(function (trial) {
                if (trial.result === CORRECT) {
                    score += 1;
                }
                mean_rt += trial.rt;
            });
            score = Math.floor(score / block.trials.length * 100);
            mean_rt = Math.floor(mean_rt / block.trials.length);
            IO.append_paragraph("正答率は" + score + "% " + "平均反応時間は" + mean_rt + "msでした。できるだけ早く、かつ、間違えないように反応してください。", ID_MAIN);
        }
        advance();
    };

    // ***** 全ブロック終了時に1回だけ実施する処理
    // データ保存など
    var epilogue = function () {
        var string = "";

        end_time = new Date();
        if (typeof SAVE_STYLE === 'undefined' || SAVE_STYLE !== 'verbose') {
            blocks.forEach(function (block) {
                if (block.type === PRACTICE) { return; }
                sum = 0;
                rt = [];
                block.trials.forEach(function (trial) {
                    if (trial.result === CORRECT) {
                        rt[trial.n] = trial.rt;
                        sum += 1;
                    } else {
                        rt[trial.n] = "";
                    }
                });
                string += [id, sex, sum].join(DELIMITER);
                rt.forEach(function (r) {
                    string += DELIMITER + r;
                });
                string += "\n";
            });
            IO.save_data(TITLE, "", string, ID_MAIN, "append");
        } else {
            string += "### " + TITLE + "\n";
            string += "### id = " + id + " sex = " + sex + "\n";
            string += "### start: " + start_time + "\n";
            blocks.forEach(function (block) {
                block.trilas.forEach(function (trial) {
                    string += [block.name,
                               trial.name, trial.type, trial.isi,
                               trial.ans, trial.result, trial.rt].join() + "\n";
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
