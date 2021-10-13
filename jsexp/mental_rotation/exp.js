// mental_rotation
//
// メンタルローテーション課題

DEBUG = false;

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "mental_rotation";      // 結果データを保存するディレクトリ名に使われる
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
    var T_FIX = 300;            // 注視点呈示時間(ms)
    var T_BLANK = 500;          // 注視点から刺激までのISI(ms)
    var T_T1 = 500;             // 第1文字呈示時間(ms)
    var T_ITI = 1000;           // 試行間間隔(ms)
    var T_TIMEOUT = 0;
    var ID_MAIN = "main";               // 表示領域のID
    var MAIN_WIDTH = "800px";           // 表示領域の幅
    var MAIN_HEIGHT = "400px";  // 表示領域の高さ
    var MAIN_PADDING = "40px";  // 表示領域周囲の余白
    var CYAN = "#00FFFF";               // 表示領域の背景色(教示時)
    var WHITE = "#FFFFFF";              // 表示領域の背景色(実行時)
    var ID_IMAGE = "image";             // 刺激画像のID
    var IMAGE_WIDTH = "447px";  // 刺激画像の幅
    var IMAGE_HEIGHT = "258px"; // 刺激画像の高さ
    var KEY_YES = IO.KEYCODE.J;
    var KEY_NO = IO.KEYCODE.F;
    var N_PAIR = 72;
    var ERROR = "Error";
    var CORRECT = "Correct";
    var PICTURE_PLANE = 'P';
    var DEPTH = 'D';
    var MATCH = 'M';
    var UNMATCH = 'U';
    var TYPES = [ MATCH, UNMATCH ];
    var PLANES = [ PICTURE_PLANE, DEPTH ];
    var CONDITIONS = [ MATCH + PICTURE_PLANE, MATCH + DEPTH, UNMATCH ];
    var ANGLES = [ -160, -140, -120, -100, -80, -60, -40, -20, 0,
                   20, 40, 60, 80, 100, 120, 140, 160, 180 ];

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    var AUDIOS = ["chime", "boo"];
    var IMAGES = function () {
        var DIR = "img/";
        var EXT = ".png";
        var src = ['fix', 'blank'].map(function (name) {
            return [name, DIR + name + EXT];
        });;
        TYPES.forEach(function (type) {
            PLANES.forEach(function (plane) {
                ANGLES.forEach(function (angle) {
                    var name = type + plane + angle;
                    src.push([name, DIR + name + EXT]);
                });
            });
        });
        return src;
    }();

    // ***** ブロック・試行・刺激の定義
    var make_trials = function (src) {
        var array = [];

        // srcは [ [MATCH, PICTURE_PLANE, -160], ... ]
        src.forEach(function (s, i) {
            var type = s[0], plane = s[1], angle = s[2];
            array.push({ n: i,
                         name: type + plane + angle,
                         type: type,
                         plane: plane,
                         angle: angle,
                         answer: null,
                         result: null,
                         rt: null,
                       });
        });
        return array;
    };

    var blocks = [
        { name: "練習", type: "practice",
          trials: make_trials([ [MATCH, PICTURE_PLANE, -120],
                                [MATCH, DEPTH, -20],
                                [MATCH, DEPTH, 140],
                                [UNMATCH, PICTURE_PLANE, -120],
                                [UNMATCH, PICTURE_PLANE, 60],
                                [UNMATCH, DEPTH, 40] ]) },
        { name: "本試行", type: "experiment",
          trials: make_trials([TYPES, PLANES, ANGLES].combine()) }
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
        IO.display_instruction(
            "【Mental Rotation実験】",
            [["2つの図形が左右に呈示されます。それらが同じ図形の場合は右手の人差し指で【J】のキーを，異なる図形の場合は左手の人差し指で【F】のキーを，できるだけ早く押してください。その後，次の図形対が呈示されます。", "left"]],
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
        IO.set_element_style(ID_MAIN, { backgroundColor: WHITE });
        IO.clear(ID_MAIN);
        IO.append_element('img', ID_IMAGE, { width: IMAGE_WIDTH, height: IMAGE_HEIGHT },
                          ID_MAIN, "center");
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
            [[IMAGES.fix, T_FIX, ID_IMAGE],
             [IMAGES.blank, T_BLANK, ID_IMAGE],
             [IMAGES[trial.name], -1, ID_IMAGE]],
            [KEY_YES, KEY_NO],
            set_result);
    };

    // ***** キー入力があったときに呼ばれる関数
    // next_trialを呼ぶ
    var set_result = function (keycode, rt) {
        if (keycode === KEY_YES) {
            trial.answer = "yes";
            trial.result = (trial.type === MATCH) ? CORRECT : ERROR;
        } else if (keycode === KEY_NO) {
            trial.answer = "no";
            trial.result = (trial.type === MATCH) ? ERROR : CORRECT;
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

        IO.clear(ID_IMAGE);
        if (trial.result === CORRECT) {
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
        var advance = function () {
            if (b < blocks.length) { block_prologue(); }
            else { epilogue(); }
        };
        var score = 0, n = 0, mean_rt = 0;

        IO.set_element_style(ID_MAIN, { backgroundColor: CYAN, textAlign: "center" } );
        if (block.type.match(/practice$/)) {
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
                if (block.type !== 'experiment') { return; };
                // 条件ごとの正答数を数えながら反応時間を配列rtにコピー
                var sum = {}, rt = [], condition;

                block.trials.forEach(function (trial) {
                    condition = (trial.type === MATCH) ? 
                        (trial.type + trial.plane) : trial.type;
                    if (trial.result === CORRECT) {
                        sum[condition] = (sum[condition] === undefined) ?
                            0 : sum[condition] + 1;
                        rt[trial.n] = trial.rt;
                    } else {
                        rt[trial.n] = "";
                    }
                });
                // 結果文字列をセット
                string += [id, sex].join(DELIMITER);
                CONDITIONS.forEach(function (c) {
                    string += DELIMITER + sum[c]
                });
                rt.forEach(function (r) {
                    string += DELIMITER + r;
                });
                string += "\n";
            });
            IO.save_data(TITLE, "", string, ID_MAIN, 'append');
        } else {
            string += "### " + TITLE + "\n";
            string += "### id = " + id + " sex = " + sex + "\n";
            string += "### start: " + start_time + "\n";
            blocks.forEach(function (block) {
                block.trials.forEach(function (trial) {
                    string += [block.name, trial.n,
                               trial.type, trial.angle, trial.correct_answer,
                               trial.answer, trial.result,
                               trial.rt].join(DELIMITER) + "\n";
                });
            });
            string += "### end  : " + end_time + "\n";
            IO.clear(ID_MAIN);
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
