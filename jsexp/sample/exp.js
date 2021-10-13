// sample
//
// 注視点呈示のあと文字を1つ呈示し、スペースキーが押されるまでのRTを測定する。

DEBUG = false;

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "sample";       // 結果データを保存するディレクトリ名に使われる
    var id, sex;        // 参加者情報
    var b = 0;          // 実行中のblock番号(0からblocks.length-1まで)
    var block;          // 実行中のblock
    var t = 0;          // 実行中のtrial番号(0からblock.trials.length-1まで)
    var trial;          // 実行中のtrial
    var start_time;
    var end_time;

    // ***** 実験固有の変数・定数
    var T_FIX = 200;            // 注視点呈示時間(ms)
    var T_BLANK = 200;          // 注視点から刺激までのISI(ms)
    var T_ITI = 1000;           // 試行間間隔(ms)
    var TIMEOUT = 500;          // 制限時間(ms)
    var NO_TIMEOUT = -1;        // 制限時間なしを表す値
    var ID_MAIN = "main";       // 表示領域のID
    var MAIN_WIDTH = "800px";   // 表示領域の幅
    var MAIN_HEIGHT = "400px";  // 表示領域の高さ
    var MAIN_PADDING = "40px";  // 表示領域周囲の余白
    var CYAN = "#00FFFF";       // 表示領域の背景色
    var WHITE = "#FFFFFF";      // 表示領域の背景色
    var ID_CENTER = "center";   // 刺激呈示領域のID
    var CENTER_WIDTH = "80px";  // 刺激呈示領域の幅
    var CENTER_HEIGHT = "80px"; // 刺激呈示領域の高さ
    var CENTER_FONTSIZE = "80px";       // 刺激呈示領域のフォントサイズ
    var PRACTICE = "practice";
    var EXPERIMENT = "experiment";

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)

    // ***** ブロック・試行・刺激の定義
    var blocks = [
        { name: "練習",
          type: PRACTICE,
          timeout: NO_TIMEOUT,
          trials: [ { letter: "A", rt: undefined },
                    { letter: "B", rt: undefined },
                    { letter: "D", rt: undefined } ] },
        { name: "本試行1",
          type: EXPERIMENT,
          timeout: NO_TIMEOUT,
          trials: [ { letter: "A", rt: undefined },
                    { letter: "D", rt: undefined },
                    { letter: "F", rt: undefined } ] },
        { name: "本試行2",
          type: EXPERIMENT,
          timeout: TIMEOUT,
          trials: [ { letter: "B", rt: undefined },
                    { letter: "E", rt: undefined },
                    { letter: "G", rt: undefined } ] }
    ];

    // ***** 実験開始に先立って1回だけ実施する処理
    // 実験全体に共通する教示・ブロック実施順の決定など
    // block_prologueを呼ぶこと
    var prologue = function () {
        var setup = function () {
            b = 0;
        };
        var set_screen = function () {
            IO.clear(ID_MAIN);
            IO.display_instruction("【サンプル実験】",
                                   ["画面に+が表示されたあとアルファベットが1つ表示されます。表示されたらできるだけ早くスペースキーを押してください。ブロックによっては制限時間がある場合があります。"], 
                                   ID_MAIN);
        };

        setup();
        set_screen();
        return block_prologue();
    };

    // ***** ブロックごとの開始時に実施する処理
    // ブロックごとの教示・試行実施順の決定など
    // do_first_trialを呼ぶこと
    var block_prologue = function () {
        var setup = function () {
            block = blocks[b];
            t = 0;
        };

        setup();
        if (block.type === PRACTICE) {
            IO.append_paragraph("スペースキーを押すと練習を開始します。制限時間はありません。",
                                ID_MAIN, { textAlign: "center" });
        } else if (block.type === EXPERIMENT) {
            IO.append_paragraph("スペースキーを押すと" + b + "番目のブロックを開始します。",
                                ID_MAIN, { textAlign: "center" });
            if (block.timeout === NO_TIMEOUT) {
                msg = "このブロックに制限時間はありません。";
            } else {
                msg = "このブロックには制限時間があり、" + (block.timeout / 1000) +
                    "秒以内にキーを押さないと自動的に次の課題が始まります。";
            }
            IO.append_paragraph(msg, ID_MAIN, { textAlign: "center" });
        }
        IO.wait_for_key(IO.KEYCODE.SPACE, do_first_trial);
    };

    // ***** ブロック最初の試行に先立って実施する処理
    // 表示領域の準備など
    // do_trialを呼ぶこと
    var do_first_trial = function () {
        var set_screen = function () {
            IO.clear(ID_MAIN);
            IO.set_element_style(ID_MAIN, { backgroundColor: WHITE });
            IO.append_element("div", ID_CENTER,
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
            [["＊", T_FIX, ID_CENTER],
             ["", T_BLANK, ID_CENTER],
             [trial.letter, block.timeout, ID_CENTER]],
            IO.KEYCODE.SPACE,
            set_reaction);
    };

    // ***** キー入力があったときに呼ばれる関数
    // next_trialを呼ぶ
    var set_reaction = function (keycode, rt) {
        trial.rt = rt;
        if (keycode === IO.KEYCODE.TIMEOUT) {
            trial.rt = -1;
        }
        return next_trial();
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
                IO.setTimeout(do_trial, T_ITI);
            }
        };

        IO.clear(ID_CENTER);
        return advance();
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

        set_screen();
        return advance();
    };

    // ***** 全ブロック終了時に1回だけ実施する処理
    // データ保存など
    var epilogue = function () {
        var string = "";

        end_time = new Date();
        string = [id, sex].join();
        blocks.forEach(function (block) {
            var average = 0, timeout = 0;

            block.trials.forEach(function (trial) {
                if (trial.rt > 0) {
                    average += trial.rt;
                } else {
                    timeout += 1;
                }
            });
            if ((block.trials.length - timeout) > 0) {
                average = Math.floor(average / (block.trials.length - timeout));
            }
            string += "," + [block.timeout, average, timeout].join();
        });
        string += "\n";
        IO.save_data(TITLE, "", string, ID_MAIN, "append");
    };

    // ***** EXPオブジェクトの定義 通常は編集不要
    var that = {};
    that.init = function () {
        var load_images = function (i, s) {
            id = i; sex = s;
            if (typeof IMAGES !== 'undefined') { return IO.load_images(IMAGES, load_audios); }
            else { return load_audios(); }
        };
        var load_audios = function (obj) {
            if (typeof obj !== 'undefined') { IMAGES = obj; }
            if (typeof AUDIOS !== 'undefined') { return IO.load_audios(AUDIOS, start); }
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
