// Poggendorff between
//
// ポッゲンドルフ錯視(被験者間)

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "poggendorff_between";  // 結果データを保存するディレクトリ名に使われる
    var SAVE_STYLE = "summary";         // "verbose"だと詳細形式で保存
    var DELIMITER = "\t";               // 結果データのデリミタ
    var id, sex;        // 参加者情報
    var b = 0;          // 実行中のblock番号(0からblocks.length-1まで)
    var block;          // 実行中のblock
    var t = 0;          // 実行中のtrial番号(0からblock.trials.length-1まで)
    var start_time;
    var end_time;
    var condition;

    // ***** 実験固有の変数・定数
    var ID_MAIN = "main";
    var MAIN_WIDTH = "800px";           // 表示領域の幅
    var MAIN_HEIGHT = "400px";  // 表示領域の高さ
    var MAIN_HEIGHT_L = "720px";        // 表示領域の高さ
    var MAIN_PADDING = "40px";  // 表示領域周囲の余白
    var CYAN = "#00FFFF";               // 表示領域の背景色(教示時)
    var WHITE = "#FFFFFF";              // 表示領域の背景色(実行時)
    var length = 0;
    var status = 0;
    var timer = 0;
    var step = 1;

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    var AUDIOS = ["jajan"];
    var IMAGES = null;

    // ***** ブロック・試行・刺激の定義
    var make_trials = function (src) {
        var trials = [];
        // srcは [[15, 30, 40], [15, 30, 80], ...]
        src.forEach(function (s) {
            trials.push( { angle: s[0], width: s[1], length: s[2], result: null } );
        });
        return trials;
    };

    var blocks = [
        { name: "本試行",
          trials: make_trials(
              [ [15, 30, 45, 60], [40, 80, 120], [30, 50, 70] ].combine()
          )
        }
    ];

    var OPTION = { angle: ["角度",
                             [{ name: "15°", value: 15 },
                              { name: "30°", value: 30 },
                              { name: "45°", value: 45 },
                              { name: "60°", value: 60 }]],
                   width: ["幅",
                            [{ name: "狭", value: 40 },
                             { name: "中", value: 80 },
                             { name: "広", value: 120 }]],
                   length: ["長さ",
                           [{ name: "短", value: 30 },
                            { name: "中", value: 50 },
                            { name: "長", value: 70 }]]
                 };

    // ***** 実験開始に先立って1回だけ実施する処理
    // 実験全体に共通する教示・ブロック実施順の決定など
    // block_prologueを呼ぶこと
    var prologue = function () {
        IO.select_option("条件を選んでください", ID_MAIN, OPTION, prologue2);
    };

    var prologue2 = function () {
        b = 0;

        IO.clear(ID_MAIN);
        IO.display_instruction("【Poggendorff錯視】",
                               [["左右の斜線が一直線になるようボタンをクリックして調整し，その後確認ボタンを押してください。", "center"]],
                               ID_MAIN);
        block_prologue();
    };

    // ***** ブロックごとの開始時に実施する処理
    // ブロックごとの教示・試行実施順の決定など
    // do_first_trialを呼ぶこと
    var block_prologue = function () {
        var setup = function () {
            var trials = [];

            block = blocks[b];
            // 選択した角度・長さ・幅の試行だけ実施する
            block.trials.forEach(function (trial) {
                if (trial.angle === OPTION.angle.value &&
                    trial.length === OPTION.length.value &&
                    trial.width === OPTION.width.value) {
                    trials.push(trial);
                }
            });
            block.trials = trials.shuffle();
            t = 0;
        };

        setup();
        IO.append_paragraph("スペースキーを押すと実験を開始します。" +
                            "全部で" + block.trials.length + "試行あります。",
                            ID_MAIN, "center");
        IO.wait_for_key(IO.KEYCODE.SPACE, do_first_trial);
    };

    // ***** ブロック最初の試行に先立って実施する処理
    // 表示領域の準備など
    // do_trialを呼ぶこと
    var do_first_trial = function () {
        var set_screen = function () {
            IO.set_element_style(ID_MAIN, { backgroundColor: WHITE,
                                            textAlign: "center",
                                            height: MAIN_HEIGHT_L });
            IO.center_element(ID_MAIN);
            IO.set_html("<p>左右の斜線が一直線になるようボタンをクリックして調整し，" +
                        "その後確認ボタンを押してください。</p>" +
                        "<canvas id='cvs' width='600px' height='620px'></canvas>" +
                        "<form name='control' width='600px' height='50px'>" +
                        "<input type='button' name='left' value='<<'>" +
                        "<input type='button' name='right' value='>>'>" +
                        "<input type='button' name='confirm' value='確認'>" +
                        "<input type='text' name='diff' value = '' size='5'>" +
                        "<input type='button' name='finish' value='終了'>" +
                        "</form>", ID_MAIN);
            document.control.left.onmousedown = move_left;
            document.control.left.onmouseup = stop;
            document.control.right.onmousedown = move_right;
            document.control.right.onmouseup = stop;
            document.control.confirm.onclick = confirm;
            document.control.finish.onclick = next_trial;
        };

        set_screen();
        IO.setTimeout(do_trial, 0);
    };

    // ***** 1試行の実施
    var do_trial = function () {
        var setup = function () {
            trial = block.trials[t];
        };

        setup();
        document.control.diff.value = "";
        length = 0;
        status = 0;
        draw();
        if (DEBUG) {
            document.control.diff.value = IO.make_random_number(-20, 20);
            IO.setTimeout(next_trial, 0);
        }
    };

    var move_left = function () {
        if (status == 0) {
            status = 1;
            step = 1;
            lengthen();
        }
    };

    var move_right = function () {
        if (status == 0) {
            status = 1;
            step = -1;
            lengthen();
        }
    };

    var lengthen = function () {
        if (status == 1) {
            length = length + step;
            if (length <= -600) {
                length = -600;
            } else if (length >= 108) {
                length = 108;
            }
            draw();
            timer = setTimeout(lengthen, 100);
        } else {
            clearTimeout(timer);
        }
    };

    var stop = function () {
        clearTimeout(timer);
        status = 0;
    };

    var draw = function () {
        var canvas = document.getElementById('cvs').getContext('2d');
        var xoffset = trial.length * Math.sin(trial.angle * Math.PI / 180);
        var yoffset = trial.length * Math.cos(trial.angle * Math.PI / 180);

        canvas.clearRect(0, 60, 600, 550); 
        canvas.beginPath();
        canvas.lineWidth = 2;
        canvas.strokeStyle = "#000000";
        canvas.moveTo(300 - trial.width / 2, 140);
        canvas.lineTo(300 - trial.width / 2, 540);
        canvas.moveTo(300 + trial.width / 2, 140);
        canvas.lineTo(300 + trial.width / 2, 540);

        canvas.moveTo(300 - trial.width / 2, 440 + length);
        canvas.lineTo(300 - trial.width / 2 - xoffset, 440 + length + yoffset);
        canvas.moveTo(300 + trial.width / 2, 240 - length);
        canvas.lineTo(300 + trial.width / 2 + xoffset, 240 - length - yoffset);

        canvas.stroke();
    };

    var confirm = function () {
        var diff, y, confi;
        var canvas = document.getElementById("cvs").getContext("2d");

        confi = 200 * Math.tan(trial.angle * Math.PI / 180);
        y = trial.width / (2 * Math.tan(trial.angle * Math.PI / 180));
        y = Math.floor(y);
        y = 340 + y;
        diff = Math.round((2 * (y - (440 + length))) * 100) / 100;
        document.control.diff.value = diff;

        canvas.beginPath();
        canvas.lineWidth=2;
        canvas.strokeStyle="#ff0000";
        canvas.moveTo(300 + confi, 140);
        canvas.lineTo(300 - confi, 540);
        canvas.stroke();

        AUDIOS["jajan"].play();
    };

    // ***** 次の試行に進む処理
    // ブロックが終わりならblock_epilogue、そうでなければdo_trialを呼ぶ
    var next_trial = function () {
        var advance = function () {
            t = t + 1;
            if (t >= block.trials.length) {
                t = 0; b = b + 1; IO.setTimeout(block_epilogue, 0);
            } else {
                IO.setTimeout(do_trial, 0);
            }
        };

        if (document.control.diff.value === "") { return false; }
        trial.result = document.control.diff.value;
        advance();
    };

    // ***** ブロック終了時に実施する処理
    // 実験が終わりならblock_prologue、そうでなければepilogueを呼ぶ
    // この関数が呼ばれた時点でbとtは既に進められているので注意
    // (blockとtrialは更新されていない)
    var block_epilogue = function () {
        var set_screen = function () {
            IO.clear(ID_MAIN);
            IO.set_element_style(ID_MAIN, { backgroundColor: CYAN,
                                            textAlign: "center",
                                            height: MAIN_HEIGHT } );
            IO.center_element(ID_MAIN);
        };
        var advance = function () {
            if (b < blocks.length) { block_prologue(); }
            else { epilogue(); }
        };

        set_screen();
        advance();
    };

    // ***** 全ブロック終了時に1回だけ実施する処理
    // データ保存など
    var epilogue = function () {
        var string = "";

        end_time = new Date();
        if (typeof SAVE_STYLE === 'undefined' || SAVE_STYLE !== 'verbose') {
            blocks.forEach(function (block) {
                block.trials.forEach(function (trial) {
                    string += [id, sex,
                               trial.angle, trial.width, trial.length,
                               trial.result].join(DELIMITER) + "\n";
                });
            });
            IO.save_data(TITLE, "", string, ID_MAIN, 'append');
        } else {
            string += "### " + TITLE + "\n";
            string += "### id = " + id + " sex = " + sex + "\n";
            string += "### start: " + start_time + "\n";
            blocks.forEach(function (block) {
                block.trials.forEach(function (trial) {
                    string += [block.name,
                               trial.angle, trial.width, trial.length,
                               trial.result].join(DELIMITER) + "\n";
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
