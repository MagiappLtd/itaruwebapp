// semantic_memory
//
// 意味記憶

DEBUG = false;

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "semantic_memory";      // 結果データを保存するディレクトリ名に使われる
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
    var T_BLANK = 1000;         // 空白の呈示時間(ms)
    var T_WORD = 2000;          // 刺激呈示時間(ms)
    var T_FIX = 300;            // 注視点呈示時間(ms)
    var T_PRE = 500;            // 注視点と再認単語のISI(ms)
    var T_ITI = 1000;           // 試行間間隔(ms)
    var ID_MAIN = "main";       // 表示領域のID
    var MAIN_WIDTH = "800px";   // 表示領域の幅
    var MAIN_HEIGHT = "400px";  // 表示領域の高さ
    var MAIN_PADDING = "40px";  // 表示領域周囲の余白
    var CYAN = "#00FFFF";       // 表示領域の背景色
    var WHITE = "#FFFFFF";      // 表示領域の背景色
    var ID_CENTER = "center";           // 刺激呈示領域のID
    var CENTER_WIDTH = "800px"; // 刺激呈示領域の幅
    var CENTER_HEIGHT = "32px"; // 刺激呈示領域の高さ
    var CENTER_FONTSIZE = "32px";       // 刺激呈示領域のフォントサイズ
    var KEY_YES = IO.KEYCODE.J;
    var KEY_NO = IO.KEYCODE.F;
    var S = 'S';
    var P = 'P';
    var T = 'T';
    var F = 'F';
    var CORRECT = "Correct";
    var ERROR = "Error";

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    var AUDIOS = ["chime", "boo"];
    var IMAGES = null;

    var make_trials = function (src) {
        var array = [];

        // srcは [ [T, S, 0, "リンゴは，リンゴである。"], ... ]
        src.forEach(function (s, i) {
            array.push( {
                n: i, correct: s[0], type: s[1], distance: s[2], sentence: s[3]
            } );
        });
        return array;
    };

    var blocks = [
        { name: "練習",
          type: "practice",
          trials: make_trials(
              [   [T, S, 0, "リンゴは，リンゴである。"],
                  [T, S, 1, "ミカンは，果物である。"],
                  [T, S, 2, "キュウリは，食べ物である。"],
                  [F, S, 0, "トマトは，机である。"],
                  [F, S, 1, "トンボは，野菜である。"],
                  [F, S, 2, "セミは，食べ物である。"]
              ]
          ) },
        { name: "本試行",
          type: "experiment",
          trials: make_trials(
              [
                  [T, S, 0, ["マグロは，マグロである。", "スミレは，スミレである。",
                             "カラスは，カラスである。", "ヤナギは，ヤナギである。",
                             "トンボは，トンボである。"]].combine(),
                  [T, S, 1, ["ナマズは，魚である。", "サクラは，草花である。",
                             "インコは，鳥である。",  "ヒノキは，木である。",
                             "バッタは，昆虫である。"]].combine(),
                  [T, S, 2, ["マグロは，動物である。", "スミレは，植物である。",
                             "カラスは，動物である。", "ヒノキは，植物である。",
                             "バッタは，動物である。"]].combine(),
                  [T, P, 0, ["ナマズには，ヒゲがある。", "サクラは，ピンク色である。", 
                             "インコは，まねをする。", "ヒノキは，背が高い。", 
                             "トンボは，目が大きい。"]].combine(),
                  [T, P, 1, ["マグロは，えらがある。", "スミレには，茎がある。",
                             "カラスには，くちばしがある。", "ヤナギには，幹がある。",
                             "バッタは，足が６本ある。"]].combine(),
                  [T, P, 2, ["ナマズには，心臓がある。", "サクラには，葉がある。",
                             "インコには，皮膚がある。", "ヤナギには，根がある。",
                             "トンボは，ものを食べる。"]].combine(),
                  [F, S, 0, ["サクラは，マグロである。", "ナマズは，スミレである。",
                             "ヒノキは，カラスである。", "バッタは，ヤナギである。",
                             "マグロは，トンボである。"]].combine(),
                  [F, S, 1, ["カラスは，木である。", "バッタは，草花である。",
                             "ヤナギは，鳥である。", "スミレは，魚である。",
                             "インコは，昆虫である。"]].combine(),
                  [F, S, 2, ["スミレは，動物である。", "カラスは，植物である。",
                             "ヒノキは，動物である。", "マグロは，植物である。",
                             "トンボは，植物である。"]].combine(),
                  [F, P, 0, ["マグロには，こぶがある。", "スミレには，牙がある。",
                             "カラスには，長い鼻がある。", "ヤナギは，滝を登る。",
                             "トンボには，たてがみがある。"]].combine(),
                  [F, P, 1, ["ナマズには，花びらがある。", "サクラには，くちばしがある。", 
                             "インコには，年輪がある。", "ヒノキには，うろこがある。",
                             "バッタには，茎がある。"]].combine(),
                  [F, P, 2, ["ナマズは，芽を出す。", "サクラには，心臓がある。",
                             "インコには，葉がある。", "ヤナギは，ものを食べる。",
                             "トンボには，根がある。"]].combine()
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
        IO.display_instruction("【Semantic Memory実験】",
                               [["画面中央に文が１つずつ呈示されていきます。その文が正しい場合は右手の人差し指で【J】のキーを，誤っている場合は左手の人差し指で【F】のキーを，できるだけ早く押してください。すると次の文が呈示されます。", "left"]],
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
                            ID_MAIN,
                            "center");
        IO.wait_for_key(IO.KEYCODE.SPACE, do_first_trial);
    };

    // ***** ブロック最初の試行に先立って実施する処理
    // 表示領域の準備など
    // do_trialを呼ぶこと
    var do_first_trial = function () {
        var set_screen = function () {
            IO.clear(ID_MAIN);
            IO.set_element_style(ID_MAIN, { backgroundColor: WHITE });
            IO.append_element('div', ID_CENTER,
                              { width: CENTER_WIDTH, height: CENTER_HEIGHT,
                                textAlign: "center", fontSize: CENTER_FONTSIZE},
                              ID_MAIN, "center");
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
            [["＊＊", T_FIX, ID_CENTER],
             ["", T_PRE, ID_CENTER],
             [trial.sentence, -1, ID_CENTER]],
            [KEY_YES, KEY_NO],
            set_result);
    };

    // ***** キー入力があったときに呼ばれる関数
    // next_trialを呼ぶこと
    var set_result = function (keycode, rt) {
        if (keycode === KEY_YES) {
            trial.answer = "yes";
            trial.result = (trial.correct === T) ? CORRECT : ERROR;
        } else if (keycode === KEY_NO) {
            trial.answer = "no";
            trial.result = (trial.correct === T) ? ERROR : CORRECT;
        }
        trial.rt = rt;
        next_trial();
    };

    // ***** 次の試行に進む処理
    // ブロックが終わりならblock_epilogue、そうでなければdo_trialを呼ぶこと
    var next_trial = function (keycode, rt) {
        var advance = function () {
                t = t + 1;
            if (t >= block.trials.length) {
                t = 0; b = b + 1; IO.setTimeout(block_epilogue, T_ITI);
            } else {
                IO.setTimeout(do_trial, T_ITI);
            }
        };

        IO.clear(ID_CENTER);
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
                var sum = 0, rt = [];
                if (block.type !== 'experiment') { return; }
                // 試行番号順にRTを整理
                block.trials.forEach(function (trial) {
                    if (trial.result === CORRECT) {
                        sum += 1;
                        rt[trial.n] = trial.rt;
                    } else {
                        rt[trial.n] = "";
                    }
                });
                // 出力
                string += [id, sex, sum].join(DELIMITER);
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
                    string += [block.name, trial.n, trial.sentence,
                               trial.correct, trial.type, trial.distance,
                               trial.answer, trial.result,
                               trial.rt].join(DELIMITER) + "\n";
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
