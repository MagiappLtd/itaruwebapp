// Ponzo
//
// ポンゾ錯視(参加者間)

var EXP = (function () {
    // ***** 必須の変数・定数
    var TITLE = "ponzo_between";        // 結果データを保存するディレクトリ名に使われる
    var SAVE_STYLE = "summary";         // "verbose"だと詳細形式で保存
    var DELIMITER = "\t";               // 結果データのデリミタ
    var id, sex;        // 参加者情報
    var b = 0;          // 実行中のblock番号(0からblocks.length-1まで)
    var block;          // 実行中のblock
    var t = 0;          // 実行中のtrial番号(0からblock.trials.length-1まで)
    var start_time;
    var end_time;

    // ***** 実験固有の変数・定数
    var ID_MAIN = "main";
    var MAIN_WIDTH = "800px";           // 表示領域の幅
    var MAIN_HEIGHT = "400px";  // 表示領域の高さ
    var MAIN_HEIGHT_L = "600px";        // 表示領域の高さ
    var MAIN_PADDING = "40px";  // 表示領域周囲の余白
    var CYAN = "#00FFFF";               // 表示領域の背景色(教示時)
    var WHITE = "#FFFFFF";              // 表示領域の背景色(実行時)
    var x = 10;
    var length = 10;
    var status = 0;
    var timer = 0;
    var step = 1;

    // ***** 音声・画像の定義(読込はinitで自動的に行なわれる)
    var AUDIOS = ["jajan"];
    var IMAGES = null;

    // ***** ブロック・試行・刺激の定義
    var blocks = [
        { name: "本試行",
          trials: [ { angle: 30, result: null },
                    { angle: 45, result: null },
                    { angle: 60, result: null },
                    { angle: 75, result: null } ] }
    ];
    var OPTION = { angle: ["角度",
                             [{ name: "30°", value: 30 },
                              { name: "45°", value: 45 },
                              { name: "60°", value: 60 },
                              { name: "75°", value: 75 }]] };

    // ***** 実験開始に先立って1回だけ実施する処理
    // 実験全体に共通する教示・ブロック実施順の決定など
    // block_prologueを呼ぶこと
    var prologue = function () {
        var setup = function () {
            b = 0;
        };
        var sub = function () {
            IO.clear(ID_MAIN);
            IO.display_instruction("【Ponzo錯視】",
                                   [["上下の横線が同じ長さになるよう，ボタンをクリックして調整し，その後確認ボタンを押してください。", "center"]],
                                   ID_MAIN);
            block_prologue();
        };

        setup();
        IO.select_option("条件を選んでください", ID_MAIN, OPTION, sub);
    };


    // ***** ブロックごとの開始時に実施する処理
    // ブロックごとの教示・試行実施順の決定など
    // do_first_trialを呼ぶこと
    var block_prologue = function () {
        var setup = function () {
            var trials = [];
            block = blocks[b];
            // 選択した角度の試行だけ実施する
            block.trials.forEach(function(trial) {
                if (trial.angle === OPTION.angle.value) {
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
            str = "<p>上下の横線が同じになるようボタンをクリックして調節し、" +
                "その後確認ボタンを押してください。</p>" +
                "<canvas id='cvs' width='800px' height='500px'></canvas>" +
                "<form name='control' width='800px' height='50px'>" +
                "<input type='button' name='left' value='<<'>" +
                "<input type='button' name='right' value='>>'>" +
                "<input type='button' name='confirm' value='確認'>" +
                "<input type='text' name='diff' value = '' size='5'>" +
                "<input type='button' name='finish' value='終了'>" +
                "</form>";
            IO.set_html(str, ID_MAIN);
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
        x = 10;
        length = 10;
        status = 0;
        draw();
    };

    var move_left = function () {
        if (status == 0) {
            status = 1;
            step = -1;
            enlarge();
        }
    };

    var move_right = function () {
        if (status == 0) {
            status = 1
            step = 1;
            enlarge();
        }
    };

    var enlarge = function () {
        if (status == 1) {
            length = length + step;
            if (length <= -200) {
                length = -200;
            } else if (length >= 200) {
                length = 200;
            }
            draw();
            timer = setTimeout(enlarge, 100);
        } else {
            clearTimeout(timer);
        }
    };

    var stop = function () {
        clearTimeout(timer);
        status = 0;
    };

    var draw = function () {
        var angle = trial.angle;
        var xoffset = 400 * Math.sin(angle/2 * Math.PI/180) /
            Math.cos(angle/2 * Math.PI/180);
        var canvas = document.getElementById('cvs').getContext('2d');

        canvas.clearRect(0, 0, 800, 500);
        canvas.beginPath();
        canvas.lineWidth = 2;
        canvas.strokeStyle = "#000000";
        canvas.moveTo(400, 50);
        canvas.lineTo(400 - xoffset, 450);
        canvas.moveTo(400, 50);
        canvas.lineTo(400 + xoffset, 450);
        canvas.moveTo(370, 200);
        canvas.lineTo(430, 200);
        canvas.moveTo(400, 300)
        canvas.lineTo(400 - Math.floor(length / 2), 300);
        canvas.moveTo(400, 300)
        canvas.lineTo(400 + Math.floor(length / 2), 300);

        canvas.stroke();
    };

    var confirm = function () {
        var diff;
        var canvas = document.getElementById("cvs").getContext("2d");

        canvas.beginPath();
        canvas.lineWidth = 2;
        canvas.strokeStyle = "#ff0000";
        canvas.moveTo(370, 0);
        canvas.lineTo(370, 470);
        canvas.moveTo(430, 0);
        canvas.lineTo(430, 470);
        canvas.stroke();

        AUDIOS["jajan"].play();

        diff = length - 60;
        document.control.diff.value = diff;
    };

    // ***** 次の試行に進む処理
    // ブロックが終わりならblock_epilogue、そうでなければdo_trialを呼ぶ
    var next_trial = function () {
        var advance = function () {
            t = t + 1;
            if (t >= block.trials.length) {
                t = 0; b = b + 1; IO.setTimeout(block_epilogue, 0);
            } else {
                IO.setTimeout(do_trial(), 0);
            }
        };

        if (document.control.diff.value === "") { return false; }
        trial.result = document.control.diff.value;
        return advance();
    };

    // ***** ブロック終了時に実施する処理
    // 実験が終わりならblock_prologue、そうでなければepilogueを呼ぶ
    // この関数が呼ばれた時点でbとtは既に進められているので注意
    // (blockとtrialは更新されていない)
    var block_epilogue = function () {
        var set_screen = function () {
            IO.clear(ID_MAIN);
            IO.set_element_style(ID_MAIN, { backgroundColor: CYAN,
                                            height: MAIN_HEIGHT,
                                            textAlign: "center" } );
            IO.center_element(ID_MAIN);
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
        if (typeof SAVE_STYLE === 'undefined' || SAVE_STYLE !== 'verbose') {
            blocks.forEach(function (block) {
                block.trials.forEach(function (trial) {
                    string += [id, sex, trial.angle, trial.result].join(DELIMITER) + "\n";
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
                               trial.angle, trial.result].join(DELIMITER) + "\n";
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
